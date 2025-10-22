import { UIMessage } from "ai";
import { chat } from "@/lib/ai/chatbot/chat";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = chat(messages);

  return result.toUIMessageStreamResponse();
}
