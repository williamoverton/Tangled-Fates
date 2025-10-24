import { items, worlds } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { CreateWorldItemItem, WorldItemItem } from "./types";
import { db } from "@/lib/db/client";
import { generateImage } from "../image/generateImage";
import { after } from "next/server";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

const SIMILARITY_THRESHOLD = 0.3; // TODO: tune this

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
