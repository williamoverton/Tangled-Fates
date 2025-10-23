import { players, worlds } from "@/lib/db/schema";
import { getEmbedForQuery } from "./embed";
import { db } from "@/lib/db/client";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

const SIMILARITY_THRESHOLD = 0.3; // TODO: tune this

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
