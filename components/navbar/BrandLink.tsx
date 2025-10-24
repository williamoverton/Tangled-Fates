import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BrandLinkProps {
  className?: string;
}

export function BrandLink({ className = "" }: BrandLinkProps) {
  return (
    <Link href="/" className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="text-foreground font-bold text-lg px-4 py-2 hover:bg-accent/20 hover:text-accent transition-all duration-200 border border-transparent hover:border-accent/30 rounded-lg group"
      >
        <span className="flex items-center gap-2">
          <span className="text-accent group-hover:text-accent transition-colors duration-200">
            ⚔️
          </span>
          <span className="bg-linear-to-r from-foreground to-accent bg-clip-text text-transparent group-hover:from-accent group-hover:to-foreground transition-all duration-200">
            Tangled Fates
          </span>
        </span>
      </Button>
    </Link>
  );
}
