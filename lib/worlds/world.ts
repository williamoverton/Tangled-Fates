import { after } from "next/server";
import { generateImage } from "../ai/image/generateImage";
import { embedKnowledgeItem } from "../ai/knowledge/embed";
import { GameWorldItem } from "../ai/knowledge/types";
import { db } from "../db/client";
import { worlds } from "../db/schema";
import { eq } from "drizzle-orm";
import dedent from "dedent";

export const getWorldBySlug = (slug: string) =>
  db.query.worlds.findFirst({
    where: eq(worlds.slug, slug),
  });

export const createWorld = async (
  name: string,
  description: string,
  slug: string
) => {
  const worldWorld = GameWorldItem.parse({
    type: "world_world",
    name,
    description,
  });

  const [createdWorld] = await db
    .insert(worlds)
    .values({
      name,
      description,
      slug,
      embedding: (await embedKnowledgeItem(worldWorld)).embedding,
    })
    .returning();

  // Generate an image in the background after the world is created
  after(async () => {
    console.log(`Generating image for world ${createdWorld.name}`);

    const imageUrl = await generateImage(dedent`
      ${createdWorld.name} is a world with the following description: ${createdWorld.description}. 
      Generate a beautiful, atmospheric image that represents this world setting.
    `);

    await db
      .update(worlds)
      .set({
        imageUrl,
      })
      .where(eq(worlds.id, createdWorld.id));
  });

  return createdWorld;
};
