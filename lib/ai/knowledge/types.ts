import { z } from "zod";

// Places in the world
export const CreateWorldLocationItem = z.object({
  name: z
    .string()
    .describe(
      "The name of the place. Such as 'Mistral Village', 'The Forgotten Caves', 'The Royal Palace', etc."
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the place. Include everything needed to describe the place."
    ),
});
export const WorldLocationItem = CreateWorldLocationItem.extend({
  type: z.literal("world_location").default("world_location"),
});

// Characters in the world
export const CreateWorldCharacterItem = z.object({
  name: z
    .string()
    .describe(
      "The name of the character. Such as 'John Doe', 'Jane Smith', 'The Wizard', etc."
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the character. Include everything needed to describe the character."
    ),
});
export const WorldCharacterItem = CreateWorldCharacterItem.extend({
  type: z.literal("world_character").default("world_character"),
});

// Players in the world
export const CreateWorldPlayerItem = z.object({
  name: z
    .string()
    .describe(
      "The name of the player. Such as 'John Doe', 'Jane Smith', 'The Wizard', etc."
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the player. Include everything needed to describe the player."
    ),
});
export const WorldPlayerItem = CreateWorldPlayerItem.extend({
  type: z.literal("world_player").default("world_player"),
});

// Worlds themselves
export const CreateGameWorldItem = z.object({
  name: z
    .string()
    .describe(
      "The name of the world. Such as 'Mystic Realms', 'Cyberpunk 2087', 'Medieval Fantasy', etc."
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the world. Include everything needed to describe the world setting, atmosphere, and theme."
    ),
});
export const GameWorldItem = CreateGameWorldItem.extend({
  type: z.literal("world_world").default("world_world"),
});

// Items in the world
export const CreateWorldItemItem = z.object({
  name: z
    .string()
    .describe(
      "The name of the item. Such as 'Magic Sword', 'Ancient Scroll', 'Healing Potion', etc."
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the item. Include everything needed to describe the item."
    ),
});
export const WorldItemItem = CreateWorldItemItem.extend({
  type: z.literal("world_item").default("world_item"),
});

export const CreateWorldEventItem = z.object({
  when: z.iso.datetime(),
  location: z
    .number()
    .optional()
    .nullable()
    .describe(
      "The ID of the location where the event occurred (if applicable)"
    ),
  character: z
    .number()
    .optional()
    .nullable()
    .describe("The character involved in the event (if applicable)"),
  player: z
    .number()
    .optional()
    .nullable()
    .describe("The player involved in the event (if applicable)"), // TODO: Letting the LLM include the player ID is dangerous.
  item: z
    .number()
    .optional()
    .nullable()
    .describe("The item involved in the event (if applicable)"),
  description: z.string().describe("A detailed description of the event."),
});
// Things that can happen in the world
export const WorldEventItem = CreateWorldEventItem.extend({
  type: z.literal("world_event").default("world_event"),
});

export const KnowledgeItem = z.discriminatedUnion("type", [
  WorldEventItem,
  WorldLocationItem,
  WorldCharacterItem,
  WorldPlayerItem,
  WorldItemItem,
  GameWorldItem,
]);

// Inferred TypeScript types
export type CreateWorldEventItem = z.infer<typeof CreateWorldEventItem>;
export type WorldEventItem = z.infer<typeof WorldEventItem>;
export type CreateWorldLocationItem = z.infer<typeof CreateWorldLocationItem>;
export type WorldLocationItem = z.infer<typeof WorldLocationItem>;
export type CreateWorldCharacterItem = z.infer<typeof CreateWorldCharacterItem>;
export type WorldCharacterItem = z.infer<typeof WorldCharacterItem>;
export type CreateWorldPlayerItem = z.infer<typeof CreateWorldPlayerItem>;
export type WorldPlayerItem = z.infer<typeof WorldPlayerItem>;
export type CreateWorldItemItem = z.infer<typeof CreateWorldItemItem>;
export type WorldItemItem = z.infer<typeof WorldItemItem>;
export type CreateGameWorldItem = z.infer<typeof CreateGameWorldItem>;
export type GameWorldItem = z.infer<typeof GameWorldItem>;

export type KnowledgeItem = z.infer<typeof KnowledgeItem>;
