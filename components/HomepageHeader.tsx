"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { GitHubIcon } from "@/components/ui/github-icon";

export function HomepageHeader() {
  const pathname = usePathname();

  // Only show header on homepage
  if (pathname !== "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              Tangled Fates
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* GitHub Link */}
          <a
            href="https://github.com/williamoverton/Tangled-Fates"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            aria-label="View on GitHub"
          >
            <GitHubIcon className="w-5 h-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
