import { worlds } from "@/lib/db/schema";
import { notFound, redirect } from "next/navigation";
import { getInitialMessage } from "@/lib/ai/chatbot/initialMessage";
import ChatWindow from "@/components/MainChat";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getPlayer } from "@/lib/player/player";
import { getWorldBySlug } from "@/lib/worlds/world";
import { getChatHistory } from "@/lib/ai/chatbot/history";
import { UIMessage } from "ai";
import { getEventsForPlayer } from "@/lib/ai/knowledge/event";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
    <ChatWindow
      player={player}
      initialMessages={messages}
      title={world.name}
      world={world}
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
    <Suspense fallback={<LoadingSpinner text="Preparing your story..." />}>
      <Game world={world} playerId={player_id} />
    </Suspense>
  );
}
