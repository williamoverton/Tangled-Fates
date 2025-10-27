import "server-only";
import * as Ably from "ably";
import { players } from "../db/schema";
import { getEventById } from "../ai/knowledge/event";

const realtimeClient = new Ably.Realtime({
  key: process.env.ABLY_PUBLISH_API_KEY,
  clientId: "server",
});

export const publishPlayerUpdate = async (
  player: typeof players.$inferSelect
) => {
  console.log(`Publishing player update for player ${player.name}`);

  await realtimeClient.channels
    .get(`player-${player.id}`)
    .publish("update", { player });
};

export const publishWorldEvent = async (eventId: number) => {
  const event = await getEventById(eventId);
  if (!event) {
    console.error(`Event ${eventId} not found`);
    return;
  }

  console.log(`Publishing world event for world ${event.worldId}: ${event.id}`);

  await realtimeClient.channels
    .get(`world_event-${event.worldId}`)
    .publish("event", { event });
};
