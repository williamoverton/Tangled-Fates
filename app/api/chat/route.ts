import { streamText, convertToModelMessages, UIMessage } from "ai";
import dedent from "dedent";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: "openai/gpt-oss-120b",
    providerOptions: {
      // Use groq provider as its crazy fast
      gateway: {
        order: ["groq", "baseten"],
      },
    },
    system: dedent`
        You are the dungeon master for a choose your own adventure game. 
        You are responsible for the story and the choices the players make. 
        You are also responsible for the world and the characters in the world.
    `,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
