"use client";

import { SetCard } from "@/components/SetCard";
import { ConflictBadge } from "@/components/ConflictBadge";
import { Calendar, Sun, Waves, Mountain, Music } from "lucide-react";
import { getChelsTier } from "@/lib/chels-picks";
import type { FestivalSet, ConflictPair, FestivalDay } from "@/types";
import type { ChelsTier } from "@/lib/chels-picks";

const DAY_LABELS: Record<FestivalDay, string> = {
  friday: "Friday, May 15",
  saturday: "Saturday, May 16",
  sunday: "Sunday, May 17",
};

const STAGE_ORDER = ["Desert Stage", "Lake Stage", "Mountain Stage", "Kilby Stage"] as const;

type StageKey = (typeof STAGE_ORDER)[number];

interface StageMeta {
  label: string;
  icon: React.ElementType;
  textClass: string;
  borderClass: string;
}

const STAGE_META: Record<StageKey, StageMeta> = {
  "Desert Stage": {
    label: "DESERT STAGE",
    icon: Sun,
    textClass: "neon-text-desert",
    borderClass: "border-stage-desert/30",
  },
  "Lake Stage": {
    label: "LAKE STAGE",
    icon: Waves,
    textClass: "neon-text-lake",
    borderClass: "border-stage-lake/30",
  },
  "Mountain Stage": {
    label: "MOUNTAIN STAGE",
    icon: Mountain,
    textClass: "neon-text-mountain",
    borderClass: "border-stage-mountain/30",
  },
  "Kilby Stage": {
    label: "KILBY STAGE",
    icon: Music,
    textClass: "neon-text-pink",
    borderClass: "border-neon-pink/30",
  },
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

  const setsByStage = groupByStage(daySets);

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
                chelsTier={getChelsTier(set.artist_name)}
              />
            ))}
          </div>
          <div className="my-4 border-t border-border" />
        </div>
      )}

      {selectedSets.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          No sets selected yet. Tap the heart on any set below to add it to your lineup.
        </p>
      )}

      {STAGE_ORDER.map((stageName) => {
        const stageSets = setsByStage[stageName];
        if (!stageSets || stageSets.length === 0) return null;

        const meta = STAGE_META[stageName];
        const Icon = meta.icon;

        return (
          <div key={stageName} className="mb-5">
            <div className={`flex items-center gap-2 mb-2 pb-1 border-b ${meta.borderClass}`}>
              <Icon className={`h-4 w-4 ${meta.textClass}`} />
              <h3 className={`text-sm font-bold tracking-wider ${meta.textClass}`}>
                {meta.label}
              </h3>
            </div>
            <div className="space-y-2">
              {stageSets.map((set) => (
                <SetCard
                  key={set.id}
                  set={set}
                  isSelected={selectedIds.has(set.id)}
                  hasConflict={conflictIds.has(set.id)}
                  onToggle={() => onToggleSet(set.id)}
                  chelsTier={getChelsTier(set.artist_name)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function groupByStage(sets: FestivalSet[]): Partial<Record<StageKey, FestivalSet[]>> {
  const groups: Partial<Record<StageKey, FestivalSet[]>> = {};
  for (const set of sets) {
    const key = set.stage as StageKey;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key]!.push(set);
  }
  return groups;
}
