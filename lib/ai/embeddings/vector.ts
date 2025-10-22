import { Index } from "@upstash/vector";
import dedent from "dedent";
import { z } from "zod";

// Things that can happen in the world
export const WorldEventMetadata = z.object({
  type: z.literal("world_event").default("world_event"),
  when: z.string(),
  where: z.string(),
  what: z.string(),
});

// Places in the world
export const WorldLocationMetadata = z.object({
  type: z.literal("world_location").default("world_location"),
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

export const WorldPersonalityMetadata = z.object({
  type: z.literal("world_personality").default("world_personality"),
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
  console.log("Saving knowledge:", data, metadata);

  await index.upsert({
    id: crypto.randomUUID(),
    data: data,
    metadata: metadata,
  });
}

async function queryIndex(data: string, type: QueryType) {
  console.log("Querying index for:", data, "of type:", type);

  const res = await index.query({
    data: data,
    topK: 10,
    includeVectors: true,
    includeMetadata: true,
    filter: `type = "${type}"`,
  });

  console.log(
    "Query results:",
    res.map((item) => item.metadata)
  );
  return res;
}

function generateContentForMetadata(metadata: Metadata): string {
  switch (metadata.type) {
    case "world_event":
      return dedent`
        In ${metadata.where} at ${metadata.when}, ${metadata.what}
      `;
    case "world_location":
      return dedent`
        In ${metadata.location} there is a ${metadata.placeType} called ${metadata.name}. It can be described as: ${metadata.description}
      `;
    case "world_personality":
      return dedent`
        There is a ${metadata.personalityType} called ${metadata.name}. They can be described as: ${metadata.description}
      `;
  }
}

export const addWorldEvent = async (event: WorldEventMetadata) => {
  const content = generateContentForMetadata(event);
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
  const content = generateContentForMetadata(location);
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
  const content = generateContentForMetadata(personality);
  await upsert(content, personality);
};

export const getWorldPersonalities = async (query: string) => {
  const res = await queryIndex(query, "world_personality");
  return res.map((item) => ({
    worldPersonality: WorldPersonalityMetadata.parse(item.metadata),
    score: item.score,
  }));
};

// Used to rewrite an event to match the current world state
// For example if the tavern was on fire and we the player extingushed it, we need to rewrite the event to say the tavern was on fire but is no longer on fire.
// That way the story can be resumed with something like "The tavern is a smouldering ruin" etc.
export const updateHistory = async (id: string, newEvent: Metadata) => {
  const events = await index.fetch([id], {
    includeMetadata: true,
  });

  if (events.length === 0) {
    return;
  }

  const event = events[0]!;

  if (event.metadata!.type !== newEvent.type) {
    return "Error! The event type does not match the metadata type";
  }

  await index.update({
    id,
    metadata: newEvent,
    data: generateContentForMetadata(newEvent),
  });

  return "History updated successfully";
};
