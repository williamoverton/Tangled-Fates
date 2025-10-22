import { worlds } from "@/lib/db/schema";
import { generateText } from "ai";
import dedent from "dedent";

export const getInitialMessage = async (world: typeof worlds.$inferSelect) => {
  return generateText({
    system: dedent`
      You are the dungeon master for a choose your own adventure game. Your task is to send the first message to the player when they begin their quest!
      in the world.
    `,
    model: "openai/gpt-oss-120b",
    prompt: dedent`
      A player is about to begin a quest in the world of ${world.name}.
      The world can be described as: 
      <WORLD_DESCRIPTION>
        ${world.description}
      </WORLD_DESCRIPTION>
      Introduce the player to the game with a brief introduction to the world and ask them what they want to do!
    `,
  });
};
