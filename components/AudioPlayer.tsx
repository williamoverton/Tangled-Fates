"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { UIMessage } from "ai";

interface AudioPlayerProps {
  messages: UIMessage[];
  status: string;
}

const MAX_PLAYED_MESSAGES = 100;

// Audio status enum
enum AudioStatus {
  NOT_PLAYING = "NOT_PLAYING",
  LOADING = "LOADING",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
}

// Simple status indicator
function StatusIndicator({
  audioEnabled,
  audioStatus,
  onTogglePlayPause,
}: {
  audioEnabled: boolean;
  audioStatus: AudioStatus;
  onTogglePlayPause: () => void;
}) {
  if (!audioEnabled) return null;

  if (audioStatus === AudioStatus.LOADING) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        Generating audio...
      </div>
    );
  }

  if (
    audioStatus === AudioStatus.PLAYING ||
    audioStatus === AudioStatus.PAUSED
  ) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
          <div
            className="w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePlayPause}
          className="h-6 w-6 p-0"
        >
          {audioStatus === AudioStatus.PAUSED ? (
            <Play className="h-3 w-3" />
          ) : (
            <Pause className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  return null;
}

export function AudioPlayer({ messages, status }: AudioPlayerProps) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>(
    AudioStatus.NOT_PLAYING
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Load audio preference from localStorage after hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("audioEnabled");
      if (saved !== null) {
        setAudioEnabled(JSON.parse(saved));
      }
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const playedMessagesRef = useRef<Set<string>>(new Set());

  // Save audio preference to localStorage
  useEffect(() => {
    localStorage.setItem("audioEnabled", JSON.stringify(audioEnabled));
  }, [audioEnabled]);

  // Generate and play audio for assistant messages
  const playAudio = useCallback(
    async (text: string, messageId: string) => {
      if (!audioEnabled || !text.trim()) return;

      // Check if we've already played this message
      if (playedMessagesRef.current.has(messageId)) {
        return;
      }

      try {
        // Stop any currently playing audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }

        setAudioStatus(AudioStatus.LOADING);

        const response = await fetch(
          `/api/voice?text=${encodeURIComponent(text)}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to generate audio:",
            response.status,
            response.statusText
          );
          setAudioStatus(AudioStatus.NOT_PLAYING);
          return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        // Mark this message as played
        playedMessagesRef.current.add(messageId);

        // Limit the size of the played messages set to prevent memory leaks
        if (playedMessagesRef.current.size > MAX_PLAYED_MESSAGES) {
          const firstMessageId = playedMessagesRef.current
            .values()
            .next().value;
          if (firstMessageId) {
            playedMessagesRef.current.delete(firstMessageId);
          }
        }

        currentAudioRef.current = audio;
        setAudioStatus(AudioStatus.PLAYING);

        audio.onended = () => {
          setAudioStatus(AudioStatus.NOT_PLAYING);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setAudioStatus(AudioStatus.NOT_PLAYING);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onpause = () => {
          setAudioStatus(AudioStatus.PAUSED);
        };

        audio.onplay = () => {
          setAudioStatus(AudioStatus.PLAYING);
        };

        await audio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
        setAudioStatus(AudioStatus.NOT_PLAYING);
      }
    },
    [audioEnabled]
  );

  // Pause/resume current audio
  const togglePlayPause = () => {
    if (currentAudioRef.current) {
      if (audioStatus === AudioStatus.PAUSED) {
        currentAudioRef.current.play();
      } else {
        currentAudioRef.current.pause();
      }
    }
  };

  // Stop current audio completely
  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setAudioStatus(AudioStatus.NOT_PLAYING);
    }
  };

  // Toggle audio on/off
  const toggleAudio = () => {
    if (
      audioEnabled &&
      (audioStatus === AudioStatus.PLAYING ||
        audioStatus === AudioStatus.PAUSED)
    ) {
      stopAudio();
    }
    setAudioEnabled(!audioEnabled);
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  // Play audio for new assistant messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && status === "ready") {
        // Extract text content from the message
        const textContent = lastMessage.parts
          .filter((part) => part.type === "text" && "text" in part)
          .map((part) => part.text)
          .join(" ")
          .trim();

        if (textContent && lastMessage.id) {
          // Use setTimeout to avoid calling setState in effect
          setTimeout(() => {
            playAudio(textContent, lastMessage.id);
          }, 0);
        }
      }
    }
  }, [messages, status, playAudio]);

  return (
    <div className="flex items-center gap-2 min-w-0 max-w-xs">
      {/* Audio status indicator */}
      <StatusIndicator
        audioEnabled={audioEnabled}
        audioStatus={audioStatus}
        onTogglePlayPause={togglePlayPause}
      />

      {/* Audio toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleAudio}
        className="bg-background hover:bg-accent hover:text-accent-foreground shrink-0"
        title={audioEnabled ? "Disable audio" : "Enable audio"}
      >
        {!isHydrated ? (
          <VolumeX className="h-5 w-5" />
        ) : audioEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
