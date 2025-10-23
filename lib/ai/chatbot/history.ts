import { db } from "@/lib/db/client";
import { chatHistory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UIMessage } from "ai";

export const getChatHistory = async (playerId: number) => {
  const history = await db.query.chatHistory.findFirst({
    where: eq(chatHistory.playerId, playerId),
  });

  if (!history) {
    return [];
  }

  return history.messages as unknown as UIMessage[];
};

export const saveChatHistory = async (
  playerId: number,
  messages: UIMessage[]
) => {
  return await db
    .insert(chatHistory)
    .values({
      playerId,
      messages,
    })
    .onConflictDoUpdate({
      target: [chatHistory.playerId],
      set: {
        messages,
      },
    });
};
