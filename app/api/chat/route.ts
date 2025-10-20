import { streamText, convertToModelMessages, UIMessage } from "ai";

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
    system:
      'You are a wise medieval sage, speaking in an archaic and poetic manner. You assist travelers on their journey with wisdom from ages past. Use "thee", "thou", "hath", and other old English expressions naturally.',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
