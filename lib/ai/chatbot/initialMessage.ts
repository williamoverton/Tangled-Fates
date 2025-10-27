import { players, worlds } from "@/lib/db/schema";
import { generateText } from "ai";
import dedent from "dedent";
import { getReadTools } from "../knowledge/tools/readTools";

export const getInitialMessage = async (
  world: typeof worlds.$inferSelect,
  player: typeof players.$inferSelect
) => {
  console.log("Making initial message for player", player, world);

  return generateText({
    system: dedent`
      You are the dungeon master for a choose your own adventure game. Your task is to send the first message to the player when they begin their quest!
      in the world.

      Have a look at the world and its events, locations, items, and characters to get a sense of the world and its characters.

      You should look at a players description and try and find a good place for them to start their quest, such as a location of interest that already exists or with an existing character that they can interact with.
      Make sure to call each tool once or twice minimum to get a sense of the world and its characters.
      
      IMPORTANT: After using tools to research the world, you MUST generate a text response to introduce the player to the game. Your final step must be a text message to the player.
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
      
      First, use the available tools to research the world, its locations, characters, items, and events. Then, introduce the player to the game with a brief introduction to the world and ask them what they want to do!
    `,
    maxSteps: 15,
    tools: getReadTools(world, player),
  });
};
