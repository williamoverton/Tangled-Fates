import OpenAI from "openai";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkBotId } from "botid/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Check for bot access
    const verification = await checkBotId();
    if (verification.isBot) {
      return new Response("Access denied", { status: 403 });
    }

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get the audio data from the request
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response("No audio file provided", { status: 400 });
    }

    console.log("🎤 Transcribing audio file:", audioFile.size, "bytes");

    // Create the transcription
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "text",
    });

    console.log("📝 Transcription complete:", transcription);

    // Return simple JSON response
    return new Response(
      JSON.stringify({
        text: transcription,
        success: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Transcription API error:", error);
    return new Response(
      JSON.stringify({
        error: "Transcription failed",
        success: false,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
