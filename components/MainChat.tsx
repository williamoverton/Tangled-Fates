"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useState, useEffect, useRef } from "react";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { players, worlds } from "@/lib/db/schema";
import { UIEvent } from "@/lib/ai/knowledge/types";
import { ChatSidebar } from "@/components/ChatSidebar";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PanelRightOpen, PanelRightClose } from "lucide-react";

export default function MainChat({
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
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        worldId: world.id,
        playerId: player.id,
      },
    }),
    messages: initialMessages,
  });
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <div className="flex w-full h-full">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Main container */}
        <div className="flex flex-col h-full shadow-2xl border border-ui-border-strong relative overflow-hidden bg-background">
          {/* Title header */}
          <div className="relative bg-muted p-2 border-b border-ui-border-strong shrink-0 shadow-md z-10">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 tracking-tight grow items-start">
                <div className="text-xl font-bold text-center text-foreground-muted tracking-tight">
                  {title}
                </div>
                <span className="text-xl font-bold text-center text-foreground tracking-tight">
                  -
                </span>
                <div className="text-xl font-bold text-center tracking-tight text-accent">
                  {player.name}
                </div>
              </div>
              <div className="flex justify-end gap-2 pr-2 min-w-0 shrink-0">
                {/* Audio controls */}
                <div className="min-w-0 shrink-0">
                  <AudioPlayer messages={messages} status={status} />
                </div>

                {/* Sidebar toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="bg-background hover:bg-accent hover:text-accent-foreground shrink-0"
                  title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                  {sidebarOpen ? (
                    <PanelRightClose className="h-5 w-5" />
                  ) : (
                    <PanelRightOpen className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            {/* Fade overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-b from-background to-transparent pointer-events-none translate-y-full" />
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 bg-background min-h-0">
            <div className="p-4 sm:p-6 space-y-4">
              {messages.map((message, index) => (
                <Card
                  // TODO: Fix messages sometimes missing ids
                  key={message.id || `message-${index}`}
                  className={`relative border border-ui-border shadow-lg ${
                    message.role === "user"
                      ? "bg-ui-card-bg-alt ml-4 sm:ml-12"
                      : "bg-ui-card-bg mr-4 sm:mr-12"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="font-semibold mb-2 text-ui-accent text-xs sm:text-sm uppercase tracking-wide">
                      {message.role === "user" ? "You" : "Story"}
                    </div>
                    <div className="text-ui-text-primary leading-relaxed text-sm sm:text-base">
                      {message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          case "reasoning":
                            return (
                              status === "streaming" && (
                                <Response
                                  key={`${message.id}-${i}`}
                                  className="text-sm text-muted-foreground"
                                >
                                  {part.text}
                                </Response>
                              )
                            );
                          default:
                            return null;
                        }
                      })}
                      {error && (
                        <Response className="text-sm text-destructive">
                          {error.message}
                        </Response>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(status === "submitted" || status === "streaming") && (
                <Card className="bg-ui-card-bg border border-ui-border shadow-lg mx-4 sm:mx-12">
                  <CardContent className="p-3">
                    <LoadingSpinner
                      variant="dots"
                      text="Generating response..."
                      className="justify-center"
                    />
                  </CardContent>
                </Card>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="relative bg-linear-to-t from-ui-card-bg to-ui-card-bg-alt p-4 sm:p-6 border-t border-ui-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
              className="flex gap-2 sm:gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={status !== "ready"}
                placeholder="What do you do next?..."
                className="flex-1 bg-input border border-ui-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ui-accent"
              />
              <Button
                type="submit"
                disabled={status !== "ready"}
                className="bg-ui-accent hover:bg-ui-accent-hover text-background font-semibold px-4 sm:px-6 shadow-lg hover:shadow-xl transition-all"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <ChatSidebar player={player} recentEvents={recentEvents} />
      )}
    </div>
  );
}
