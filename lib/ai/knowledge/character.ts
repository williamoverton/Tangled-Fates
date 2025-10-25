import {
  characters,
  eventCharacters,
  eventPlayers,
  players,
  worlds,
} from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { CreateWorldCharacterItem } from "./types";
import { db } from "@/lib/db/client";
import { generateImage } from "../image/generateImage";
import { after } from "next/server";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { generateObject } from "ai";
import dedent from "dedent";
import { z } from "zod/v4";
import { revalidateTag } from "next/cache";
import { searchForPlayer } from "./player";

const SIMILARITY_THRESHOLD = 0.3; // TODO: tune this

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
      You are a character merge expert. You are given two characters and you need to merge them into one.
      Sometimes two characters are created by accident when a character is introduced without a name.
      In this case you need to merge the characters into one and return the new character name and description.

      You'll be given the name and description of two characters and you need to merge them into one.
      If one is far less detailed than the other, use the more detailed one as the base and add the other one's details to it.
    `,
    prompt: dedent`
      The two characters are:
      <CHARACTER_1>
      ${entity1.name}
      ${entity1.description}
      </CHARACTER_1>
      <CHARACTER_2>
      ${entity2.name}
      ${entity2.description}
      </CHARACTER_2>
      Merge the characters into one and return the new character name and description.
    `,
  });
};

// Add a new character to the knowledge base
export const addCharacterToKnowledge = async (
  world: typeof worlds.$inferSelect,
  character: CreateWorldCharacterItem
) => {
  console.log(`Adding character ${character.name} to knowledge base`);

  const embedding = await embedKnowledgeItem({
    type: "world_character",
    ...character,
  });
  const [createdCharacter] = await db
    .insert(characters)
    .values({
      worldId: world.id,
      name: character.name,
      description: character.description,
      embedding: embedding.embedding,
    })
    .returning();

  // Revalidate cache for characters in this world
  revalidateTag(`characters-${world.id}`, "max");

  // Generate an image in the background after the character is created
  after(async () => {
    console.log(`Generating image for character ${createdCharacter.name}`);

    const imageUrl = await generateImage(createdCharacter.description);
    await db
      .update(characters)
      .set({
        imageUrl,
      })
      .where(eq(characters.id, createdCharacter.id));

    console.log(
      `Image generated for character ${createdCharacter.name}! Saved to ${imageUrl}`
    );
  });
};

export async function searchForCharacter(
  world: typeof worlds.$inferSelect,
  query: string,
  limit: number = 10
) {
  console.log(`Searching for character: '${query}'`);

  const queryEmbedding = await getEmbedForQuery(query);

  // use Drizzle's built in vector functions to generate query
  // https://orm.drizzle.team/docs/guides/vector-similarity-search
  const similarity = sql<number>`1 - (${cosineDistance(
    characters.embedding,
    queryEmbedding.embedding
  )})`;

  return await db
    .select({
      id: characters.id,
      createdAt: characters.createdAt,
      name: characters.name,
      description: characters.description,
      imageUrl: characters.imageUrl,
      worldId: characters.worldId,
      similarity,
    })
    .from(characters)
    .where(
      and(
        gt(similarity, SIMILARITY_THRESHOLD),
        eq(characters.worldId, world.id)
      )
    )
    .orderBy((t) => desc(t.similarity))
    .limit(limit);
}

export const updateCharacter = async (
  world: typeof worlds.$inferSelect,
  characterId: number,
  character: CreateWorldCharacterItem
) => {
  console.log(`Updating character ${character.name} in knowledge base`);

  const embedding = await embedKnowledgeItem({
    type: "world_character",
    ...character,
  });
  await db
    .update(characters)
    .set({
      name: character.name,
      description: character.description,
      embedding: embedding.embedding,
    })
    .where(
      and(eq(characters.id, characterId), eq(characters.worldId, world.id))
    );

  // Revalidate cache for this specific character and characters in this world
  revalidateTag(`character-${characterId}`, "max");
  revalidateTag(`characters-${world.id}`, "max");
};

export const getCharacterById = async (id: number) => {
  return await db.query.characters.findFirst({
    where: eq(characters.id, id),
  });
};

export const getAllCharactersInWorld = async (worldId: number) => {
  return await db.query.characters.findMany({
    where: eq(characters.worldId, worldId),
  });
};

// Combined search function that searches both characters and players
export const searchForPersonalities = async (
  world: typeof worlds.$inferSelect,
  query: string,
  limit: number = 10
) => {
  console.log(
    `Searching for personalities (characters and players): '${query}'`
  );

  // Use existing search functions
  const [characterResults, playerResults] = await Promise.all([
    searchForCharacter(world, query, limit),
    searchForPlayer(world, query, limit),
  ]);

  // Add type field and combine results
  const charactersWithType = characterResults.map((result) => ({
    ...result,
    type: "character" as const,
  }));

  const playersWithType = playerResults.map((result) => ({
    ...result,
    type: "player" as const,
  }));

  // Combine and sort by similarity
  const combinedResults = [...charactersWithType, ...playersWithType]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return combinedResults;
};

// Sometimes two characters are the same person, but have different names.
// This function merges two characters into one.
// We use AI to load both characters and merge them into one.
// Then we'll update any events that reference the other character to reference the correct character.
export const mergeCharacters = async (
  world: typeof worlds.$inferSelect,
  characterId: number,
  otherCharacterId: number
) => {
  const character = await getCharacterById(characterId);
  const otherCharacter = await getCharacterById(otherCharacterId);

  if (!character || !otherCharacter) {
    throw new Error("At least one character not found when merging characters");
  }

  if (character.worldId !== otherCharacter.worldId) {
    throw new Error(
      "Characters are not in the same world when merging characters"
    );
  }

  console.log(
    `Merging characters ${character.name} and ${otherCharacter.name}`
  );

  const newCharacter = await mergeEntitiesWithAI(
    { name: character.name, description: character.description },
    { name: otherCharacter.name, description: otherCharacter.description }
  );

  // Update the character with the new name and description
  await updateCharacter(world, characterId, {
    name: newCharacter.object.name,
    description: newCharacter.object.description,
  });

  // Update all events that reference the other character to reference the new character
  await db
    .update(eventCharacters)
    .set({
      characterId: characterId,
    })
    .where(eq(eventCharacters.characterId, otherCharacterId));

  // Delete the other character
  await db.delete(characters).where(eq(characters.id, otherCharacterId));

  // Revalidate cache for both characters and characters in this world
  revalidateTag(`character-${characterId}`, "max");
  revalidateTag(`character-${otherCharacterId}`, "max");
  revalidateTag(`characters-${world.id}`, "max");
};

// Sometimes the AI accidentally creates a character for an existing player.
// This function merges a character into an existing player.
// We use AI to merge the character data into the player data.
// Then we'll move all events that reference the character to reference the player instead.
export const mergeCharacterIntoPlayer = async (
  world: typeof worlds.$inferSelect,
  characterId: number,
  playerId: number
) => {
  const character = await getCharacterById(characterId);
  const player = await db.query.players.findFirst({
    where: and(eq(players.id, playerId), eq(players.worldId, world.id)),
  });

  if (!character || !player) {
    throw new Error(
      "Character or player not found when merging character into player"
    );
  }

  if (character.worldId !== player.worldId) {
    throw new Error(
      "Character and player are not in the same world when merging"
    );
  }

  console.log(`Merging character ${character.name} into player ${player.name}`);

  const mergedPlayer = await mergeEntitiesWithAI(
    { name: character.name, description: character.description },
    { name: player.name, description: player.description }
  );

  // Update the player with the merged name and description
  const embedding = await embedKnowledgeItem({
    type: "world_player",
    name: mergedPlayer.object.name,
    description: mergedPlayer.object.description,
  });

  await db
    .update(players)
    .set({
      name: mergedPlayer.object.name,
      description: mergedPlayer.object.description,
      embedding: embedding.embedding,
    })
    .where(eq(players.id, playerId));

  // Move all events that reference the character to reference the player instead
  // First, get all events that reference this character
  const characterEvents = await db
    .select({ eventId: eventCharacters.eventId })
    .from(eventCharacters)
    .where(eq(eventCharacters.characterId, characterId));

  // For each event, create a new eventPlayers entry and delete the eventCharacters entry
  for (const { eventId } of characterEvents) {
    // Check if this event already has this player
    const existingPlayerEvent = await db
      .select()
      .from(eventPlayers)
      .where(
        and(
          eq(eventPlayers.eventId, eventId),
          eq(eventPlayers.playerId, playerId)
        )
      )
      .limit(1);

    if (existingPlayerEvent.length === 0) {
      // Only add if the player isn't already associated with this event
      await db.insert(eventPlayers).values({
        eventId,
        playerId,
      });
    }

    // Delete the character association
    await db
      .delete(eventCharacters)
      .where(
        and(
          eq(eventCharacters.eventId, eventId),
          eq(eventCharacters.characterId, characterId)
        )
      );
  }

  // Delete the character
  await db.delete(characters).where(eq(characters.id, characterId));

  // Revalidate cache for the player, character, and characters in this world
  revalidateTag(`player-${playerId}`, "max");
  revalidateTag(`players-${world.id}`, "max");
  revalidateTag(`character-${characterId}`, "max");
  revalidateTag(`characters-${world.id}`, "max");
};
