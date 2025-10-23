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
  updateLocation,
} from "../knowledge/location";
import {
  searchForCharacter,
  addCharacterToKnowledge,
  updateCharacter,
} from "../knowledge/character";
import {
  searchForItem,
  addItemToKnowledge,
  updateItem,
} from "../knowledge/item";
import { searchForPlayer } from "../knowledge/player";
import { players, worlds } from "@/lib/db/schema";
import {
  WorldCharacterItem,
  WorldEventItem,
  WorldLocationItem,
  CreateWorldItemItem,
} from "../knowledge/types";
import { saveChatHistory } from "./history";

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
      You are also responsible for the world, the characters, and the items in the world.

      You must keep the story consitent! To do this before you give any details you must search for any relevant information about events, locations, characters, items, and players.
      For example if the player asks if there is a tavern in the village, you must search for any events, locations, characters, and items that are related to the tavern
      before you give any details.

      When searching for events, locations, characters, items, and players you must search with at least 3 different queries, 
      for example if the player was entering a town you could search for the name of the town, any details of the town like the tavern etc.

      If a new location, character, or item is mentioned, add it to the knowledge base using the appropriate tool.
      Remember: we need to keep track of things that happen in the world, so if anything happens, add it to the knowledge base using the addWorldEvent tool.

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
      </RULES>
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
      addWorldEvent: tool({
        description:
          "Add an event to the world. Use this to add an event that has recently happened at a location or with a character. If anything happens, add it here. If a new item, character, or location is created, save them first if they didnt exist to get their ID and then add an event with their ids.",
        inputSchema: z.object({
          event: WorldEventItem,
        }),
        execute: async ({ event }) => await addEventToKnowledge(world, event),
      }),
      addNewLocation: tool({
        description:
          "Add a location to the world. Use this to add a location that is in the world.",
        inputSchema: z.object({
          location: WorldLocationItem,
        }),
        execute: async ({ location }) =>
          await addLocationToKnowledge(world, location),
      }),
      updateLocation: tool({
        description:
          "Update a location in the world. Use this to update a location that is already in the world if something has changed.",
        inputSchema: z.object({
          locationId: z.number(),
          location: WorldLocationItem,
        }),
        execute: async ({ locationId, location }) =>
          await updateLocation(world, locationId, location),
      }),
      addNewCharacter: tool({
        description:
          "Add a new character to the world (NOT A PLAYER, only use for NPCs). Use this to add a character that is in the world.",
        inputSchema: z.object({
          character: WorldCharacterItem,
        }),
        execute: async ({ character }) =>
          await addCharacterToKnowledge(world, character),
      }),
      updateCharacter: tool({
        description:
          "Update a character in the world. Use this to update a character that is already in the world if something has changed.",
        inputSchema: z.object({
          characterId: z.number(),
          character: WorldCharacterItem,
        }),
        execute: async ({ characterId, character }) =>
          await updateCharacter(world, characterId, character),
      }),
      addNewItem: tool({
        description:
          "Add a new item to the world. Use this whenever any item of note is mentioned that doesnt already exist in the knowledge base.",
        inputSchema: z.object({
          item: CreateWorldItemItem,
        }),
        execute: async ({ item }) => await addItemToKnowledge(world, item),
      }),
      updateItem: tool({
        description:
          "Update an item in the world. Use this to update an item that is already in the world if something has changed.",
        inputSchema: z.object({
          itemId: z.number(),
          item: CreateWorldItemItem,
        }),
        execute: async ({ itemId, item }) =>
          await updateItem(world, itemId, item),
      }),
    },
  }).toUIMessageStreamResponse({
    onFinish: async (result) => {
      await saveChatHistory(player.id, [...messages, ...result.messages]);
    },
  });
