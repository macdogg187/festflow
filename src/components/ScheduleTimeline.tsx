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
    label: "DESERT",
    icon: Sun,
    textClass: "neon-text-desert",
    borderClass: "border-stage-desert/30",
  },
  "Lake Stage": {
    label: "LAKE",
    icon: Waves,
    textClass: "neon-text-lake",
    borderClass: "border-stage-lake/30",
  },
  "Mountain Stage": {
    label: "MOUNTAIN",
    icon: Mountain,
    textClass: "neon-text-mountain",
    borderClass: "border-stage-mountain/30",
  },
  "Kilby Stage": {
    label: "KILBY",
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

function getHour(time: string): number {
  return parseInt(time.split(":")[0], 10);
}

function getMinute(time: string): number {
  return parseInt(time.split(":")[1], 10);
}

function timeToMinutes(time: string): number {
  return getHour(time) * 60 + getMinute(time);
}

function getDurationMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

function formatHourLabel(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour} ${ampm}`;
}

interface TimeSlot {
  hour: number;
  label: string;
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

  // Compute time range for the day
  const allStartTimes = daySets.map((s) => timeToMinutes(s.start_time));
  const allEndTimes = daySets.map((s) => timeToMinutes(s.end_time));
  const earliestHour = allStartTimes.length > 0 ? Math.floor(Math.min(...allStartTimes) / 60) : 12;
  const latestHour = allEndTimes.length > 0 ? Math.ceil(Math.max(...allEndTimes) / 60) : 23;

  // Build hour slots
  const timeSlots: TimeSlot[] = [];
  for (let h = earliestHour; h <= latestHour; h++) {
    timeSlots.push({ hour: h, label: formatHourLabel(h) });
  }

  // Max duration for duration bar scaling
  const allDurations = daySets.map((s) => getDurationMinutes(s.start_time, s.end_time));
  const maxDuration = allDurations.length > 0 ? Math.max(...allDurations) : 60;

  // For each stage column, figure out which sets belong in each hour slot
  // A set appears in the slot of its start hour
  function getSetsForStageHour(stageName: StageKey, hour: number): FestivalSet[] {
    const stageSets = setsByStage[stageName];
    if (!stageSets) return [];
    return stageSets.filter((s) => getHour(s.start_time) === hour);
  }

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

      {/* Time-oriented grid */}
      <div className="schedule-grid-wrapper rounded-lg border border-border">
        <div className="schedule-grid">
          {/* Header row: empty corner + stage names */}
          <div className="schedule-grid-header schedule-grid-header-cell" />
          {STAGE_ORDER.map((stageName) => {
            const meta = STAGE_META[stageName];
            const Icon = meta.icon;
            return (
              <div
                key={stageName}
                className="schedule-grid-header schedule-grid-header-cell"
              >
                <div className="flex items-center justify-center gap-1">
                  <Icon className={`h-3.5 w-3.5 ${meta.textClass}`} />
                  <span className={meta.textClass}>{meta.label}</span>
                </div>
              </div>
            );
          })}

          {/* Time rows */}
          {timeSlots.map(({ hour, label }) => (
            <TimeRow
              key={hour}
              hour={hour}
              label={label}
              stageOrder={STAGE_ORDER}
              getSetsForStageHour={getSetsForStageHour}
              selectedIds={selectedIds}
              conflictIds={conflictIds}
              onToggleSet={onToggleSet}
              maxDuration={maxDuration}
            />
          ))}
        </div>
      </div>

      {/* MY LINEUP section below the grid */}
      {selectedSets.length > 0 && (
        <div className="mt-6">
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
                variant="list"
              />
            ))}
          </div>
        </div>
      )}

      {selectedSets.length === 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          No sets selected yet. Tap the heart on any set in the grid to add it to your lineup.
        </p>
      )}
    </div>
  );
}

interface TimeRowProps {
  hour: number;
  label: string;
  stageOrder: readonly StageKey[];
  getSetsForStageHour: (stage: StageKey, hour: number) => FestivalSet[];
  selectedIds: Set<string>;
  conflictIds: Set<string>;
  onToggleSet: (setId: string) => void;
  maxDuration: number;
}

function TimeRow({
  hour,
  label,
  stageOrder,
  getSetsForStageHour,
  selectedIds,
  conflictIds,
  onToggleSet,
  maxDuration,
}: TimeRowProps) {
  return (
    <>
      <div className="schedule-grid-time-label">{label}</div>
      {stageOrder.map((stageName) => {
        const sets = getSetsForStageHour(stageName, hour);
        return (
          <div key={stageName} className="schedule-grid-cell">
            {sets.map((set) => (
              <SetCard
                key={set.id}
                set={set}
                isSelected={selectedIds.has(set.id)}
                hasConflict={conflictIds.has(set.id)}
                onToggle={() => onToggleSet(set.id)}
                chelsTier={getChelsTier(set.artist_name)}
                variant="grid"
                maxDurationMinutes={maxDuration}
              />
            ))}
          </div>
        );
      })}
    </>
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
  // Sort each stage group by start_time
  for (const key of Object.keys(groups) as StageKey[]) {
    groups[key]!.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }
  return groups;
}
