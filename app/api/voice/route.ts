import OpenAI from "openai";
import z from "zod/v4";
import { NextRequest } from "next/server";

const schema = z.object({
  text: z.string().min(1).max(4096),
});

// TODO: Dont allow arbitrary text to be generated, only allow text that is related to the game.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");

  if (!text) {
    return new Response("Missing text parameter", { status: 400 });
  }

  const { text: validatedText } = schema.parse({ text });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const audioResponse = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "echo",
    input: validatedText,
    instructions:
      "You're a dungeon master, lead the story with a narrative voice.",
    speed: 1.2,
  });

  // Return the audio with proper headers and caching
  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
    },
  });
}
