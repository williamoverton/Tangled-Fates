import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WorldCardProps {
  world: {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
    createdAt: Date;
    slug: string;
  };
  href: string;
  variant?: "wiki" | "select";
  actionLabel?: string;
}

export function WorldCard({
  world,
  href,
  variant = "wiki",
  actionLabel,
}: WorldCardProps) {
  const isWikiVariant = variant === "wiki";

  return (
    <Link
      href={href}
      className={
        isWikiVariant ? "group" : "block transition-transform hover:scale-105"
      }
    >
      <Card
        className={`h-full overflow-hidden p-0 hover:shadow-lg flex flex-col ${
          isWikiVariant
            ? "transition-all hover:border-primary/50 hover:scale-[1.02]"
            : "cursor-pointer transition-shadow"
        }`}
      >
        {/* World Image */}
        <div className={`relative w-full bg-muted shrink-0 aspect-square`}>
          {world.imageUrl ? (
            <Image
              src={world.imageUrl}
              alt={world.name}
              fill
              className={
                isWikiVariant
                  ? "object-cover transition-transform group-hover:scale-105"
                  : "object-cover"
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Globe className="w-16 h-16" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* World Info - Scrollable area */}
        <CardHeader
          className={`${
            isWikiVariant ? "pb-3" : "flex-1 flex flex-col justify-start p-4"
          } ${!isWikiVariant ? "" : ""}`}
        >
          <CardTitle
            className={
              isWikiVariant
                ? "text-lg group-hover:text-primary transition-colors"
                : undefined
            }
          >
            {world.name}
          </CardTitle>
          {world.description && (
            <CardDescription
              className={
                isWikiVariant
                  ? "text-sm line-clamp-3"
                  : "text-sm line-clamp-2 h-10"
              }
            >
              {world.description}
            </CardDescription>
          )}
        </CardHeader>

        {/* Footer - Always visible */}
        <CardContent className={`shrink-0 ${!isWikiVariant ? "p-4 pt-0" : ""}`}>
          {isWikiVariant && (
            <p className="text-xs text-muted-foreground">
              Created {new Date(world.createdAt).toLocaleDateString()}
            </p>
          )}
          {!isWikiVariant && (
            <Button variant="outline" className="w-full" asChild>
              <span>{actionLabel || `Enter ${world.name}`}</span>
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
