import { Index } from "@upstash/vector";
import dedent from "dedent";
import { z } from "zod";

// Things that can happen in the world
const WorldEventMetadata = z.object({
  type: z.literal("world_event"),
  when: z.string(),
  where: z.string(),
  what: z.string(),
});

// Places in the world
const WorldLocationMetadata = z.object({
  type: z.literal("world_location"),
  placeType: z
    .string()
    .describe(
      "The type of place, such as a village, city, forest, mansion, tavern, mineral cave, etc."
    ),
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
  location: z
    .string()
    .describe(
      "The location of the place in the world. Explain where it is in the world and what it is near."
    ),
});

const WorldPersonalityMetadata = z.object({
  type: z.literal("world_personality"),
  personalityType: z
    .string()
    .describe(
      "The type of personality, such as a merchant, blacksmith, wizard, villian etc."
    ),
  name: z
    .string()
    .describe(
      "The name of the personality. Such as 'John Doe', 'Jane Smith', 'The Wizard', etc."
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the personality. Include everything needed to describe the personality."
    ),
});

export const Metadata = z.discriminatedUnion("type", [
  WorldEventMetadata,
  WorldLocationMetadata,
  WorldPersonalityMetadata,
]);

// Inferred TypeScript types
export type WorldEventMetadata = z.infer<typeof WorldEventMetadata>;
export type WorldLocationMetadata = z.infer<typeof WorldLocationMetadata>;
export type WorldPersonalityMetadata = z.infer<typeof WorldPersonalityMetadata>;
export type Metadata = z.infer<typeof Metadata>;
export type QueryType = Metadata["type"];

const index = new Index<Metadata>();

async function upsert(data: string, metadata: Metadata) {
  await index.upsert({
    id: crypto.randomUUID(),
    data: data,
    metadata: metadata,
  });
}

async function queryIndex(data: string, type: QueryType) {
  return await index.query({
    data: data,
    topK: 10,
    includeVectors: true,
    includeMetadata: true,
    filter: `type = "${type}"`,
  });
}

export const addWorldEvent = async (event: WorldEventMetadata) => {
  const content = dedent`
    In ${event.where} at ${event.when}, ${event.what} happened.
  `;

  await upsert(content, event);
};

export const getWorldEvents = async (query: string) => {
  const res = await queryIndex(query, "world_event");
  return res.map((item) => ({
    worldEvent: WorldEventMetadata.parse(item.metadata),
    score: item.score,
  }));
};

export const addWorldLocation = async (location: WorldLocationMetadata) => {
  const content = dedent`
    In ${location.location} there is a ${location.placeType} called ${location.name}. It can be described as: ${location.description}
  `;

  await upsert(content, location);
};

export const getWorldLocations = async (query: string) => {
  const res = await queryIndex(query, "world_location");
  return res.map((item) => ({
    worldLocation: WorldLocationMetadata.parse(item.metadata),
    score: item.score,
  }));
};

export const addWorldPersonality = async (
  personality: WorldPersonalityMetadata
) => {
  const content = dedent`
    There is a ${personality.personalityType} called ${personality.name}. They can be described as: ${personality.description}
  `;

  await upsert(content, personality);
};

export const getWorldPersonalities = async (query: string) => {
  const res = await queryIndex(query, "world_personality");
  return res.map((item) => ({
    worldPersonality: WorldPersonalityMetadata.parse(item.metadata),
    score: item.score,
  }));
};
