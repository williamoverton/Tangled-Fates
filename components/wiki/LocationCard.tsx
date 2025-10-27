import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Response } from "@/components/ai-elements/response";

interface LocationCardProps {
  location: {
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

export function LocationCard({
  location,
  href,
  variant = "wiki",
  actionLabel,
}: LocationCardProps) {
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
        {/* Location Image */}
        <div className="relative w-full aspect-square bg-muted shrink-0">
          {location.imageUrl ? (
            <Image
              src={location.imageUrl}
              alt={location.name}
              fill
              className={
                isWikiVariant
                  ? "object-cover transition-transform group-hover:scale-105"
                  : "object-cover"
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <MapPin className="w-16 h-16" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Location Info - Scrollable area */}
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
            {location.name}
          </CardTitle>
          {location.description && (
            <CardDescription
              className={
                isWikiVariant ? "text-sm line-clamp-3" : "text-sm line-clamp-3"
              }
            >
              <Response className="[&_p]:m-0 [&_p]:p-0 *:m-0 *:p-0">
                {location.description}
              </Response>
            </CardDescription>
          )}
        </CardHeader>

        {/* Footer - Always visible */}
        <CardContent className="shrink-0">
          {isWikiVariant && (
            <p className="text-xs text-muted-foreground">
              Discovered {new Date(location.createdAt).toLocaleDateString()}
            </p>
          )}
          {!isWikiVariant && actionLabel && (
            <p className="text-xs text-muted-foreground text-center">
              {actionLabel}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
