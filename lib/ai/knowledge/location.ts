import { locations, worlds } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { WorldLocationItem } from "./types";
import { db } from "@/lib/db/client";
import { generateImage } from "../image/generateImage";
import { after } from "next/server";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

const SIMILARITY_THRESHOLD = 0.3; // TODO: tune this

// Add a new location to the knowledge base
export const addLocationToKnowledge = async (
  world: typeof worlds.$inferSelect,
  location: WorldLocationItem
) => {
  console.log(`Adding location ${location.name} to knowledge base`);

  const embedding = await embedKnowledgeItem(location);
  const [createdLocation] = await db
    .insert(locations)
    .values({
      worldId: world.id,
      name: location.name,
      description: location.description,
      embedding: embedding.embedding,
    })
    .returning();

  // Generate an image in the background after the location is created
  after(async () => {
    console.log(`Generating image for location ${createdLocation.name}`);

    const imageUrl = await generateImage(createdLocation.description);
    await db
      .update(locations)
      .set({
        imageUrl,
      })
      .where(eq(locations.id, createdLocation.id));

    console.log(
      `Image generated for location ${createdLocation.name}! Saved to ${imageUrl}`
    );
  });
};

export async function searchForLocation(
  world: typeof worlds.$inferSelect,
  query: string,
  limit: number = 10
) {
  console.log(`Searching for location: '${query}'`);

  const queryEmbedding = await getEmbedForQuery(query);

  // use Drizzle's built in vector functions to generate query
  // https://orm.drizzle.team/docs/guides/vector-similarity-search
  const similarity = sql<number>`1 - (${cosineDistance(
    locations.embedding,
    queryEmbedding.embedding
  )})`;

  return await db
    .select({
      id: locations.id,
      createdAt: locations.createdAt,
      name: locations.name,
      description: locations.description,
      imageUrl: locations.imageUrl,
      worldId: locations.worldId,
      similarity,
    })
    .from(locations)
    .where(
      and(gt(similarity, SIMILARITY_THRESHOLD), eq(locations.worldId, world.id))
    )
    .orderBy((t) => desc(t.similarity))
    .limit(limit);
}

export const updateLocation = async (
  world: typeof worlds.$inferSelect,
  locationId: number,
  location: WorldLocationItem
) => {
  console.log(`Updating location ${location.name} in knowledge base`);

  const embedding = await embedKnowledgeItem(location);
  await db
    .update(locations)
    .set({
      name: location.name,
      description: location.description,
      embedding: embedding.embedding,
    })
    .where(and(eq(locations.id, locationId), eq(locations.worldId, world.id)));
};

export const getLocationById = async (id: number) => {
  return await db.query.locations.findFirst({
    where: eq(locations.id, id),
  });
};
