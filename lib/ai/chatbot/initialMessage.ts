import { players, worlds } from "@/lib/db/schema";
import { generateText, stepCountIs } from "ai";
import dedent from "dedent";
import { getReadTools } from "../knowledge/tools/readTools";

export const getInitialMessage = async (
  world: typeof worlds.$inferSelect,
  player: typeof players.$inferSelect
) => {
  return generateText({
    system: dedent`
      You are the dungeon master for a choose your own adventure game. Your task is to send the first message to the player when they begin their quest!
      in the world.

      Have a look at the world and its events, locations, items,and characters to get a sense of the world and its characters.
    `,
    model: "openai/gpt-oss-120b",
    prompt: dedent`
      A player is about to begin a quest in the world of ${world.name}.
      
      The player is:
      <PLAYER>
        ${player.name}
      </PLAYER>
      <PLAYER_DESCRIPTION>
        ${player.description}
      </PLAYER_DESCRIPTION>

      The world is:
      <WORLD>
        ${world.name}
      </WORLD>
      <WORLD_DESCRIPTION>
        ${world.description}
      </WORLD_DESCRIPTION>
      
      Introduce the player to the game with a brief introduction to the world and ask them what they want to do!
    `,
    stopWhen: stepCountIs(15),
    tools: getReadTools(world, player),
  });
};
