import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getAllCharactersInWorld } from "@/lib/ai/knowledge/character";
import { cacheTag } from "next/cache";
import { CharacterCard } from "@/components/CharacterCard";

export default async function CharactersIndexPage({
  params,
}: {
  params: Promise<{ world_slug: string }>;
}) {
  "use cache";

  const { world_slug } = await params;

  // Get the world
  const world = await db.query.worlds.findFirst({
    where: eq(worlds.slug, world_slug),
  });

  if (!world) {
    notFound();
  }

  // Cache tag for characters in this world
  cacheTag(`characters-${world.id}`);

  // Get all characters in this world
  const characters = await getAllCharactersInWorld(world.id);

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
            <span className="text-foreground font-medium">Characters</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
            Characters
          </h1>
          <p className="text-muted-foreground mt-4">
            {characters.length} character{characters.length !== 1 ? "s" : ""} in{" "}
            {world.name}
          </p>
        </div>

        {/* Characters Grid */}
        {characters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No characters have been discovered yet. Start exploring to meet
                new characters!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                href={`/${world_slug}/wiki/characters/${character.id}`}
                variant="wiki"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
