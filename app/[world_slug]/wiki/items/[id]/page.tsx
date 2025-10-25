"use cache";

import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { RecentEvents } from "@/components/wiki/RecentEvents";
import { getEventsForItem } from "@/lib/ai/knowledge/event";
import { getItemById } from "@/lib/ai/knowledge/item";
import { cacheTag } from "next/cache";

export async function generateStaticParams() {
  const items = await db.query.items.findMany({
    with: {
      world: true,
    },
  });
  return items.map((item) => ({
    world_slug: item.world.slug,
    id: item.id.toString(),
  }));
}

export default async function ItemWikiPage({
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

  // Get the item
  const item = await getItemById(parseInt(id));

  if (!item || item.worldId !== world.id) {
    notFound();
  }

  // Cache tag for this specific item
  cacheTag(`item-${item.id}`);

  // Get recent events for this item
  const recentEvents = await getEventsForItem(item.id, 10);

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
            <span className="text-foreground">Items</span>
            {" / "}
            <span className="text-foreground font-medium">{item.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Article Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
              {item.name}
            </h1>

            {/* Featured Image (full width on main content) */}
            {item.imageUrl && (
              <Card className="overflow-hidden p-0">
                <div className="relative w-full aspect-video">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground text-center">
                    {item.name}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Description Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {item.description}
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
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Small thumbnail for sidebar */}
                {item.imageUrl && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Item Info */}
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
                        {new Date(item.createdAt).toLocaleDateString()}
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
