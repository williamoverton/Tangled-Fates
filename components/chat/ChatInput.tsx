"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MicrophoneButton } from "@/components/MicrophoneButton";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  status: string;
  onSendMessage: (text: string) => void;
}

export function ChatInput({
  input,
  setInput,
  status,
  onSendMessage,
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleTranscriptionUpdate = (text: string) => {
    setInput(text);
    // Auto-submit the message
    if (text.trim()) {
      onSendMessage(text);
      setInput("");
    }
  };

  return (
    <div className="relative bg-linear-to-t from-ui-card-bg to-ui-card-bg-alt p-4 sm:p-6 border-t border-ui-border shrink-0">
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="What do you do next?..."
          className="flex-1 bg-input border border-ui-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ui-accent"
        />
        <MicrophoneButton
          onTranscriptionUpdate={handleTranscriptionUpdate}
          disabled={status !== "ready"}
          className="shrink-0"
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
  );
}
