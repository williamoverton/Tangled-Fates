import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BaseNavbar } from "./BaseNavbar";

interface WorldNavbarProps {
  worldSlug: string;
}

export function WorldNavbar({ worldSlug }: WorldNavbarProps) {
  return (
    <BaseNavbar>
      <Link href={`/${worldSlug}`}>
        <Button variant="ghost" size="sm" className="text-foreground">
          Play
        </Button>
      </Link>
      <Link href={`/${worldSlug}/wiki/characters`}>
        <Button variant="ghost" size="sm" className="text-foreground">
          Characters
        </Button>
      </Link>
      <Link href={`/${worldSlug}/wiki/locations`}>
        <Button variant="ghost" size="sm" className="text-foreground">
          Locations
        </Button>
      </Link>
      <Link href={`/${worldSlug}/wiki/items`}>
        <Button variant="ghost" size="sm" className="text-foreground">
          Items
        </Button>
      </Link>
      <Link href={`/${worldSlug}/wiki/players`}>
        <Button variant="ghost" size="sm" className="text-foreground">
          Players
        </Button>
      </Link>
      <Link href={`/${worldSlug}/wiki/events`}>
        <Button variant="ghost" size="sm" className="text-foreground">
          Events
        </Button>
      </Link>
    </BaseNavbar>
  );
}
