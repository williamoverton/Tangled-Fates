import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/db/schema";

type Event = typeof events.$inferSelect;

interface RecentEventsProps {
  events: Event[];
  maxEvents?: number;
}

export function RecentEvents({
  events: eventsList,
  maxEvents = 10,
}: RecentEventsProps) {
  const displayEvents = eventsList.slice(0, maxEvents);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Recent Events</CardTitle>
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
                <p className="text-sm text-foreground leading-relaxed mb-1">
                  {event.description}
                </p>
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
