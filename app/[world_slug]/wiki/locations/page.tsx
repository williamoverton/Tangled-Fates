import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getAllLocationsInWorld } from "@/lib/ai/knowledge/location";
import { cacheTag } from "next/cache";
import { LocationCard } from "@/components/LocationCard";

export default async function LocationsIndexPage({
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

  // Cache tag for locations in this world
  cacheTag(`locations-${world.id}`);

  // Get all locations in this world
  const locations = await getAllLocationsInWorld(world.id);

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
            <span className="text-foreground font-medium">Locations</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
            Locations
          </h1>
          <p className="text-muted-foreground mt-4">
            {locations.length} location{locations.length !== 1 ? "s" : ""} in{" "}
            {world.name}
          </p>
        </div>

        {/* Locations Grid */}
        {locations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No locations have been discovered yet. Start exploring to
                discover new places!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {locations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                href={`/${world_slug}/wiki/locations/${location.id}`}
                variant="wiki"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
