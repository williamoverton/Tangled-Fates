import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { RecentEvents } from "@/components/wiki/RecentEvents";
import { getEventsForLocation } from "@/lib/ai/knowledge/event";
import { getLocationById } from "@/lib/ai/knowledge/location";

export default async function LocationWikiPage({
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

  // Get the location
  const location = await getLocationById(parseInt(id));

  if (!location || location.worldId !== world.id) {
    notFound();
  }

  // Get recent events for this location
  const recentEvents = await getEventsForLocation(location.id, 10);

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
            <span className="text-foreground">Locations</span>
            {" / "}
            <span className="text-foreground font-medium">{location.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Article Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
              {location.name}
            </h1>

            {/* Featured Image (full width on main content) */}
            {location.imageUrl && (
              <Card className="overflow-hidden p-0">
                <div className="relative w-full aspect-video">
                  <Image
                    src={location.imageUrl}
                    alt={location.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground text-center">
                    {location.name}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Description Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {location.description}
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
              <CardHeader className="border-b border-border bg-card-foreground/5">
                <CardTitle className="text-center">{location.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Small thumbnail for sidebar */}
                {location.imageUrl && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
                    <Image
                      src={location.imageUrl}
                      alt={location.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Location Info */}
                <div className="space-y-3 text-sm">
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">World</span>
                      <span className="font-medium text-foreground">
                        {world.name}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Discovered</span>
                      <span className="font-medium text-foreground">
                        {new Date(location.createdAt).toLocaleDateString()}
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
