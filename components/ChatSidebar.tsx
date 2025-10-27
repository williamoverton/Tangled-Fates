import Image from "next/image";
import { User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { players } from "@/lib/db/schema";
import { UIEvent } from "@/lib/ai/knowledge/types";

type Player = typeof players.$inferSelect;

interface ChatSidebarProps {
  player: Player;
  recentEvents: UIEvent[];
  playerPulse?: boolean;
}

export function ChatSidebar({
  player,
  recentEvents,
  playerPulse = false,
}: ChatSidebarProps) {
  return (
    <div className="w-80 lg:w-80 md:w-72 sm:w-64 border-l border-ui-border bg-ui-card-bg flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-4 pb-6">
          {/* Player Info Card */}
          <Card className="overflow-hidden border border-ui-border p-0 gap-0">
            <div className="relative w-full aspect-square bg-muted">
              {player.imageUrl ? (
                <Image
                  src={player.imageUrl}
                  alt={player.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <User className="w-16 h-16" strokeWidth={1.5} />
                </div>
              )}
            </div>
            <CardHeader className="px-6 pt-4 pb-2">
              <CardTitle
                className={`text-xl ${
                  playerPulse ? "animate-player-pulse" : ""
                }`}
              >
                {player.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {player.description && (
                <p
                  className={`text-sm text-muted-foreground mb-2 ${
                    playerPulse ? "animate-player-pulse" : ""
                  }`}
                >
                  {player.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1 pb-2">
                <Clock className="w-3 h-3" />
                Joined {new Date(player.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Recent Events Card */}
          <Card className="border border-ui-border">
            <CardHeader>
              <CardTitle className="text-lg">Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border-l-2 border-primary/50 pl-3 py-2 hover:border-primary transition-colors"
                    >
                      <p className="text-xs text-foreground leading-relaxed mb-1">
                        {event.shortDescription || event.description}
                      </p>
                      <time className="text-[10px] text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString("en-US", {
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
        </div>
      </ScrollArea>
    </div>
  );
}
