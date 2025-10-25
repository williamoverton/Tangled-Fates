"use cache";

import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { RecentEvents } from "@/components/wiki/RecentEvents";
import { getEventsForPlayer } from "@/lib/ai/knowledge/event";
import { getPlayerById } from "@/lib/ai/knowledge/player";
import { cacheTag } from "next/cache";

export async function generateStaticParams() {
  const players = await db.query.players.findMany({
    with: {
      world: true,
    },
  });
  return players.map((player) => ({
    world_slug: player.world.slug,
    id: player.id.toString(),
  }));
}

export default async function PlayerWikiPage({
  params,
}: {
  params: Promise<{ world_slug: string; id: string }>;
}) {
  const { world_slug, id } = await params;

  // Get the world
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.slug, world_slug),
  });

  if (!world) {
    notFound();
  }

  // Get the player
  const player = await getPlayerById(parseInt(id));

  if (!player || player.worldId !== world.id) {
    notFound();
  }

  // Cache tag for this specific player
  cacheTag(`player-${player.id}`);

  // Get recent events for this player
  const recentEvents = await getEventsForPlayer(player.id, 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground mb-4">
            <a
              href={`/${world_slug}`}
              className="hover:text-foreground transition-colors"
            >
              {world.name}
            </a>
            {" / "}
            <span className="text-foreground">Players</span>
            {" / "}
            <span className="text-foreground font-medium">{player.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Article Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
              {player.name}
            </h1>

            {/* Featured Image (full width on main content) */}
            {player.imageUrl && (
              <Card className="overflow-hidden p-0">
                <div className="relative w-full aspect-video">
                  <Image
                    src={player.imageUrl}
                    alt={player.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground text-center">
                    {player.name}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Description Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {player.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Events Section */}
            <RecentEvents events={recentEvents} />
          </div>

          {/* Sidebar Info Box */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="">
                <CardTitle className="text-center text-xl font-bold">
                  {player.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Small thumbnail for sidebar */}
                {player.imageUrl && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
                    <Image
                      src={player.imageUrl}
                      alt={player.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Player Info */}
                <div className="space-y-3 text-sm">
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">World</span>
                      <span className="font-medium text-foreground">
                        {world.name}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Joined</span>
                      <span className="font-medium text-foreground">
                        {new Date(player.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
