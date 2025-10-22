import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getInitialMessage } from "@/lib/ai/chatbot/initialMessage";
import MainChat from "@/components/MainChat";
import { Suspense } from "react";

const Game = async ({
  world,
  playerId,
}: {
  world: typeof worlds.$inferSelect;
  playerId: string;
}) => {
  const initialMessage = await getInitialMessage(world);
  return (
    <MainChat
      initialMessage={initialMessage.text}
      title={world.name}
      world={world}
      playerId={playerId}
    />
  );
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

  const playerId = "123"; // TODO: use auth for playerId

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Game world={world} playerId={playerId} />
    </Suspense>
  );
}
