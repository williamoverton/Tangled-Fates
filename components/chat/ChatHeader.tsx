"use client";

import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { UIMessage } from "ai";

interface ChatHeaderProps {
  title: string;
  playerName: string;
  messages: UIMessage[];
  status: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  title,
  playerName,
  messages,
  status,
  sidebarOpen,
  onToggleSidebar,
}: ChatHeaderProps) {
  return (
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
            {playerName}
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
            onClick={onToggleSidebar}
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
  );
}
