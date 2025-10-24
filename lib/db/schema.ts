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
export const worlds = pgTable(
  "worlds",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow()
      .$defaultFn(() => new Date()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    imageUrl: text("image_url"),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("worlds_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

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

// Events that happened in the world
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
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("events_embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

// Junction tables for many-to-many relationships
export const eventLocations = pgTable("event_locations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  locationId: integer("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
});

export const eventCharacters = pgTable("event_characters", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  characterId: integer("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
});

export const eventPlayers = pgTable("event_players", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
});

export const eventItems = pgTable("event_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
});

export const eventRelations = relations(events, ({ many }) => ({
  locations: many(eventLocations),
  characters: many(eventCharacters),
  players: many(eventPlayers),
  items: many(eventItems),
}));

export const eventLocationRelations = relations(eventLocations, ({ one }) => ({
  event: one(events, {
    fields: [eventLocations.eventId],
    references: [events.id],
  }),
  location: one(locations, {
    fields: [eventLocations.locationId],
    references: [locations.id],
  }),
}));

export const eventCharacterRelations = relations(
  eventCharacters,
  ({ one }) => ({
    event: one(events, {
      fields: [eventCharacters.eventId],
      references: [events.id],
    }),
    character: one(characters, {
      fields: [eventCharacters.characterId],
      references: [characters.id],
    }),
  })
);

export const eventPlayerRelations = relations(eventPlayers, ({ one }) => ({
  event: one(events, {
    fields: [eventPlayers.eventId],
    references: [events.id],
  }),
  player: one(players, {
    fields: [eventPlayers.playerId],
    references: [players.id],
  }),
}));

export const eventItemRelations = relations(eventItems, ({ one }) => ({
  event: one(events, {
    fields: [eventItems.eventId],
    references: [events.id],
  }),
  item: one(items, {
    fields: [eventItems.itemId],
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
