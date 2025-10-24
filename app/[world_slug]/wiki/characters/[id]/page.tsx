import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { RecentEvents } from "@/components/wiki/RecentEvents";
import { getEventsForCharacter } from "@/lib/ai/knowledge/event";
import { getCharacterById } from "@/lib/ai/knowledge/character";

export default async function CharacterWikiPage({
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

  // Get the character
  const character = await getCharacterById(parseInt(id));

  if (!character || character.worldId !== world.id) {
    notFound();
  }

  // Get recent events for this character
  const recentEvents = await getEventsForCharacter(character.id, 10);

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
            <span className="text-foreground">Characters</span>
            {" / "}
            <span className="text-foreground font-medium">
              {character.name}
            </span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Article Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
              {character.name}
            </h1>

            {/* Featured Image (full width on main content) */}
            {character.imageUrl && (
              <Card className="overflow-hidden p-0">
                <div className="relative w-full aspect-video">
                  <Image
                    src={character.imageUrl}
                    alt={character.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground text-center">
                    {character.name}
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
                    {character.description}
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
                  {character.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Small thumbnail for sidebar */}
                {character.imageUrl && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
                    <Image
                      src={character.imageUrl}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Character Info */}
                <div className="space-y-3 text-sm">
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">World</span>
                      <span className="font-medium text-foreground">
                        {world.name}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">First Seen</span>
                      <span className="font-medium text-foreground">
                        {new Date(character.createdAt).toLocaleDateString()}
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
