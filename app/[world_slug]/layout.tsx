import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WorldLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ world_slug: string }>;
}) {
  const { world_slug } = await params;

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 gap-4 h-16 text-white bg-medieval-header-bg border-b border-border shrink-0">
        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          <Link href={`/${world_slug}`}>
            <Button variant="ghost" size="sm" className="text-foreground">
              Play
            </Button>
          </Link>
          <Link href={`/${world_slug}/wiki/characters`}>
            <Button variant="ghost" size="sm" className="text-foreground">
              Characters
            </Button>
          </Link>
          <Link href={`/${world_slug}/wiki/locations`}>
            <Button variant="ghost" size="sm" className="text-foreground">
              Locations
            </Button>
          </Link>
          <Link href={`/${world_slug}/wiki/players`}>
            <Button variant="ghost" size="sm" className="text-foreground">
              Players
            </Button>
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-clerk-primary text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:opacity-90 transition-opacity">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
