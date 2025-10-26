import { players, worlds } from "@/lib/db/schema";
import { embedKnowledgeItem, getEmbedForQuery } from "./embed";
import { db } from "@/lib/db/client";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { CreateWorldPlayerItem } from "./types";
import { revalidateTag } from "next/cache";
import { publishPlayerUpdate } from "@/lib/realtime/publish";

const SIMILARITY_THRESHOLD = 0.2; // TODO: tune this

export async function searchForPlayer(
  world: typeof worlds.$inferSelect,
  query: string,
  limit: number = 10
) {
  console.log(`Searching for player: '${query}'`);

  const queryEmbedding = await getEmbedForQuery(query);

  // use Drizzle's built in vector functions to generate query
  // https://orm.drizzle.team/docs/guides/vector-similarity-search
  const similarity = sql<number>`1 - (${cosineDistance(
    players.embedding,
    queryEmbedding.embedding
  )})`;

  return await db
    .select({
      id: players.id,
      createdAt: players.createdAt,
      name: players.name,
      description: players.description,
      imageUrl: players.imageUrl,
      worldId: players.worldId,
      similarity,
    })
    .from(players)
    .where(
      and(gt(similarity, SIMILARITY_THRESHOLD), eq(players.worldId, world.id))
    )
    .orderBy((t) => desc(t.similarity))
    .limit(limit);
}

export const getPlayerById = async (id: number) => {
  return await db.query.players.findFirst({
    where: eq(players.id, id),
  });
};

export const getAllPlayersInWorld = async (worldId: number) => {
  return await db.query.players.findMany({
    where: eq(players.worldId, worldId),
  });
};

export const updatePlayer = async (
  world: typeof worlds.$inferSelect,
  playerId: number,
  player: CreateWorldPlayerItem
) => {
  console.log(`Updating player ${playerId} (${player.name}) in knowledge base`);

  const embedding = await embedKnowledgeItem({
    type: "world_player",
    ...player,
  });

  const [updatedPlayer] = await db
    .update(players)
    .set({
      name: player.name,
      description: player.description,
      embedding: embedding.embedding,
    })
    .where(and(eq(players.id, playerId), eq(players.worldId, world.id)))
    .returning();

  await publishPlayerUpdate(updatedPlayer);

  // Revalidate cache for this specific player and players in this world
  revalidateTag(`player-${playerId}`, "max");
  revalidateTag(`players-${world.id}`, "max");
};
