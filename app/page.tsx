import { worlds } from "@/lib/db/schema";
import { db } from "@/lib/db/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cacheTag } from "next/cache";
import Link from "next/link";

export default async function Home() {
  "use cache";
  cacheTag("worlds");

  const worldsList = await db.select().from(worlds);
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Choose Your Adventure</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worldsList.map((world) => (
          <Link href={`/${world.slug}/`} key={world.id}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{world.name}</CardTitle>
                <CardDescription>
                  {new Date(world.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{world.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
