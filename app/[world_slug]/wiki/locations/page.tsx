"use cache";

import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllLocationsInWorld } from "@/lib/ai/knowledge/location";
import Image from "next/image";
import Link from "next/link";
import { cacheTag } from "next/cache";

export default async function LocationsIndexPage({
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
              <Link
                key={location.id}
                href={`/${world_slug}/wiki/locations/${location.id}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] p-0">
                  {/* Location Image */}
                  <div className="relative w-full aspect-square bg-muted">
                    {location.imageUrl ? (
                      <Image
                        src={location.imageUrl}
                        alt={location.name}
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Location Info */}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {location.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {location.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">
                      Discovered{" "}
                      {new Date(location.createdAt).toLocaleDateString()}
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
