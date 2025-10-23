import { events, worlds } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { WorldEventItem } from "./types";
import { db } from "@/lib/db/client";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

const SIMILARITY_THRESHOLD = 0.3; // TODO: tune this

// Add a new event to the knowledge base
export const addEventToKnowledge = async (
  world: typeof worlds.$inferSelect,
  event: WorldEventItem
) => {
  // Make sure the event has at least one of location, character, or player
  if (!event.location && !event.character && !event.player) {
    console.log(
      "Attempted to add event with no location, character, or player"
    );
    return "Error adding event! Event must have at least one of location, character, or player";
  }

  console.log(`Adding event to knowledge base`);

  try {
    const embedding = await embedKnowledgeItem(event);
    console.log(`Embedding created successfully`);

    const [createdEvent] = await db
      .insert(events)
      .values({
        description: event.description,
        locationId: event.location ?? null,
        characterId: event.character ?? null,
        playerId: event.player ?? null,
        worldId: world.id,
        embedding: embedding.embedding,
      })
      .returning();

    console.log(`Event added to knowledge base with id ${createdEvent.id}`);

    return createdEvent;
  } catch (error) {
    console.error("Error adding event to knowledge base:", error);
    console.error("Event data:", JSON.stringify(event, null, 2));

    return `Error adding event! ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
};

export async function searchForEvent(
  world: typeof worlds.$inferSelect,
  query: string,
  limit: number = 10
) {
  console.log(`Searching for event: '${query}'`);

  const queryEmbedding = await getEmbedForQuery(query);

  // use Drizzle's built in vector functions to generate query
  // https://orm.drizzle.team/docs/guides/vector-similarity-search
  const similarity = sql<number>`1 - (${cosineDistance(
    events.embedding,
    queryEmbedding.embedding
  )})`;

  return await db
    .select({
      id: events.id,
      createdAt: events.createdAt,
      description: events.description,
      locationId: events.locationId,
      characterId: events.characterId,
      playerId: events.playerId,
      worldId: events.worldId,
      similarity,
    })
    .from(events)
    .where(
      and(gt(similarity, SIMILARITY_THRESHOLD), eq(events.worldId, world.id))
    )
    .orderBy((t) => desc(t.similarity))
    .limit(limit);
}

export const getEventsForLocation = async (
  locationId: number,
  limit?: number
) => {
  return await db.query.events.findMany({
    where: eq(events.locationId, locationId),
    orderBy: desc(events.createdAt),
    limit,
  });
};

export const getEventsForCharacter = async (
  characterId: number,
  limit?: number
) => {
  return await db.query.events.findMany({
    where: eq(events.characterId, characterId),
    orderBy: desc(events.createdAt),
    limit,
  });
};

export const getEventsForPlayer = async (playerId: number, limit?: number) => {
  return await db.query.events.findMany({
    where: eq(events.playerId, playerId),
    orderBy: desc(events.createdAt),
    limit,
  });
};
