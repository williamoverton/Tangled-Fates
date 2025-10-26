"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { UIEventWithRelations } from "@/lib/ai/knowledge/types";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Response } from "@/components/ai-elements/response";

interface RecentEventsProps {
  events: UIEventWithRelations[];
  maxEvents?: number;
  world_slug?: string;
  showTimeline?: boolean;
  title?: string;
  showHeader?: boolean;
}

interface EventDescriptionProps {
  event: UIEventWithRelations;
  className?: string;
}

function EventDescription({ event, className }: EventDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine what to show as the short description
  const shortDescription =
    event.shortDescription ||
    (event.description.length > 100
      ? event.description.substring(0, 100) + "..."
      : event.description);

  // Only show expand/collapse if there's a meaningful difference between short and full
  const shouldShowToggle =
    event.shortDescription && event.shortDescription !== event.description;

  if (!shouldShowToggle) {
    return <Response className={className}>{event.description}</Response>;
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="space-y-2">
        <Response className={className}>
          {isExpanded ? event.description : shortDescription}
        </Response>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show more
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
  );
}

export function RecentEvents({
  events: eventsList,
  maxEvents = 10,
  world_slug,
  showTimeline = false,
  title = "Recent Events",
  showHeader = true,
}: RecentEventsProps) {
  const displayEvents = eventsList.slice(0, maxEvents);

  if (showTimeline) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          {showHeader && (
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight border-b border-border pb-4">
                {title}
              </h1>
              <p className="text-muted-foreground mt-4">
                A timeline of the most recent {displayEvents.length} event
                {displayEvents.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {/* Events Timeline */}
          {displayEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No events have occurred yet. Start playing to make history!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

              {/* Events */}
              <div className="space-y-6">
                {displayEvents.map((event) => (
                  <div key={event.id} className="relative pl-20">
                    {/* Timeline dot */}
                    <div className="absolute left-6 w-5 h-5 rounded-full bg-primary border-4 border-background" />

                    <Card className="transition-all hover:shadow-md hover:border-primary/50">
                      <CardContent className="pt-6">
                        {/* Event timestamp */}
                        <div className="text-xs text-muted-foreground mb-3">
                          {new Date(event.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </div>

                        {/* Event description */}
                        <EventDescription event={event} className="text-base" />

                        {/* Related entities */}
                        {world_slug && (
                          <div className="flex flex-wrap gap-2 text-sm">
                            {event.locations?.map((locationRelation) => (
                              <Link
                                key={locationRelation.location.id}
                                href={`/${world_slug}/wiki/locations/${locationRelation.location.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {locationRelation.location.name}
                              </Link>
                            ))}

                            {event.characters?.map((characterRelation) => (
                              <Link
                                key={characterRelation.character.id}
                                href={`/${world_slug}/wiki/characters/${characterRelation.character.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-500/20 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {characterRelation.character.name}
                              </Link>
                            ))}

                            {event.players?.map((playerRelation) => (
                              <Link
                                key={playerRelation.player.id}
                                href={`/${world_slug}/wiki/players/${playerRelation.player.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md hover:bg-green-500/20 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {playerRelation.player.name}
                              </Link>
                            ))}

                            {event.items?.map((itemRelation) => (
                              <Link
                                key={itemRelation.item.id}
                                href={`/${world_slug}/wiki/items/${itemRelation.item.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-500/20 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                                {itemRelation.item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Simple card view (original behavior)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No events recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="border-l-2 border-primary/50 pl-4 py-2 hover:border-primary transition-colors"
              >
                <EventDescription
                  event={event}
                  className="text-sm text-foreground leading-relaxed mb-2"
                />

                {/* Related entities */}
                {world_slug && (
                  <div className="flex flex-wrap gap-1 text-xs mb-2">
                    {event.locations?.map((locationRelation) => (
                      <Link
                        key={locationRelation.location.id}
                        href={`/${world_slug}/wiki/locations/${locationRelation.location.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {locationRelation.location.name}
                      </Link>
                    ))}

                    {event.characters?.map((characterRelation) => (
                      <Link
                        key={characterRelation.character.id}
                        href={`/${world_slug}/wiki/characters/${characterRelation.character.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md hover:bg-purple-500/20 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {characterRelation.character.name}
                      </Link>
                    ))}

                    {event.players?.map((playerRelation) => (
                      <Link
                        key={playerRelation.player.id}
                        href={`/${world_slug}/wiki/players/${playerRelation.player.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md hover:bg-green-500/20 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {playerRelation.player.name}
                      </Link>
                    ))}

                    {event.items?.map((itemRelation) => (
                      <Link
                        key={itemRelation.item.id}
                        href={`/${world_slug}/wiki/items/${itemRelation.item.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md hover:bg-amber-500/20 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        {itemRelation.item.name}
                      </Link>
                    ))}
                  </div>
                )}

                <time className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
