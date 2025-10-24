import { worlds } from "@/lib/db/schema";
import { notFound, redirect } from "next/navigation";
import { getInitialMessage } from "@/lib/ai/chatbot/initialMessage";
import MainChat from "@/components/MainChat";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getPlayer } from "@/lib/player/player";
import { getWorldBySlug } from "@/lib/worlds/world";
import { getChatHistory } from "@/lib/ai/chatbot/history";
import { UIMessage } from "ai";
import { getEventsForPlayer } from "@/lib/ai/knowledge/event";

const Game = async ({
  world,
  playerId,
}: {
  world: typeof worlds.$inferSelect;
  playerId: string;
}) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const player = await getPlayer(world, userId, parseInt(playerId));

  if (!player) {
    return redirect(`/${world.slug}`);
  }

  let messages: UIMessage[] = await getChatHistory(player.id);

  if (messages.length === 0) {
    messages = [
      {
        role: "assistant",
        parts: [
          {
            type: "text",
            text: (await getInitialMessage(world, player)).text,
          },
        ],
        id: "initial-message",
      },
    ];
  }

  // Fetch recent events for the player
  const recentEvents = await getEventsForPlayer(player.id, 10);

  return (
    <MainChat
      initialMessages={messages}
      title={world.name}
      world={world}
      player={player}
      recentEvents={recentEvents}
    />
  );
};

export default async function WorldPage({
  params,
}: {
  params: Promise<{ world_slug: string; player_id: string }>;
}) {
  const { world_slug, player_id } = await params;

  const world = await getWorldBySlug(world_slug);

  if (!world) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col w-full h-full overflow-hidden">
        <Game world={world} playerId={player_id} />
      </div>
    </Suspense>
  );
}
