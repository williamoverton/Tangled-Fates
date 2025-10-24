import { db } from "../../lib/db/client";
import { CreateWorldDialog } from "../../components/CreateWorldDialog";
import { WorldCard } from "../../components/WorldCard";
import { cacheTag } from "next/cache";

async function getWorlds() {
  return await db.query.worlds.findMany({
    orderBy: (worlds, { desc }) => [desc(worlds.createdAt)],
  });
}

export default async function WorldsPage() {
  "use cache";
  cacheTag("worlds");

  const worldsList = await getWorlds();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Choose Your Adventure</h1>
          <p className="text-muted-foreground mt-2">
            Select a world to begin your journey or create a new one.
          </p>
        </div>
        <CreateWorldDialog />
      </div>

      {worldsList.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No worlds yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first world to start your adventure.
          </p>
          <CreateWorldDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worldsList.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              href={`/${world.slug}`}
              variant="wiki"
            />
          ))}
        </div>
      )}
    </div>
  );
}
