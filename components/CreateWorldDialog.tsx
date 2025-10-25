"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LoadingSpinner } from "./ui/loading-spinner";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { createWorldAction } from "../lib/actions/world";

export function CreateWorldDialog() {
  const [open, setOpen] = useState(false);
  const [worldName, setWorldName] = useState("");
  const [worldDescription, setWorldDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!worldName.trim() || !worldDescription.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", worldName);
      formData.append("description", worldDescription);

      const result = await createWorldAction(formData);

      // Reset form
      setWorldName("");
      setWorldDescription("");
      // Close dialog and wait for animation to complete
      setOpen(false);
      // Wait for dialog to close before navigating
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Navigate to the new world page
      router.push(`/${result.slug}`);
    } catch (error) {
      console.error("Error creating world:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New World</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New World</DialogTitle>
          <DialogDescription>
            Create a new world for your choose-your-own-adventure game.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">World Name</Label>
              <Input
                id="name"
                placeholder="Enter world name"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your world..."
                value={worldDescription}
                onChange={(e) => setWorldDescription(e.target.value)}
                disabled={isLoading}
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <LoadingSpinner variant="inline" size="sm" text="Creating..." />
              ) : (
                "Create World"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
