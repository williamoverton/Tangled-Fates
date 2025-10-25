"use client";

// This audio recorder is mainly AI Slop.

import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "recording" | "processing" | "error";

export interface AudioRecorderReturn {
  isRecording: boolean;
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  error: string | null;
  transcription: string;
  isSupported: boolean;
}

export function useAudioRecorder(
  onTranscriptionComplete: (text: string) => void
): AudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isCancelledRef = useRef<boolean>(false);

  // Check browser support on client side only
  useEffect(() => {
    setIsSupported(typeof MediaRecorder !== "undefined");
  }, []);

  const transcribeAudio = useCallback(async () => {
    try {
      console.log("🔄 Starting transcription...");
      setRecordingState("processing");

      // Create blob from all audio chunks
      const detectedType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, {
        type: detectedType,
      });

      console.log("📤 Sending audio to server:", audioBlob.size, "bytes");

      // Create form data
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Send to transcription API
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      console.log("📥 Server response:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      // Get the transcription result
      const result = await response.json();
      console.log("📝 Transcription result:", result);

      if (result.text && result.text.trim()) {
        setTranscription(result.text);
        onTranscriptionComplete(result.text.trim());
      }

      setRecordingState("idle");
    } catch (err) {
      console.error("❌ Error transcribing audio:", err);
      setError("Transcription failed. Please try again.");
      setRecordingState("error");
    }
  }, [onTranscriptionComplete]);

  const startRecording = useCallback(async () => {
    try {
      console.log("🎤 Starting recording...");
      setError(null);
      setTranscription("");
      setRecordingState("recording");
      audioChunksRef.current = [];
      isCancelledRef.current = false;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      streamRef.current = stream;

      // Create MediaRecorder with fallback format support
      let mimeType = "audio/webm;codecs=opus";

      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else {
          mimeType = "";
        }
      }

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : {}
      );

      mediaRecorderRef.current = mediaRecorder;

      // Collect all audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop - transcribe everything at once
      mediaRecorder.onstop = async () => {
        // Only transcribe if the recording wasn't cancelled
        if (!isCancelledRef.current && audioChunksRef.current.length > 0) {
          await transcribeAudio();
        }
      };

      // Start recording
      mediaRecorder.start();
      console.log("🎤 Recording started successfully");
    } catch (err) {
      console.error("❌ Error starting recording:", err);
      setError("Failed to access microphone. Please check permissions.");
      setRecordingState("error");
    }
  }, [transcribeAudio]);

  const stopRecording = useCallback(() => {
    console.log("🛑 Stopping recording...");
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      console.log("🛑 Recording stopped");
    }
  }, [recordingState]);

  const cancelRecording = useCallback(() => {
    console.log("❌ Canceling recording...");
    isCancelledRef.current = true;

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setRecordingState("idle");
    setTranscription("");
  }, []);

  const isRecording = recordingState === "recording";

  return {
    isRecording,
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    transcription,
    isSupported,
  };
}
