import { characters, worlds } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { WorldCharacterItem } from "./types";
import { db } from "@/lib/db/client";
import { generateImage } from "../image/generateImage";
import { after } from "next/server";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

const SIMILARITY_THRESHOLD = 0.3; // TODO: tune this

// Add a new character to the knowledge base
export const addCharacterToKnowledge = async (
  world: typeof worlds.$inferSelect,
  character: WorldCharacterItem
) => {
  console.log(`Adding character ${character.name} to knowledge base`);

  const embedding = await embedKnowledgeItem(character);
  const [createdCharacter] = await db
    .insert(characters)
    .values({
      worldId: world.id,
      name: character.name,
      description: character.description,
      embedding: embedding.embedding,
    })
    .returning();

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
  character: WorldCharacterItem
) => {
  console.log(`Updating character ${character.name} in knowledge base`);

  const embedding = await embedKnowledgeItem(character);
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
};
