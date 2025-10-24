import { players, worlds } from "@/lib/db/schema";
import { z } from "zod";
import {
  CreateWorldItemItem,
  CreateWorldPlayerItem,
  WorldCharacterItem,
  WorldEventItem,
} from "../types";
import { WorldLocationItem } from "../types";
import { addEventToKnowledge } from "../event";
import { addLocationToKnowledge } from "../location";
import { updateLocation } from "../location";
import { addCharacterToKnowledge, mergeCharacters } from "../character";
import { updateCharacter } from "../character";
import { addItemToKnowledge } from "../item";
import { updateItem } from "../item";
import { tool } from "ai";
import { updatePlayer } from "../player";

export const getWriteTools = (
  world: typeof worlds.$inferSelect,
  player: typeof players.$inferSelect
) => {
  return {
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
    mergeCharacters: tool({
      description:
        "Merge two characters into one. Use this if you find two character entries that are the same person but have different names.",
      inputSchema: z.object({
        characterId: z.number(),
        otherCharacterId: z.number(),
      }),
      execute: async ({ characterId, otherCharacterId }) =>
        await mergeCharacters(world, characterId, otherCharacterId),
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
    updatePlayer: tool({
      description:
        "Update the current player. Use this if you need to update the name or description of the current player, for example if they die or get new powers etc.",
      inputSchema: CreateWorldPlayerItem,
      execute: async (playerUpdate) =>
        await updatePlayer(world, player.id, playerUpdate),
    }),
  };
};
