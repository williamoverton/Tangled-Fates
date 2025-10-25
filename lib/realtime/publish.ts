import * as Ably from "ably";
import { players } from "../db/schema";

export const publishPlayerUpdate = async (
  player: typeof players.$inferSelect
) => {
  console.log(`Publishing player update for player ${player.name}`);

  const realtimeClient = new Ably.Realtime({
    key: process.env.ABLY_PUBLISH_API_KEY,
    clientId: "server",
  });

  const channel = realtimeClient.channels.get(`player-${player.id}`);
  await channel.publish("update", { player });
};
