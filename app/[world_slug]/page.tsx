import { createPlayer, getAllUserPlayersForWorld } from "@/lib/player/player";
import { getWorldBySlug } from "@/lib/worlds/world";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { CreatePlayerDialog } from "@/components/CreatePlayerDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WorldPage({
  params,
}: {
  params: Promise<{ world_slug: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const { world_slug } = await params;

  const world = await getWorldBySlug(world_slug);

  if (!world) {
    return notFound();
  }

  // Get user's players for this world
  const players = await getAllUserPlayersForWorld(world, userId);

  // Server action for creating a player
  const createPlayerForWorld = async (
    playerName: string,
    playerDescription: string
  ) => {
    "use server";
    const player = await createPlayer(
      world,
      userId,
      playerName,
      playerDescription
    );
    return player;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{world.name}</h1>
        <p className="text-muted-foreground">
          Select a character to begin your adventure
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Characters</h2>
          <CreatePlayerDialog
            worldSlug={world_slug}
            onCreatePlayer={createPlayerForWorld}
          />
        </div>

        {players.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You don&apos;t have any characters yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Create your first character to start your adventure!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/${world_slug}/play/${player.id}`}
                className="block transition-transform hover:scale-105"
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{player.name}</CardTitle>
                    {player.description && (
                      <CardDescription className="line-clamp-3">
                        {player.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <span>Play as {player.name}</span>
                    </Button>
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
