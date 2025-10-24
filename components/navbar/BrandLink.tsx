import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BrandLinkProps {
  className?: string;
}

export function BrandLink({ className = "" }: BrandLinkProps) {
  return (
    <Link href="/" className={className}>
      <Button variant="ghost" size="sm" className="text-foreground font-bold">
        Tangled Fates
      </Button>
    </Link>
  );
}
