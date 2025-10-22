"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import dedent from "dedent";
import { useState } from "react";
import { Response } from "@/components/ai-elements/response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

const firstMessage = dedent`
You arrive in the small village of Misty Hollow, despite it's small size it seems to be bustling. Who are you?
`;

export default function MedievalChat() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    messages: [
      {
        role: "assistant",
        parts: [
          {
            type: "text",
            text: firstMessage,
          },
        ],
        id: "first-message",
      } as UIMessage,
    ],
  });
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col w-full h-full p-4 sm:p-8">
        {/* Main container */}
        <div className="flex flex-col h-full shadow-2xl rounded-sm border-4 border-medieval-border-dark relative overflow-hidden">
          {/* Aged paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuNSIvPjwvc3ZnPg==')]" />

          {/* Title header */}
          <div className="relative bg-linear-to-b from-medieval-border-dark to-medieval-button-bg p-6 border-b-4 border-medieval-button-hover">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-medieval-parchment-light tracking-wider drop-shadow-md">
              ✦ Choose Your Own Adventure ✦
            </h1>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-1 bg-medieval-border-dark rounded-full" />
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 bg-medieval-content-bg">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <Card
                  key={message.id}
                  className={`relative border-2 border-medieval-border-light shadow-md ${
                    message.role === "user"
                      ? "bg-medieval-parchment-dark ml-4 sm:ml-8"
                      : "bg-medieval-parchment mr-4 sm:mr-8"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="font-bold mb-2 text-medieval-text-medium text-xs sm:text-sm uppercase tracking-wide">
                      {message.role === "user"
                        ? "⚔ Your Choice"
                        : "📜 The Story"}
                    </div>
                    <div className="whitespace-pre-wrap text-medieval-text-dark leading-relaxed text-sm sm:text-base">
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
                <Card className="bg-medieval-parchment border-2 border-medieval-border-light shadow-md mx-4 sm:mx-8">
                  <CardContent className="flex items-center justify-center gap-3 p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-medieval-border-dark rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-medieval-border-dark rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-medieval-border-dark rounded-full animate-bounce" />
                    </div>
                    <span className="text-medieval-text-medium italic text-sm">
                      The tale unfolds...
                    </span>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="relative bg-linear-to-t from-medieval-border-dark to-medieval-button-bg p-4 sm:p-6 border-t-4 border-medieval-button-hover">
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
                className="flex-1 bg-medieval-parchment-light border-2 border-medieval-border-dark text-medieval-text-dark placeholder:text-medieval-text-medium placeholder:italic"
              />
              <Button
                type="submit"
                disabled={status !== "ready"}
                className="bg-medieval-button-bg hover:bg-medieval-button-hover text-medieval-parchment-light font-bold px-4 sm:px-6 border-2 border-medieval-button-hover uppercase tracking-wide shadow-lg hover:shadow-xl active:translate-y-0.5 transition-all"
              >
                Choose
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
