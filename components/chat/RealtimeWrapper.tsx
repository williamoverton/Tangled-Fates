"use client";

import * as Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import { players, worlds } from "@/lib/db/schema";

interface RealtimeWrapperProps {
  player: typeof players.$inferSelect;
  world: typeof worlds.$inferSelect;
  children: React.ReactNode;
}

export function RealtimeWrapper({
  player,
  world,
  children,
}: RealtimeWrapperProps) {
  const realtimeClient = new Ably.Realtime({
    key: process.env.NEXT_PUBLIC_ABLY_SUBSCRIBE_KEY,
    clientId: "default",
  });

  return (
    <AblyProvider client={realtimeClient}>
      <ChannelProvider channelName={`player-${player.id}`}>
        <ChannelProvider channelName={`world_event-${world.id}`}>
          {children}
        </ChannelProvider>
      </ChannelProvider>
    </AblyProvider>
  );
}
