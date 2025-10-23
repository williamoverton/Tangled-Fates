import dedent from "dedent";
import { KnowledgeItem } from "./types";
import { embed } from "ai";
import { EMBEDDING_MODEL } from "@/CONFIG";
import { getLocationById } from "./location";

// TODO: Generate better content for the knowledge items
export async function generateContentForKnowledgeItem(
  item: KnowledgeItem
): Promise<string | undefined> {
  switch (item.type) {
    case "world_event":
      // TODO: Handle the case where the location is not found
      const location = item.location
        ? await getLocationById(item.location)
        : undefined;

      return dedent`
        In ${location ? `${location.name}` : "the world"} at ${item.when}, ${
        item.description
      }
      `;
    case "world_location":
      return dedent`
        There is a location called ${item.name}. It can be described as: ${item.description}
      `;
    case "world_character":
      return dedent`
        There is a character called ${item.name}. They can be described as: ${item.description}
      `;
    case "world_player":
      return dedent`
        There is a player called ${item.name}. They can be described as: ${item.description}
      `;
  }
}

export const embedKnowledgeItem = async (item: KnowledgeItem) => {
  console.log(`Embedding knowledge item ${item.type}...`);
  const result = await embed({
    model: EMBEDDING_MODEL,
    value: (await generateContentForKnowledgeItem(item)) ?? "",
  });
  console.log(`Embedding complete`);
  return result;
};

export const getEmbedForQuery = (query: string) =>
  embed({
    model: EMBEDDING_MODEL,
    value: query,
  });
