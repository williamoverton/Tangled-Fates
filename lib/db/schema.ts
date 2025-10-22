import {
  integer,
  pgTable,
  varchar,
  text,
  jsonb,
  pgEnum,
  vector,
  index,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Different worlds / Games that can be played
export const worldTable = pgTable("worlds", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow()
    .$defaultFn(() => new Date()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
});

// Locations in the world
export const locationTable = pgTable("locations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow()
    .$defaultFn(() => new Date()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  worldId: integer("world_id").references(() => worldTable.id),
  imageUrl: text("image_url"),
});

export const locationRelations = relations(locationTable, ({ one }) => ({
  world: one(worldTable, {
    fields: [locationTable.worldId],
    references: [worldTable.id],
  }),
}));

// Characters in the world
export const characterTable = pgTable("characters", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow()
    .$defaultFn(() => new Date()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  worldId: integer("world_id").references(() => worldTable.id),
  imageUrl: text("image_url"),
});

export const characterRelations = relations(characterTable, ({ one }) => ({
  world: one(worldTable, {
    fields: [characterTable.worldId],
    references: [worldTable.id],
  }),
}));

// Players (users)
export const playerTable = pgTable("players", {
  id: varchar("id").primaryKey(), // ID from clerk
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow()
    .$defaultFn(() => new Date()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  worldId: integer("world_id").references(() => worldTable.id),
  imageUrl: text("image_url"),
});

export const playerRelations = relations(playerTable, ({ one }) => ({
  world: one(worldTable, {
    fields: [playerTable.worldId],
    references: [worldTable.id],
  }),
}));

// Events that happened in the world and the corresponding location, character, and player (if applicable)
export const eventTable = pgTable("events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow()
    .$defaultFn(() => new Date()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  locationId: integer("location_id").references(() => locationTable.id),
  characterId: integer("character_id").references(() => characterTable.id),
  playerId: varchar("player_id").references(() => playerTable.id),
});

export const eventRelations = relations(eventTable, ({ one }) => ({
  location: one(locationTable, {
    fields: [eventTable.locationId],
    references: [locationTable.id],
  }),
  character: one(characterTable, {
    fields: [eventTable.characterId],
    references: [characterTable.id],
  }),
  player: one(playerTable, {
    fields: [eventTable.playerId],
    references: [playerTable.id],
  }),
}));
