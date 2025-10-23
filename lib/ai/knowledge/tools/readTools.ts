import { worlds } from "@/lib/db/schema";
import { tool } from "ai";
import z from "zod";
import { searchForEvent } from "../event";
import { searchForLocation } from "../location";
import { searchForCharacter } from "../character";
import { searchForPlayer } from "../player";
import { searchForItem } from "../item";

export const getReadTools = (world: typeof worlds.$inferSelect) => {
  return {
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
    getWorldPlayers: tool({
      description:
        "Get players in the world and their descriptions. Use this to learn about other players that may have interacted with locations, characters, or items. This helps you understand the full context of events.",
      inputSchema: z.object({
        queries: z
          .string()
          .array()
          .min(1)
          .max(10)
          .describe(
            "The queries to search for players, such as a player name/type or related activities."
          ),
      }),
      execute: async ({ queries }) =>
        Promise.all(queries.map((query) => searchForPlayer(world, query))),
    }),
    getWorldItems: tool({
      description:
        "Get items in the world and their descriptions. Use this thouroughly as part of your knowledge of the world.",
      inputSchema: z.object({
        queries: z
          .string()
          .array()
          .min(3)
          .max(10)
          .describe(
            "The queries to search for items, such as an item name/type or related items. You should include at least 3 different queries to search for items."
          ),
      }),
      execute: async ({ queries }) =>
        Promise.all(queries.map((query) => searchForItem(world, query))),
    }),
  };
};
