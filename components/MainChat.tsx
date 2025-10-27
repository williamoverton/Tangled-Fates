"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useState, useEffect, useRef } from "react";
import { players, worlds } from "@/lib/db/schema";
import { UIEvent } from "@/lib/ai/knowledge/types";
import { ChatSidebar } from "@/components/ChatSidebar";
import {
  RealtimeWrapper,
  ChatHeader,
  MessagesArea,
  ChatInput,
} from "@/components/chat";
import { useChannel } from "ably/react";
import * as Ably from "ably";

function MainChat({
  initialMessages,
  title,
  world,
  player,
  recentEvents,
}: {
  initialMessages: UIMessage[];
  title: string;
  world: typeof worlds.$inferSelect;
  player: typeof players.$inferSelect;
  recentEvents: UIEvent[];
}) {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(player);
  const [currentRecentEvents, setCurrentRecentEvents] = useState(recentEvents);
  const [playerPulse, setPlayerPulse] = useState(false);

  useChannel(`player-${player.id}`, (message: Ably.Message) => {
    // TODO: check type of message.data.player
    const newPlayer = message.data.player as typeof players.$inferSelect;

    setCurrentPlayer(newPlayer);
    setPlayerPulse(true);
  });

  useChannel(`world_event-${world.id}`, (message: Ably.Message) => {
    const newEvent = message.data.event as UIEvent;
    setCurrentRecentEvents([newEvent, ...currentRecentEvents]);
  });

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        worldId: world.id,
        playerId: currentPlayer.id,
      },
    }),
    messages: initialMessages,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll when messages change or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Reset pulse animation after it completes
  useEffect(() => {
    if (playerPulse) {
      const timer = setTimeout(() => {
        setPlayerPulse(false);
      }, 800); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [playerPulse]);

  return (
    <div className="flex w-full h-full">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Main container */}
        <div className="flex flex-col h-full shadow-2xl border border-ui-border-strong relative overflow-hidden bg-background">
          {/* Title header */}
          <ChatHeader
            title={title}
            playerName={currentPlayer.name}
            messages={messages}
            status={status}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            playerPulse={playerPulse}
          />

          {/* Messages area */}
          <MessagesArea
            messages={messages}
            status={status}
            error={error}
            messagesEndRef={messagesEndRef}
          />

          {/* Input area */}
          <ChatInput
            input={input}
            setInput={setInput}
            status={status}
            onSendMessage={(text) => sendMessage({ text })}
          />
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <ChatSidebar
          player={currentPlayer}
          recentEvents={currentRecentEvents}
          playerPulse={playerPulse}
        />
      )}
    </div>
  );
}

export default function ChatWindow({
  player,
  initialMessages,
  title,
  world,
  recentEvents,
}: {
  player: typeof players.$inferSelect;
  initialMessages: UIMessage[];
  title: string;
  world: typeof worlds.$inferSelect;
  recentEvents: UIEvent[];
}) {
  return (
    <RealtimeWrapper player={player} world={world}>
      <MainChat
        initialMessages={initialMessages}
        title={title}
        world={world}
        player={player}
        recentEvents={recentEvents}
      />
    </RealtimeWrapper>
  );
}
