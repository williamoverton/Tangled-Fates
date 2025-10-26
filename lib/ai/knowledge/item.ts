import { items, worlds, eventItems } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { CreateWorldItemItem, WorldItemItem } from "./types";
import { db } from "@/lib/db/client";
import { generateImage } from "../image/generateImage";
import { after } from "next/server";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { generateObject } from "ai";
import { z } from "zod";
import dedent from "dedent";

const SIMILARITY_THRESHOLD = 0.2; // TODO: tune this

// Helper function to merge two entities using AI
const mergeEntitiesWithAI = async (
  entity1: { name: string; description: string },
  entity2: { name: string; description: string }
) => {
  return await generateObject({
    schema: z.object({
      name: z.string(),
      description: z.string(),
    }),
    model: "anthropic/claude-haiku-4.5",
    system: dedent`
      You are an item merge expert. You are given two items and you need to merge them into one.
      Sometimes two items are created by accident when an item is introduced without a name.
      In this case you need to merge the items into one and return the new item name and description.

      You'll be given the name and description of two items and you need to merge them into one.
      If one is far less detailed than the other, use the more detailed one as the base and add the other one's details to it.
    `,
    prompt: dedent`
      The two items are:
      <ITEM_1>
      ${entity1.name}
      ${entity1.description}
      </ITEM_1>
      <ITEM_2>
      ${entity2.name}
      ${entity2.description}
      </ITEM_2>

      Please merge these two items into one. Return the merged item name and description.
    `,
  });
};

// Add a new item to the knowledge base
export const addItemToKnowledge = async (
  world: typeof worlds.$inferSelect,
  item: CreateWorldItemItem
) => {
  console.log(`Adding item ${item.name} to knowledge base`);

  const embedding = await embedKnowledgeItem({
    type: "world_item",
    ...item,
  });

  try {
    const [createdItem] = await db
      .insert(items)
      .values({
        worldId: world.id,
        name: item.name,
        description: item.description,
        embedding: embedding.embedding,
      })
      .returning();

    console.log(`Item added to knowledge base with id ${createdItem.id}`);

    // Revalidate cache for items in this world
    revalidateTag(`items-${world.id}`, "max");

    // Generate an image in the background after the item is created
    after(async () => {
      console.log(`Generating image for item ${createdItem.name}`);

      const imageUrl = await generateImage(createdItem.description);
      await db
        .update(items)
        .set({
          imageUrl,
        })
        .where(eq(items.id, createdItem.id));

      console.log(
        `Image generated for item ${createdItem.name}! Saved to ${imageUrl}`
      );
    });

    return createdItem;
  } catch (error) {
    console.error("Error adding item to knowledge base:", error);
    console.error("Item data:", JSON.stringify(item, null, 2));
    return `Error adding item! ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
};

export async function searchForItem(
  world: typeof worlds.$inferSelect,
  query: string,
  limit: number = 10
) {
  console.log(`Searching for item: '${query}'`);

  const queryEmbedding = await getEmbedForQuery(query);

  // use Drizzle's built in vector functions to generate query
  // https://orm.drizzle.team/docs/guides/vector-similarity-search
  const similarity = sql<number>`1 - (${cosineDistance(
    items.embedding,
    queryEmbedding.embedding
  )})`;

  return await db
    .select({
      id: items.id,
      createdAt: items.createdAt,
      name: items.name,
      description: items.description,
      imageUrl: items.imageUrl,
      worldId: items.worldId,
      similarity,
    })
    .from(items)
    .where(
      and(gt(similarity, SIMILARITY_THRESHOLD), eq(items.worldId, world.id))
    )
    .orderBy((t) => desc(t.similarity))
    .limit(limit);
}

export const updateItem = async (
  world: typeof worlds.$inferSelect,
  itemId: number,
  item: CreateWorldItemItem
) => {
  console.log(`Updating item ${item.name} in knowledge base`);

  const embedding = await embedKnowledgeItem({
    type: "world_item",
    ...item,
  });

  await db
    .update(items)
    .set({
      name: item.name,
      description: item.description,
      embedding: embedding.embedding,
    })
    .where(and(eq(items.id, itemId), eq(items.worldId, world.id)));

  // Revalidate cache for this specific item and items in this world
  revalidateTag(`item-${itemId}`, "max");
  revalidateTag(`items-${world.id}`, "max");
};

export const getItemById = async (id: number) => {
  return await db.query.items.findFirst({
    where: eq(items.id, id),
  });
};

export const getAllItemsInWorld = async (worldId: number) => {
  return await db.query.items.findMany({
    where: eq(items.worldId, worldId),
  });
};

// Sometimes two items are the same thing, but have different names.
// This function merges two items into one.
// We use AI to load both items and merge them into one.
// Then we'll update any events that reference the other item to reference the correct item.
export const mergeItems = async (
  world: typeof worlds.$inferSelect,
  itemId: number,
  otherItemId: number
) => {
  const item = await getItemById(itemId);
  const otherItem = await getItemById(otherItemId);

  if (!item || !otherItem) {
    throw new Error("At least one item not found when merging items");
  }

  if (item.worldId !== otherItem.worldId) {
    throw new Error("Items are not in the same world when merging items");
  }

  console.log(`Merging items ${item.name} and ${otherItem.name}`);

  const newItem = await mergeEntitiesWithAI(
    { name: item.name, description: item.description },
    { name: otherItem.name, description: otherItem.description }
  );

  // Update the item with the new name and description
  await updateItem(world, itemId, {
    name: newItem.object.name,
    description: newItem.object.description,
  });

  // Update all events that reference the other item to reference the new item
  await db
    .update(eventItems)
    .set({
      itemId: itemId,
    })
    .where(eq(eventItems.itemId, otherItemId));

  // Delete the other item
  await db.delete(items).where(eq(items.id, otherItemId));

  // Revalidate cache for both items and items in this world
  revalidateTag(`item-${itemId}`, "max");
  revalidateTag(`item-${otherItemId}`, "max");
  revalidateTag(`items-${world.id}`, "max");
};
