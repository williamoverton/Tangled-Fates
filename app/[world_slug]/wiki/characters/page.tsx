import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllCharactersInWorld } from "@/lib/ai/knowledge/character";
import Image from "next/image";
import Link from "next/link";
import { cacheTag } from "next/cache";

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
              <Link
                key={character.id}
                href={`/${world_slug}/wiki/characters/${character.id}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] p-0">
                  {/* Character Image */}
                  <div className="relative w-full aspect-square bg-muted">
                    {character.imageUrl ? (
                      <Image
                        src={character.imageUrl}
                        alt={character.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <svg
                          className="w-16 h-16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Character Info */}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {character.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {character.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      First seen{" "}
                      {new Date(character.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
