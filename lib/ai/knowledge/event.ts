import {
  events,
  worlds,
  eventLocations,
  eventCharacters,
  eventPlayers,
  eventItems,
} from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { CreateWorldEventItem, UIEvent, UIEventWithRelations } from "./types";
import { db } from "@/lib/db/client";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

const SIMILARITY_THRESHOLD = 0.3; // TODO: tune this

// Add a new event to the knowledge base
export const addEventToKnowledge = async (
  world: typeof worlds.$inferSelect,
  event: CreateWorldEventItem
) => {
  // Make sure the event has at least one of location, character, player, or item
  if (
    (!event.locations || event.locations.length === 0) &&
    (!event.characters || event.characters.length === 0) &&
    (!event.players || event.players.length === 0) &&
    (!event.items || event.items.length === 0)
  ) {
    console.log(
      "Attempted to add event with no location, character, player, or item"
    );
    return "Error adding event! Event must have at least one of location, character, player, or item";
  }

  console.log(`Adding event to knowledge base`);

  try {
    const embedding = await embedKnowledgeItem({
      type: "world_event",
      ...event,
    });
    console.log(`Embedding created successfully`);

    const [createdEvent] = await db
      .insert(events)
      .values({
        description: event.description,
        shortDescription: event.shortDescription,
        worldId: world.id,
        embedding: embedding.embedding,
      })
      .returning();

    console.log(`Event added to knowledge base with id ${createdEvent.id}`);

    // Insert junction table records for each reference type
    if (event.locations && event.locations.length > 0) {
      await db.insert(eventLocations).values(
        event.locations.map((locationId) => ({
          eventId: createdEvent.id,
          locationId,
        }))
      );
    }

    if (event.characters && event.characters.length > 0) {
      await db.insert(eventCharacters).values(
        event.characters.map((characterId) => ({
          eventId: createdEvent.id,
          characterId,
        }))
      );
    }

    if (event.players && event.players.length > 0) {
      await db.insert(eventPlayers).values(
        event.players.map((playerId) => ({
          eventId: createdEvent.id,
          playerId,
        }))
      );
    }

    if (event.items && event.items.length > 0) {
      await db.insert(eventItems).values(
        event.items.map((itemId) => ({
          eventId: createdEvent.id,
          itemId,
        }))
      );
    }

    console.log(`Event relationships added to knowledge base`);

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
      shortDescription: events.shortDescription,
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
): Promise<UIEvent[]> => {
  const query = db
    .select({
      id: events.id,
      createdAt: events.createdAt,
      description: events.description,
      shortDescription: events.shortDescription,
      worldId: events.worldId,
    })
    .from(events)
    .innerJoin(eventLocations, eq(events.id, eventLocations.eventId))
    .where(eq(eventLocations.locationId, locationId))
    .orderBy(desc(events.createdAt));

  const result = limit ? await query.limit(limit) : await query;
  return result;
};

export const getEventsForCharacter = async (
  characterId: number,
  limit?: number
): Promise<UIEvent[]> => {
  const query = db
    .select({
      id: events.id,
      createdAt: events.createdAt,
      description: events.description,
      shortDescription: events.shortDescription,
      worldId: events.worldId,
    })
    .from(events)
    .innerJoin(eventCharacters, eq(events.id, eventCharacters.eventId))
    .where(eq(eventCharacters.characterId, characterId))
    .orderBy(desc(events.createdAt));

  return limit ? await query.limit(limit) : await query;
};

export const getEventsForPlayer = async (
  playerId: number,
  limit?: number
): Promise<UIEvent[]> => {
  const query = db
    .select({
      id: events.id,
      createdAt: events.createdAt,
      description: events.description,
      shortDescription: events.shortDescription,
      worldId: events.worldId,
    })
    .from(events)
    .innerJoin(eventPlayers, eq(events.id, eventPlayers.eventId))
    .where(eq(eventPlayers.playerId, playerId))
    .orderBy(desc(events.createdAt));

  const result = limit ? await query.limit(limit) : await query;
  return result;
};

export const getEventsForItem = async (
  itemId: number,
  limit?: number
): Promise<UIEvent[]> => {
  const query = db
    .select({
      id: events.id,
      createdAt: events.createdAt,
      description: events.description,
      shortDescription: events.shortDescription,
      worldId: events.worldId,
    })
    .from(events)
    .innerJoin(eventItems, eq(events.id, eventItems.eventId))
    .where(eq(eventItems.itemId, itemId))
    .orderBy(desc(events.createdAt));

  return limit ? await query.limit(limit) : await query;
};

export const getAllEventsInWorld = async (
  worldId: number,
  limit?: number
): Promise<UIEventWithRelations[]> => {
  const result = await db.query.events.findMany({
    where: eq(events.worldId, worldId),
    orderBy: desc(events.createdAt),
    limit,
    with: {
      locations: {
        with: {
          location: true,
        },
      },
      characters: {
        with: {
          character: true,
        },
      },
      players: {
        with: {
          player: true,
        },
      },
      items: {
        with: {
          item: true,
        },
      },
    },
  });
  return result;
};
