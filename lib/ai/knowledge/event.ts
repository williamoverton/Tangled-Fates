import {
  events,
  worlds,
  eventLocations,
  eventCharacters,
  eventPlayers,
  eventItems,
} from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { CreateWorldEventItem, UIEventWithRelations } from "./types";
import { db } from "@/lib/db/client";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { unescapeString } from "@/lib/utils";
import { publishWorldEvent } from "@/lib/realtime/publish";

const SIMILARITY_THRESHOLD = 0.2; // TODO: tune this

// Data to get back for events including related entities to the event.
const includeColumns = {
  locations: {
    with: {
      location: {
        columns: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          imageUrl: true,
          worldId: true,
        },
      },
    },
  },
  players: {
    with: {
      player: {
        columns: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          imageUrl: true,
          worldId: true,
        },
      },
    },
  },
  items: {
    with: {
      item: {
        columns: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          imageUrl: true,
          worldId: true,
        },
      },
    },
  },
  characters: {
    with: {
      character: {
        columns: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          imageUrl: true,
          worldId: true,
        },
      },
    },
  },
} as const;

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

    // Use a transaction to ensure all operations succeed or fail together
    const result = await db.transaction(async (tx) => {
      const [createdEvent] = await tx
        .insert(events)
        .values({
          description: unescapeString(event.description),
          shortDescription: unescapeString(event.shortDescription),
          worldId: world.id,
          embedding: embedding.embedding,
        })
        .returning();

      console.log(`Event added to knowledge base with id ${createdEvent.id}`);

      // Insert junction table records for each reference type
      if (event.locations && event.locations.length > 0) {
        await tx.insert(eventLocations).values(
          event.locations.map((locationId) => ({
            eventId: createdEvent.id,
            locationId,
          }))
        );

        for (const locationId of event.locations) {
          revalidateTag(`locations-${locationId}`, "max");
        }
      }

      if (event.characters && event.characters.length > 0) {
        await tx.insert(eventCharacters).values(
          event.characters.map((characterId) => ({
            eventId: createdEvent.id,
            characterId,
          }))
        );

        for (const characterId of event.characters) {
          revalidateTag(`characters-${characterId}`, "max");
        }
      }

      if (event.players && event.players.length > 0) {
        await tx.insert(eventPlayers).values(
          event.players.map((playerId) => ({
            eventId: createdEvent.id,
            playerId,
          }))
        );

        for (const playerId of event.players) {
          revalidateTag(`players-${playerId}`, "max");
        }
      }

      if (event.items && event.items.length > 0) {
        await tx.insert(eventItems).values(
          event.items.map((itemId) => ({
            eventId: createdEvent.id,
            itemId,
          }))
        );

        for (const itemId of event.items) {
          revalidateTag(`items-${itemId}`, "max");
        }
      }

      console.log(`Event relationships added to knowledge base`);

      // Revalidate cache for events in this world
      revalidateTag(`events-${world.id}`, "max");

      return createdEvent;
    });

    // Would be nice if we could publish the event we have, but the shape is wrong. So we pass the ID and the publish function fetches the event from the database.
    await publishWorldEvent(result.id);

    return result;
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
): Promise<UIEventWithRelations[]> => {
  // First get the event IDs for this location
  const eventIds = await db
    .select({ eventId: eventLocations.eventId })
    .from(eventLocations)
    .where(eq(eventLocations.locationId, locationId));

  if (eventIds.length === 0) {
    return [];
  }

  // Then get the full events with relations
  const result = await db.query.events.findMany({
    where: (events, { inArray }) =>
      inArray(
        events.id,
        eventIds.map((e) => e.eventId)
      ),
    orderBy: desc(events.createdAt),
    limit,
    with: includeColumns,
  });

  return result;
};

export const getEventsForCharacter = async (
  characterId: number,
  limit?: number
): Promise<UIEventWithRelations[]> => {
  // First get the event IDs for this character
  const eventIds = await db
    .select({ eventId: eventCharacters.eventId })
    .from(eventCharacters)
    .where(eq(eventCharacters.characterId, characterId));

  if (eventIds.length === 0) {
    return [];
  }

  // Then get the full events with relations
  const result = await db.query.events.findMany({
    where: (events, { inArray }) =>
      inArray(
        events.id,
        eventIds.map((e) => e.eventId)
      ),
    orderBy: desc(events.createdAt),
    limit,
    with: includeColumns,
  });
  return result;
};

export const getEventsForPlayer = async (
  playerId: number,
  limit?: number
): Promise<UIEventWithRelations[]> => {
  // First get the event IDs for this player
  const eventIds = await db
    .select({ eventId: eventPlayers.eventId })
    .from(eventPlayers)
    .where(eq(eventPlayers.playerId, playerId));

  if (eventIds.length === 0) {
    return [];
  }

  // Then get the full events with relations
  const result = await db.query.events.findMany({
    where: (events, { inArray }) =>
      inArray(
        events.id,
        eventIds.map((e) => e.eventId)
      ),
    orderBy: desc(events.createdAt),
    limit,
    with: includeColumns,
  });
  return result;
};

export const getEventsForItem = async (
  itemId: number,
  limit?: number
): Promise<UIEventWithRelations[]> => {
  // First get the event IDs for this item
  const eventIds = await db
    .select({ eventId: eventItems.eventId })
    .from(eventItems)
    .where(eq(eventItems.itemId, itemId));

  if (eventIds.length === 0) {
    return [];
  }

  // Then get the full events with relations
  const result = await db.query.events.findMany({
    where: (events, { inArray }) =>
      inArray(
        events.id,
        eventIds.map((e) => e.eventId)
      ),
    orderBy: desc(events.createdAt),
    limit,
    with: includeColumns,
  });
  return result;
};

export const getAllEventsInWorld = async (
  worldId: number,
  limit?: number
): Promise<UIEventWithRelations[]> => {
  const result = await db.query.events.findMany({
    where: eq(events.worldId, worldId),
    orderBy: desc(events.createdAt),
    limit,
    with: includeColumns,
  });
  return result;
};

export const getEventById = async (
  eventId: number
): Promise<UIEventWithRelations | undefined> => {
  return await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: includeColumns,
  });
};
