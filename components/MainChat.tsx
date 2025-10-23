"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { useState, useEffect, useRef } from "react";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { players, worlds } from "@/lib/db/schema";

export default function MainChat({
  initialMessages,
  title,
  world,
  player,
}: {
  initialMessages: UIMessage[];
  title: string;
  world: typeof worlds.$inferSelect;
  player: typeof players.$inferSelect;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col w-full h-full">
        {/* Main container */}
        <div className="flex flex-col h-full shadow-2xl border border-ui-border-strong relative overflow-hidden bg-background">
          {/* Title header */}
          <div className="relative bg-linear-to-r from-ui-card-bg via-ui-card-bg-alt to-ui-card-bg p-2 border-b border-ui-border shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-foreground tracking-tight">
              {title} - {player.name}
            </h1>
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
                  <CardContent className="flex items-center justify-center gap-3 p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-ui-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-ui-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-ui-accent rounded-full animate-bounce" />
                    </div>
                    <span className="text-ui-text-secondary text-sm">
                      Generating...
                    </span>
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
    </div>
  );
}
