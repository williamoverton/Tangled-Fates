"use server";

import slugify from "slugify";
import { createWorld } from "../worlds/world";
import { db } from "../db/client";
import { worlds } from "../db/schema";
import { eq } from "drizzle-orm";

export async function createWorldAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name || !description) {
    throw new Error("Name and description are required");
  }

  // Generate slug from name
  const slug = slugify(name, { lower: true, strict: true });

  // Check if slug already exists
  const existingWorld = await db.query.worlds.findFirst({
    where: eq(worlds.slug, slug),
  });

  if (existingWorld) {
    throw new Error("A world with this name already exists");
  }

  // Create the world
  const newWorld = await createWorld(name, description, slug);

  // Return the created world for client-side navigation
  return newWorld;
}
