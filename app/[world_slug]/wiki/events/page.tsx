"use cache";

import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getAllEventsInWorld } from "@/lib/ai/knowledge/event";
import Link from "next/link";
import { cacheTag } from "next/cache";

export default async function EventsIndexPage({
  params,
}: {
  params: Promise<{ world_slug: string }>;
}) {
  const { world_slug } = await params;

  // Get the world
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.slug, world_slug),
  });

  if (!world) {
    notFound();
  }

  // Cache tag for events in this world
  cacheTag(`events-${world.id}`);

  // Get the last 100 events in this world
  const events = await getAllEventsInWorld(world.id, 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <nav className="text-sm text-muted-foreground mb-4">
            <a
              href={`/${world_slug}`}
              className="hover:text-foreground transition-colors"
            >
              {world.name}
            </a>
            {" / "}
            <span className="text-foreground font-medium">Events</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
            World Events
          </h1>
          <p className="text-muted-foreground mt-4">
            A timeline of the most recent {events.length} event
            {events.length !== 1 ? "s" : ""} in {world.name}
          </p>
        </div>

        {/* Events Timeline */}
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No events have occurred yet. Start playing to make history!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

            {/* Events */}
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="relative pl-20">
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-5 h-5 rounded-full bg-primary border-4 border-background" />

                  <Card className="transition-all hover:shadow-md hover:border-primary/50">
                    <CardContent className="pt-6">
                      {/* Event timestamp */}
                      <div className="text-xs text-muted-foreground mb-3">
                        {new Date(event.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>

                      {/* Event description */}
                      <p className="text-base mb-4">{event.description}</p>

                      {/* Related entities */}
                      <div className="flex flex-wrap gap-2 text-sm">
                        {event.locations?.map((locationRelation) => (
                          <Link
                            key={locationRelation.location.id}
                            href={`/${world_slug}/wiki/locations/${locationRelation.location.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {locationRelation.location.name}
                          </Link>
                        ))}

                        {event.characters?.map((characterRelation) => (
                          <Link
                            key={characterRelation.character.id}
                            href={`/${world_slug}/wiki/characters/${characterRelation.character.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-500/20 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {characterRelation.character.name}
                          </Link>
                        ))}

                        {event.players?.map((playerRelation) => (
                          <Link
                            key={playerRelation.player.id}
                            href={`/${world_slug}/wiki/players/${playerRelation.player.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md hover:bg-green-500/20 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {playerRelation.player.name}
                          </Link>
                        ))}

                        {event.items?.map((itemRelation) => (
                          <Link
                            key={itemRelation.item.id}
                            href={`/${world_slug}/wiki/items/${itemRelation.item.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-500/20 transition-colors"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            {itemRelation.item.name}
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
