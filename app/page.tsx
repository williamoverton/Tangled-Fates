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
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Adventure
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a world to begin your interactive story
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worldsList.map((world) => (
            <Link href={`/${world.slug}/`} key={world.id}>
              <Card className="h-full hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {world.name}
                  </CardTitle>
                  <CardDescription>
                    Created {new Date(world.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {world.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
