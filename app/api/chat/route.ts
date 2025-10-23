import { chat } from "@/lib/ai/chatbot/chat";
import { z } from "zod/v4";
import { worlds } from "@/lib/db/schema";
import { db } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { UIMessage } from "ai";
import { auth } from "@clerk/nextjs/server";
import { getPlayer } from "@/lib/player/player";

const schema = z.object({
  worldId: z.number(),
  playerId: z.number(),
  messages: z.any(), // TODO: type this as UIMessage[]
});

export async function POST(req: Request) {
  const { worldId, playerId, messages } = schema.parse(await req.json());

  const world = await db.query.worlds.findFirst({
    where: eq(worlds.id, worldId),
  });

  if (!world) {
    return new Response("World not found", { status: 404 });
  }

  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const player = await getPlayer(world, userId, playerId);

  if (!player) {
    return new Response("Player not found", { status: 404 });
  }

  const result = chat(world, player, messages as UIMessage[]);

  return result.toUIMessageStreamResponse();
}
