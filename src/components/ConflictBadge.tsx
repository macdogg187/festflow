import { AlertTriangle } from "lucide-react";
import type { ConflictPair } from "@/types";

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

interface ConflictBadgeProps {
  conflicts: ConflictPair[];
}

export function ConflictBadge({ conflicts }: ConflictBadgeProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-neon-red/50 bg-neon-red/5 p-3 neon-border-red">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-neon-red drop-shadow-[0_0_6px_rgba(255,51,51,0.6)]" />
        <span className="text-sm font-bold text-neon-red tracking-wider">
          SCHEDULE CONFLICTS ({conflicts.length})
        </span>
      </div>
      <ul className="space-y-1">
        {conflicts.map((c, i) => (
          <li key={i} className="text-xs text-muted-foreground">
            <span className="font-bold text-neon-pink">
              {c.setA.artist_name}
            </span>{" "}
            ({formatTime(c.setA.start_time)}&ndash;{formatTime(c.setA.end_time)})
            overlaps with{" "}
            <span className="font-bold text-neon-pink">
              {c.setB.artist_name}
            </span>{" "}
            ({formatTime(c.setB.start_time)}&ndash;{formatTime(c.setB.end_time)})
          </li>
        ))}
      </ul>
    </div>
  );
}
