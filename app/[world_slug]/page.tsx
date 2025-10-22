import { db } from "@/lib/db/client";
import { worlds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getInitialMessage } from "@/lib/ai/chatbot/initialMessage";
import MainChat from "@/components/MainChat";

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

  const initialMessage = await getInitialMessage(world);
  return (
    <div>
      <MainChat initialMessage={initialMessage.text} title={world.name} />
    </div>
  );
}
