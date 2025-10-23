import { after } from "next/server";
import { generateImage } from "../ai/image/generateImage";
import { embedKnowledgeItem } from "../ai/knowledge/embed";
import { WorldPlayerItem } from "../ai/knowledge/types";
import { db } from "../db/client";
import { players, worlds } from "../db/schema";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import dedent from "dedent";

// Create a new player for a world
export const createPlayer = async (
  world: typeof worlds.$inferSelect,
  userId: string,
  name: string,
  description: string
) => {
  const worldPlayer = WorldPlayerItem.parse({
    type: "world_player",
    name,
    description,
  });

  const [createdPlayer] = await db
    .insert(players)
    .values({
      clerkUserId: userId,
      name,
      description,
      worldId: world.id,
      embedding: (await embedKnowledgeItem(worldPlayer)).embedding,
    })
    .returning();

  // Generate an image in the background after the player is created
  after(async () => {
    console.log(`Generating image for player ${createdPlayer.name}`);

    const imageUrl = await generateImage(dedent`
      ${createdPlayer.name} is a player in the world of ${world.name}. 
      ${world.description}. Here is a description of the player: ${createdPlayer.description}. 
      Generate them an avatar image that looks like them.
    `);

    await db
      .update(players)
      .set({
        imageUrl,
      })
      .where(eq(players.id, createdPlayer.id));
  });

  return createdPlayer;
};

// Get a player character for a world
export const getPlayer = (
  world: typeof worlds.$inferSelect,
  userId: string,
  id: number
) =>
  db.query.players.findFirst({
    where: and(
      eq(players.id, id),
      eq(players.worldId, world.id),
      eq(players.clerkUserId, userId)
    ),
  });

export const getAllUserPlayersForWorld = (
  world: typeof worlds.$inferSelect,
  userId: string
) =>
  db.query.players.findMany({
    where: and(eq(players.worldId, world.id), eq(players.clerkUserId, userId)),
  });

// Get all players in a world (for wiki)
export const getAllPlayersInWorld = async (worldId: number) => {
  return await db.query.players.findMany({
    where: eq(players.worldId, worldId),
  });
};
