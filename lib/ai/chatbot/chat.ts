import "server-only";

import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import dedent from "dedent";
import { z } from "zod";
import { searchForEvent, addEventToKnowledge } from "../knowledge/event";
import {
  searchForLocation,
  addLocationToKnowledge,
} from "../knowledge/location";
import {
  searchForCharacter,
  addCharacterToKnowledge,
} from "../knowledge/character";
import { worlds } from "@/lib/db/schema";
import {
  WorldCharacterItem,
  WorldEventItem,
  WorldLocationItem,
} from "../knowledge/types";

export const chat = (
  world: typeof worlds.$inferSelect,
  playerId: string,
  messages: UIMessage[]
) =>
  streamText({
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

      You must keep the story consitent! To do this before you give any details you must search for any relevant information about events, locations, and personalities.
      For example if the player asks if there is a tavern in the village, you must search for any events, locations, and personalities that are related to the tavern
      before you give any details.

      When searching for events, locations, and personalities you must search with at least 3 different queries, 
      for example if the player was entering a town yoy could search for the name of the town, any details of the town like the tavern etc.

      Keep resonses short and concise and remember you are a storyteller, your output should be a narrative of the story. (but only a few sentences at a time)
  `,
    messages: convertToModelMessages(messages),
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
      getWorldPersonalities: tool({
        description:
          "Get personalities in the world and their descriptions. Use this thouroughly as part of your knowledge of the world.",
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
      addWorldEvent: tool({
        description:
          "Add an event to the world. Use this to add an event that has recently happened at a location or with a character. If anything important happens, add it here.",
        inputSchema: z.object({
          event: WorldEventItem,
        }),
        execute: async ({ event }) => await addEventToKnowledge(world, event),
      }),
      addWorldLocation: tool({
        description:
          "Add a location to the world. Use this to add a location that is in the world.",
        inputSchema: z.object({
          location: WorldLocationItem,
        }),
        execute: async ({ location }) =>
          await addLocationToKnowledge(world, location),
      }),
      addWorldPersonality: tool({
        description:
          "Add a personality to the world. Use this to add a personality that is in the world.",
        inputSchema: z.object({
          personality: WorldCharacterItem,
        }),
        execute: async ({ personality }) =>
          await addCharacterToKnowledge(world, personality),
      }),
    },
  });
