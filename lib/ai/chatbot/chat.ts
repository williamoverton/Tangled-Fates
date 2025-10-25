import "server-only";

import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import dedent from "dedent";
import { players, worlds } from "@/lib/db/schema";
import { saveChatHistory } from "./history";
import { getReadTools } from "../knowledge/tools/readTools";
import { saveHistoryToKnowledgeBase } from "../../../workflows/archivist/workflow";
import { start } from "workflow/api";

export const chat = (
  world: typeof worlds.$inferSelect,
  player: typeof players.$inferSelect,
  messages: UIMessage[]
) =>
  streamText({
    model: "anthropic/claude-haiku-4.5",
    system: dedent`
      You are the dungeon master for a choose your own adventure game. 
      You are responsible for the story and the choices the players make. 

      You must keep the story consitent! To do this before you give any details you must search for any relevant information about events, locations, characters, items, and players.
      For example if the player asks if there is a tavern in the village, you must search for any events, locations, characters, and items that are related to the tavern
      before you give any details.

      When searching for events, locations, characters, items, and players you must search with at least 3 different queries, 
      for example if the player was entering a town you could search for the name of the town, any details of the town like the tavern etc.

      Keep resonses short and concise and remember you are a storyteller, your output should be a narrative of the story. (but only a few sentences at a time)

      <PLAYER_INFO>
        Player ID: ${player.id}
        Name: ${player.name}
        Description: ${player.description}
      </PLAYER_INFO>
      <WORLD_INFO>
        Name: ${world.name}
        Description: ${world.description}
      </WORLD_INFO>

      <RULES>
        - NEVER mention your internal workings or state to the player. Everything you say must be story telling.
        - Never say something like "I'm thinking about..." or "I'm searching for..." or anything like that. Everything you say must be story telling.
        - Keep responses short and concise, try not to go over 5 sentences.
      </RULES>
  `,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools: {
      ...getReadTools(world, player),
    },
  }).toUIMessageStreamResponse({
    onFinish: async (result) => {
      await saveChatHistory(player.id, [...messages, ...result.messages]);
      await start(saveHistoryToKnowledgeBase, [
        { world, player },
        [...messages.slice(-2), ...result.messages],
      ]);
    },
  });
