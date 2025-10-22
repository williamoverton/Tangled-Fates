import {
  integer,
  pgTable,
  varchar,
  text,
  jsonb,
  pgEnum,
  vector,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Different worlds / Games that can be played
export const worldTable = pgTable("worlds", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
});
