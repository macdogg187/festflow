"use client";

import { SetCard } from "@/components/SetCard";
import { ConflictBadge } from "@/components/ConflictBadge";
import { Calendar, ListMusic } from "lucide-react";
import type { FestivalSet, ConflictPair, FestivalDay } from "@/types";

const DAY_LABELS: Record<FestivalDay, string> = {
  friday: "Friday, May 15",
  saturday: "Saturday, May 16",
  sunday: "Sunday, May 17",
};

interface ScheduleTimelineProps {
  day: FestivalDay;
  daySets: FestivalSet[];
  selectedIds: Set<string>;
  selectedSets: FestivalSet[];
  onToggleSet: (setId: string) => void;
  conflicts: ConflictPair[];
}

export function ScheduleTimeline({
  day,
  daySets,
  selectedIds,
  selectedSets,
  onToggleSet,
  conflicts,
}: ScheduleTimelineProps) {
  const conflictIds = new Set(
    conflicts.flatMap((c) => [c.setA.id, c.setB.id])
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-neon-pink" />
        <h2 className="font-[family-name:var(--font-display)] text-lg tracking-wider neon-text-pink">
          {DAY_LABELS[day]}
        </h2>
      </div>

      {conflicts.length > 0 && (
        <div className="mb-4">
          <ConflictBadge conflicts={conflicts} />
        </div>
      )}

      {/* Selected sets (My Lineup) */}
      {selectedSets.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold text-neon-cyan tracking-wider mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-neon-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]" />
            MY LINEUP ({selectedSets.length})
          </h3>
          <div className="space-y-2">
            {selectedSets.map((set) => (
              <SetCard
                key={set.id}
                set={set}
                isSelected={true}
                hasConflict={conflictIds.has(set.id)}
                onToggle={() => onToggleSet(set.id)}
              />
            ))}
          </div>
          <div className="my-4 border-t border-border" />
        </div>
      )}

      {selectedSets.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          No sets selected yet. Tap the + button on any set below, or upload a
          screenshot to auto-detect your lineup.
        </p>
      )}

      {/* Full schedule for the day */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ListMusic className="h-4 w-4 text-neon-yellow/60" />
          <h3 className="text-sm font-bold text-muted-foreground tracking-wider">
            FULL SCHEDULE
          </h3>
        </div>
        <div className="space-y-2">
          {daySets.map((set) => (
            <SetCard
              key={set.id}
              set={set}
              isSelected={selectedIds.has(set.id)}
              hasConflict={conflictIds.has(set.id)}
              onToggle={() => onToggleSet(set.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
