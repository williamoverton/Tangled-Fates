import { worlds } from "@/lib/db/schema";
import { generateText, stepCountIs, tool } from "ai";
import dedent from "dedent";
import { z } from "zod/v4";
import { searchForCharacter } from "../knowledge/character";
import { searchForLocation } from "../knowledge/location";
import { searchForEvent } from "../knowledge/event";

export const getInitialMessage = async (world: typeof worlds.$inferSelect) => {
  return generateText({
    system: dedent`
      You are the dungeon master for a choose your own adventure game. Your task is to send the first message to the player when they begin their quest!
      in the world.

      Have a look at the world and its events, locations, and characters to get a sense of the world and its characters.
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
    stopWhen: stepCountIs(10),
    tools: {
      getWorldEvents: tool({
        description:
          "Get the latest events in the world. Use this to find out about what has recently happened at a location or with a character.",
        inputSchema: z.object({
          queries: z
            .string()
            .array()
            .min(3)
            .max(10)
            .describe(
              "The queries to search for events, such as a location or character name. You should include at least 3 different queries to search for events."
            ),
        }),
        execute: async ({ queries }) =>
          Promise.all(queries.map((query) => searchForEvent(world, query))),
      }),
      getWorldLocations: tool({
        description:
          "Get locations in the world and their descriptions. Use this thouroughly as part of your knowledge of the world.",
        inputSchema: z.object({
          queries: z
            .string()
            .array()
            .min(3)
            .max(10)
            .describe(
              "The queries to search for locations, such as a location name/type or nearby locations. You should include at least 3 different queries to search for locations."
            ),
        }),
        execute: async ({ queries }) =>
          Promise.all(queries.map((query) => searchForLocation(world, query))),
      }),
      getWorldCharacters: tool({
        description:
          "Get characters in the world and their descriptions. Use this thouroughly as part of your knowledge of the world.",
        inputSchema: z.object({
          queries: z
            .string()
            .array()
            .min(3)
            .max(10)
            .describe(
              "The queries to search for personalities, such as a personality name/type or nearby personalities. You should include at least 3 different queries to search for personalities."
            ),
        }),
        execute: async ({ queries }) =>
          Promise.all(queries.map((query) => searchForCharacter(world, query))),
      }),
    },
  });
};
