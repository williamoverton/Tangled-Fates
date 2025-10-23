import { db } from "../db/client";
import { worlds } from "../db/schema";
import { eq } from "drizzle-orm";

export const getWorldBySlug = (slug: string) =>
  db.query.worlds.findFirst({
    where: eq(worlds.slug, slug),
  });
