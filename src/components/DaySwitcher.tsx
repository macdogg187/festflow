"use client";

import type { FestivalDay } from "@/types";

const DAYS: { value: FestivalDay; label: string }[] = [
  { value: "friday", label: "FRI" },
  { value: "saturday", label: "SAT" },
  { value: "sunday", label: "SUN" },
];

interface DaySwitcherProps {
  activeDay: FestivalDay;
  onDayChange: (day: FestivalDay) => void;
}

export function DaySwitcher({ activeDay, onDayChange }: DaySwitcherProps) {
  return (
    <div className="flex gap-2 w-full">
      {DAYS.map((d) => {
        const isActive = activeDay === d.value;
        return (
          <button
            key={d.value}
            onClick={() => onDayChange(d.value)}
            className={`
              flex-1 py-2 px-4 text-center font-[family-name:var(--font-display)] text-sm tracking-widest
              border-2 rounded-md transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? "border-neon-pink bg-neon-pink/15 text-neon-pink neon-border-pink"
                  : "border-border bg-card text-muted-foreground hover:border-neon-cyan/50 hover:text-neon-cyan"
              }
            `}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}
