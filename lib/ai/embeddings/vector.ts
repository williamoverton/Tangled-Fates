import { WorldEvent } from "@/lib/game/types";
import { Index } from "@upstash/vector";

type WorldEventMetadata = {
  when: string;
  where: string;
  what: string;
};

const index = new Index<WorldEventMetadata>();

async function upsert(data: string, metadata: WorldEventMetadata) {
  await index.upsert({
    id: crypto.randomUUID(),
    data: data,
    metadata: metadata,
  });
}

async function queryIndex(data: string) {
  return await index.query({
    data: data,
    topK: 10,
    includeVectors: true,
    includeMetadata: true,
  });
}

export const addWorldEvent = async (event: WorldEvent) => {
  const content = `
    In ${event.where} at ${event.when}, ${event.what} happened.
  `;

  await upsert(content, {
    what: event.what,
    when: event.when,
    where: event.where,
  });
};

export const getWorldEvents = async (query: string) => {
  const res = await queryIndex(query);
  return res.map((item) => ({
    metadata: item.metadata,
    score: item.score,
  }));
};
