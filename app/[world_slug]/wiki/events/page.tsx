"use cache";

import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getAllEventsInWorld } from "@/lib/ai/knowledge/event";
import { RecentEvents } from "@/components/wiki/RecentEvents";
import { cacheTag } from "next/cache";

export async function generateStaticParams() {
  const worlds = await db.query.worlds.findMany();
  return worlds.map((world) => ({
    world_slug: world.slug,
  }));
}

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
        </div>

        {/* Use the upgraded RecentEvents component */}
        <RecentEvents
          events={events}
          maxEvents={100}
          world_slug={world_slug}
          showTimeline={true}
          title="World Events"
          showHeader={true}
        />
      </div>
    </div>
  );
}
