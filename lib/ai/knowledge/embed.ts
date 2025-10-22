import dedent from "dedent";
import { KnowledgeItem } from "./types";
import { embed } from "ai";
import { EMBEDDING_MODEL } from "@/CONFIG";

// TODO: Generate better content for the knowledge items
export function generateContentForKnowledgeItem(
  item: KnowledgeItem
): string | undefined {
  switch (item.type) {
    case "world_event":
      return dedent`
        In ${item.location ? `${item.location.name}` : "the world"} at ${
        item.when
      }, ${item.description}
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

export const embedKnowledgeItem = (item: KnowledgeItem) =>
  embed({
    model: EMBEDDING_MODEL,
    value: generateContentForKnowledgeItem(item) ?? "",
  });

export const getEmbedForQuery = (query: string) =>
  embed({
    model: EMBEDDING_MODEL,
    value: query,
  });
