import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getAllPlayersInWorld } from "@/lib/ai/knowledge/player";
import { PlayerCard } from "@/components/PlayerCard";

export default async function PlayersIndexPage({
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

  // Get all players in this world
  const players = await getAllPlayersInWorld(world.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            <span className="text-foreground font-medium">Players</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
            Players
          </h1>
          <p className="text-muted-foreground mt-4">
            {players.length} player{players.length !== 1 ? "s" : ""} in{" "}
            {world.name}
          </p>
        </div>

        {/* Players Grid */}
        {players.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No players have joined this world yet. Be the first to start
                your adventure!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                href={`/${world_slug}/wiki/players/${player.id}`}
                variant="wiki"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
