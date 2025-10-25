"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MessageItem } from "./MessageItem";
import { UIMessage } from "ai";

interface MessagesAreaProps {
  messages: UIMessage[];
  status: string;
  error?: Error | null;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

export function MessagesArea({
  messages,
  status,
  error,
  messagesEndRef,
}: MessagesAreaProps) {
  return (
    <ScrollArea className="flex-1 bg-background min-h-0">
      <div className="p-4 sm:p-6 space-y-4">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id || `message-${index}`}
            message={message}
            index={index}
            status={status}
            error={error}
          />
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
  );
}
