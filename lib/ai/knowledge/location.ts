import { locations, worlds, eventLocations } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { CreateWorldLocationItem } from "./types";
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
      You are a location merge expert. You are given two locations and you need to merge them into one.
      Sometimes two locations are created by accident when a location is introduced without a name.
      In this case you need to merge the locations into one and return the new location name and description.

      You'll be given the name and description of two locations and you need to merge them into one.
      If one is far less detailed than the other, use the more detailed one as the base and add the other one's details to it.
    `,
    prompt: dedent`
      The two locations are:
      <LOCATION_1>
      ${entity1.name}
      ${entity1.description}
      </LOCATION_1>
      <LOCATION_2>
      ${entity2.name}
      ${entity2.description}
      </LOCATION_2>

      Please merge these two locations into one. Return the merged location name and description.
    `,
  });
};

// Add a new location to the knowledge base
export const addLocationToKnowledge = async (
  world: typeof worlds.$inferSelect,
  location: CreateWorldLocationItem
) => {
  console.log(`Adding location ${location.name} to knowledge base`);

  const embedding = await embedKnowledgeItem({
    type: "world_location",
    ...location,
  });
  const [createdLocation] = await db
    .insert(locations)
    .values({
      worldId: world.id,
      name: location.name,
      description: location.description,
      embedding: embedding.embedding,
    })
    .returning();

  // Revalidate cache for locations in this world
  revalidateTag(`locations-${world.id}`, "max");

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
  location: CreateWorldLocationItem
) => {
  console.log(`Updating location ${location.name} in knowledge base`);

  const embedding = await embedKnowledgeItem({
    type: "world_location",
    ...location,
  });
  await db
    .update(locations)
    .set({
      name: location.name,
      description: location.description,
      embedding: embedding.embedding,
    })
    .where(and(eq(locations.id, locationId), eq(locations.worldId, world.id)));

  // Revalidate cache for this specific location and locations in this world
  revalidateTag(`location-${locationId}`, "max");
  revalidateTag(`locations-${world.id}`, "max");
};

export const getLocationById = async (id: number) => {
  return await db.query.locations.findFirst({
    where: eq(locations.id, id),
  });
};

export const getAllLocationsInWorld = async (worldId: number) => {
  return await db.query.locations.findMany({
    where: eq(locations.worldId, worldId),
  });
};

// Sometimes two locations are the same place, but have different names.
// This function merges two locations into one.
// We use AI to load both locations and merge them into one.
// Then we'll update any events that reference the other location to reference the correct location.
export const mergeLocations = async (
  world: typeof worlds.$inferSelect,
  locationId: number,
  otherLocationId: number
) => {
  const location = await getLocationById(locationId);
  const otherLocation = await getLocationById(otherLocationId);

  if (!location || !otherLocation) {
    throw new Error("At least one location not found when merging locations");
  }

  if (location.worldId !== otherLocation.worldId) {
    throw new Error(
      "Locations are not in the same world when merging locations"
    );
  }

  console.log(`Merging locations ${location.name} and ${otherLocation.name}`);

  const newLocation = await mergeEntitiesWithAI(
    { name: location.name, description: location.description },
    { name: otherLocation.name, description: otherLocation.description }
  );

  // Update the location with the new name and description
  await updateLocation(world, locationId, {
    name: newLocation.object.name,
    description: newLocation.object.description,
  });

  // Update all events that reference the other location to reference the new location
  await db
    .update(eventLocations)
    .set({
      locationId: locationId,
    })
    .where(eq(eventLocations.locationId, otherLocationId));

  // Delete the other location
  await db.delete(locations).where(eq(locations.id, otherLocationId));

  // Revalidate cache for both locations and locations in this world
  revalidateTag(`location-${locationId}`, "max");
  revalidateTag(`location-${otherLocationId}`, "max");
  revalidateTag(`locations-${world.id}`, "max");
};
