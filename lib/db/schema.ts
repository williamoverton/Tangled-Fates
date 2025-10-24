import {
  integer,
  pgTable,
  varchar,
  text,
  vector,
  index,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Different worlds / Games that can be played
export const worlds = pgTable("worlds", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow()
    .$defaultFn(() => new Date()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  slug: varchar("slug", { length: 255 }),
});

// Locations in the world
export const locations = pgTable(
  "locations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$defaultFn(() => new Date()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    worldId: integer("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    imageUrl: text("image_url"),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("locations_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const locationRelations = relations(locations, ({ one }) => ({
  world: one(worlds, {
    fields: [locations.worldId],
    references: [worlds.id],
  }),
}));

// Characters in the world
export const characters = pgTable(
  "characters",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$defaultFn(() => new Date()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    worldId: integer("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    imageUrl: text("image_url"),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("characters_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const characterRelations = relations(characters, ({ one }) => ({
  world: one(worlds, {
    fields: [characters.worldId],
    references: [worlds.id],
  }),
}));

// Items in the world
export const items = pgTable(
  "items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$defaultFn(() => new Date()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    worldId: integer("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    imageUrl: text("image_url"),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("items_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const itemRelations = relations(items, ({ one }) => ({
  world: one(worlds, {
    fields: [items.worldId],
    references: [worlds.id],
  }),
}));

// Players (users)
export const players = pgTable(
  "players",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    worldId: integer("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$defaultFn(() => new Date()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url"),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("players_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const playerRelations = relations(players, ({ one }) => ({
  world: one(worlds, {
    fields: [players.worldId],
    references: [worlds.id],
  }),
}));

// Events that happened in the world and the corresponding location, character, player, and item (if applicable)
export const events = pgTable(
  "events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$defaultFn(() => new Date()),
    description: text("description").notNull(),
    worldId: integer("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),
    locationId: integer("location_id").references(() => locations.id, {
      onDelete: "cascade",
    }),
    characterId: integer("character_id").references(() => characters.id, {
      onDelete: "cascade",
    }),
    playerId: integer("player_id").references(() => players.id, {
      onDelete: "cascade",
    }),
    itemId: integer("item_id").references(() => items.id, {
      onDelete: "cascade",
    }),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("events_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const eventRelations = relations(events, ({ one }) => ({
  location: one(locations, {
    fields: [events.locationId],
    references: [locations.id],
  }),
  character: one(characters, {
    fields: [events.characterId],
    references: [characters.id],
  }),
  player: one(players, {
    fields: [events.playerId],
    references: [players.id],
  }),
  item: one(items, {
    fields: [events.itemId],
    references: [items.id],
  }),
}));

export const chatHistory = pgTable("chat_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow()
    .$defaultFn(() => new Date()),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" })
    .unique(),
  messages: jsonb("messages").notNull(),
});
