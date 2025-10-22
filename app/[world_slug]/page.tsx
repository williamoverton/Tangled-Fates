import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getInitialMessage } from "@/lib/ai/chatbot/initialMessage";
import MainChat from "@/components/MainChat";
import { Suspense } from "react";

const Game = async ({ world }: { world: typeof worlds.$inferSelect }) => {
  const initialMessage = await getInitialMessage(world);
  return <MainChat initialMessage={initialMessage.text} title={world.name} />;
};

export default async function WorldPage({
  params,
}: {
  params: Promise<{ world_slug: string }>;
}) {
  "use cache";
  const { world_slug } = await params;

  cacheTag(`world:${world_slug}`);

  const world = await db.query.worlds.findFirst({
    where: eq(worlds.slug, world_slug),
  });

  if (!world) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Game world={world} />
    </Suspense>
  );
}
