"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, X } from "lucide-react";
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder";

interface MicrophoneButtonProps {
  onTranscriptionUpdate: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MicrophoneButton({
  onTranscriptionUpdate,
  disabled = false,
  className = "",
}: MicrophoneButtonProps) {
  const {
    isRecording,
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    isSupported,
  } = useAudioRecorder(onTranscriptionUpdate);

  const handleClick = async () => {
    if (disabled || !isSupported) return;

    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // Simple state-based rendering
  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={`opacity-50 ${className}`}
        title="Microphone not supported"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  if (error) {
    return (
      <Button
        variant="destructive"
        size="icon"
        disabled
        className={className}
        title={`Error: ${error}`}
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  if (recordingState === "processing") {
    return (
      <Button
        variant="secondary"
        size="icon"
        disabled
        className={className}
        title="Processing audio..."
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      {isRecording && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            cancelRecording();
          }}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          title="Cancel recording"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button
        type="button"
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        disabled={disabled}
        className={`${isRecording ? "animate-pulse" : ""} ${className}`}
        title={isRecording ? "Recording... Click to stop" : "Click to record"}
        onClick={handleClick}
      >
        <Mic className="h-4 w-4" />
      </Button>
    </div>
  );
}
