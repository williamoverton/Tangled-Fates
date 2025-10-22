import { chat } from "@/lib/ai/chatbot/chat";
import { z } from "zod/v4";
import { worlds } from "@/lib/db/schema";
import { db } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { UIMessage } from "ai";

const schema = z.object({
  worldId: z.number(),
  playerId: z.string(),
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

  // TODO: use auth for playerId / add charcter system & state etc

  const result = chat(world, playerId, messages as UIMessage[]);

  return result.toUIMessageStreamResponse();
}
