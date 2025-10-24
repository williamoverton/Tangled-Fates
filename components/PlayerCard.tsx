import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
  };
  href: string;
  variant?: "wiki" | "select";
  actionLabel?: string;
}

export function PlayerCard({
  player,
  href,
  variant = "wiki",
  actionLabel,
}: PlayerCardProps) {
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
        {/* Player Image */}
        <div className="relative w-full aspect-square bg-muted shrink-0">
          {player.imageUrl ? (
            <Image
              src={player.imageUrl}
              alt={player.name}
              fill
              className={
                isWikiVariant
                  ? "object-cover transition-transform group-hover:scale-105"
                  : "object-cover"
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <User className="w-16 h-16" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Player Info - Scrollable area */}
        <CardHeader
          className={`${isWikiVariant ? "pb-3" : ""} ${
            !isWikiVariant ? "flex-1 overflow-y-auto" : ""
          }`}
        >
          <CardTitle
            className={
              isWikiVariant
                ? "text-lg group-hover:text-primary transition-colors"
                : undefined
            }
          >
            {player.name}
          </CardTitle>
          {player.description && (
            <CardDescription
              className={isWikiVariant ? "text-sm line-clamp-3" : undefined}
            >
              {player.description}
            </CardDescription>
          )}
        </CardHeader>

        {/* Footer - Always visible */}
        <CardContent className="shrink-0">
          {isWikiVariant && (
            <p className="text-xs text-muted-foreground">
              Joined {new Date(player.createdAt).toLocaleDateString()}
            </p>
          )}
          {!isWikiVariant && (
            <Button variant="outline" className="w-full mb-4" asChild>
              <span>{actionLabel || `Play as ${player.name}`}</span>
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
