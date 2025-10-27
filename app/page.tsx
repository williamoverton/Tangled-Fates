import { worlds } from "@/lib/db/schema";
import { db } from "@/lib/db/client";
import { WorldCard } from "@/components/wiki/WorldCard";
import { GeneralNavbar } from "@/components/navbar/GeneralNavbar";
import { Button } from "@/components/ui/button";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { desc } from "drizzle-orm";

export default async function Home() {
  "use cache";
  cacheTag("worlds");

  const worldsList = await db
    .select()
    .from(worlds)
    .limit(6)
    .orderBy(desc(worlds.createdAt));

  return (
    <div className="min-h-screen">
      <GeneralNavbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Dynamic Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-background to-accent/10"></div>

        {/* Subtle Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Logo / Title */}
            <div className="space-y-6 animate-fade-in-up">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-size-[200%_auto]">
                  Tangled Fates
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-foreground font-bold">
                Roll the Dice. Change Everything.
              </p>
            </div>

            {/* Main Tagline */}
            <p className="text-xl md:text-2xl text-foreground/90 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Jump into Tangled Fates where your wild decisions actually matter!
              An AI Dungeon Master weaves your chaos into a massive shared
              world. Slay dragons, betray allies, save villages—or burn them
              down. It's D&D meets MMO, and it's absolutely bonkers. Start Your
              Adventure
            </p>

            {/* Main CTA Button */}
            <div className="animate-fade-in-up animation-delay-400">
              {worldsList.length > 0 ? (
                <div className="space-y-6">
                  <div className="inline-flex flex-col items-center gap-4">
                    <Button
                      size="lg"
                      className="text-xl px-10 py-6 h-auto font-semibold bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      asChild
                    >
                      <Link href="/worlds">Start Your Adventure</Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="font-medium">
                        {worldsList.length} world
                        {worldsList.length !== 1 ? "s" : ""} available
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="inline-flex flex-col items-center gap-4">
                    <Button
                      size="lg"
                      className="text-xl px-10 py-6 h-auto font-semibold bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      asChild
                    >
                      <Link href="/worlds">Explore Worlds</Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="font-medium">
                        New worlds coming soon
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 pt-8 animate-fade-in-up animation-delay-600">
              <div className="px-6 py-3 rounded-full bg-card/90 backdrop-blur-sm border border-primary/40 shadow-lg shadow-primary/20">
                <span className="text-sm font-medium text-primary">
                  🤖 AI-Powered Stories
                </span>
              </div>
              <div className="px-6 py-3 rounded-full bg-card/90 backdrop-blur-sm border border-accent/40 shadow-lg shadow-accent/20">
                <span className="text-sm font-medium text-accent">
                  🌍 Shared Living Worlds
                </span>
              </div>
              <div className="px-6 py-3 rounded-full bg-card/90 backdrop-blur-sm border border-primary/40 shadow-lg shadow-primary/20">
                <span className="text-sm font-medium text-primary">
                  📖 Collaborative Wiki
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Worlds Selection Section - Main CTA */}
      <section id="worlds" className="relative py-24 px-4 overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-accent/50 to-transparent"></div>

        <div className="container mx-auto max-w-7xl relative">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Choose Your World
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Each world is a unique universe with its own lore, characters, and
              mysteries waiting to be unraveled.
              <span className="text-primary font-semibold pl-1">
                Your adventure starts here.
              </span>
            </p>
          </div>

          {/* Worlds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {worldsList.map((world, index) => (
              <div
                key={world.id}
                className="animate-fade-in-up group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <WorldCard
                  world={world}
                  href={`/${world.slug}/`}
                  variant="select"
                  actionLabel="Enter World"
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {worldsList.length === 0 && (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/30 mb-8 border-2 border-dashed border-muted-foreground/30">
                <svg
                  className="w-12 h-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3">No Worlds Yet</h3>
              <p className="text-muted-foreground text-lg">
                New worlds will appear here soon
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="relative py-20 px-4 bg-linear-to-b from-background via-card/30 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                  ✨
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Choose Your Adventure
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Make meaningful choices that shape your unique story. Every
                  decision matters in these dynamic, AI-generated narratives.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-2xl">
                  🔗
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Shared Discoveries
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you discover something, it becomes part of the
                  world&apos;s wiki. Your findings influence every other
                  player&apos;s journey.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                  🌊
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Living, Breathing World
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  The world evolves with every player&apos;s actions. Return to
                  find new characters, items, and events shaped by the
                  community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-primary/10 via-background to-transparent"></div>

        <div className="relative container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Your Adventure Awaits
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join a community of adventurers. Every story you create, every
              secret you uncover, becomes part of a living legend.
            </p>
          </div>

          <Button
            size="lg"
            className="text-lg px-12 py-4 h-auto font-semibold bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link href="/worlds">Begin Your Journey</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
