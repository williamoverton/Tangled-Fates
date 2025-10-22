import { z } from "zod";

// Places in the world
export const WorldLocationItem = z.object({
  type: z.literal("world_location").default("world_location"),
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

// Characters in the world
export const WorldCharacterItem = z.object({
  type: z.literal("world_character").default("world_character"),
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

// Players in the world
export const WorldPlayerItem = z.object({
  type: z.literal("world_player").default("world_player"),
  name: z.string().describe("The name of the player."),
  description: z
    .string()
    .describe(
      "A detailed description of the player. Include everything needed to describe the player."
    ),
});

// Things that can happen in the world
export const WorldEventItem = z.object({
  type: z.literal("world_event").default("world_event"),
  when: z.iso.datetime(),
  location: WorldLocationItem.omit({ type: true })
    .optional()
    .describe("The location where the event occurred (if applicable)"),
  character: WorldCharacterItem.omit({ type: true })
    .optional()
    .describe("The character involved in the event (if applicable)"),
  player: WorldPlayerItem.omit({ type: true })
    .optional()
    .describe("The player involved in the event (if applicable)"),
  description: z.string().describe("A detailed description of the event."),
});

export const KnowledgeItem = z.discriminatedUnion("type", [
  WorldEventItem,
  WorldLocationItem,
  WorldCharacterItem,
  WorldPlayerItem,
]);

// Inferred TypeScript types
export type WorldEventItem = z.infer<typeof WorldEventItem>;
export type WorldLocationItem = z.infer<typeof WorldLocationItem>;
export type WorldCharacterItem = z.infer<typeof WorldCharacterItem>;
export type WorldPlayerItem = z.infer<typeof WorldPlayerItem>;
export type KnowledgeItem = z.infer<typeof KnowledgeItem>;
