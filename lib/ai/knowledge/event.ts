import { events, worlds } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { WorldEventItem } from "./types";
import { db } from "@/lib/db/client";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

const SIMILARITY_THRESHOLD = 0.5; // TODO: tune this

// Add a new event to the knowledge base
export const addEventToKnowledge = async (
  world: typeof worlds.$inferSelect,
  event: WorldEventItem
) => {
  console.log(`Adding event to knowledge base`);

  const embedding = await embedKnowledgeItem(event);
  const [createdEvent] = await db
    .insert(events)
    .values({
      name: `Event at ${new Date(event.when).toLocaleString()}`,
      description: event.description,
      locationId: event.location?.id ?? null,
      characterId: event.character?.id ?? null,
      playerId: event.player?.id ?? null,
      worldId: world.id,
      embedding: embedding.embedding,
    })
    .returning();

  console.log(`Event added to knowledge base with id ${createdEvent.id}`);

  return createdEvent;
};

export async function searchForEvent(
  world: typeof worlds.$inferSelect,
  query: string,
  limit: number = 10
) {
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
      name: events.name,
      description: events.description,
      locationId: events.locationId,
      characterId: events.characterId,
      playerId: events.playerId,
      createdAt: events.createdAt,
      similarity,
    })
    .from(events)
    .where(
      and(gt(similarity, SIMILARITY_THRESHOLD), eq(events.worldId, world.id))
    )
    .orderBy((t) => desc(t.similarity))
    .limit(limit);
}
