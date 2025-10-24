import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BaseNavbar } from "./BaseNavbar";

export function GeneralNavbar() {
  return (
    <BaseNavbar>
      <Link href="/worlds">
        <Button variant="ghost" size="sm" className="text-foreground">
          Worlds
        </Button>
      </Link>
    </BaseNavbar>
  );
}
