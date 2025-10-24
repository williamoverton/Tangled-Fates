"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreatePlayerDialogProps {
  worldSlug: string;
  onCreatePlayer: (
    playerName: string,
    playerDescription: string
  ) => Promise<{ id: number }>;
}

export function CreatePlayerDialog({
  worldSlug,
  onCreatePlayer,
}: CreatePlayerDialogProps) {
  const [open, setOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playerDescription, setPlayerDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !playerDescription.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const player = await onCreatePlayer(playerName, playerDescription);
      // Reset form
      setPlayerName("");
      setPlayerDescription("");
      // Close dialog and wait for animation to complete
      setOpen(false);
      // Wait for dialog to close before navigating
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Navigate to the player's page
      router.push(`/${worldSlug}/play/${player.id}`);
    } catch (error) {
      console.error("Failed to create player:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Player</DialogTitle>
            <DialogDescription>
              Create a new character to explore the world. Give them a name and
              description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="player-name">Name</Label>
              <Input
                id="player-name"
                placeholder="Enter player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="player-description">Description</Label>
              <Textarea
                id="player-description"
                placeholder="Describe your character..."
                value={playerDescription}
                onChange={(e) => setPlayerDescription(e.target.value)}
                disabled={isSubmitting}
                required
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
