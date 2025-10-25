"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Response } from "@/components/ai-elements/response";
import { UIMessage } from "ai";

interface MessageItemProps {
  message: UIMessage;
  index: number;
  status: string;
  error?: Error | null;
}

export function MessageItem({
  message,
  index,
  status,
  error,
}: MessageItemProps) {
  return (
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
                  <Response key={`${message.id}-${i}`}>{part.text}</Response>
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
  );
}
