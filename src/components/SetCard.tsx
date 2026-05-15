"use client";

import { Plus, Minus, AlertTriangle, MapPin } from "lucide-react";
import type { FestivalSet } from "@/types";

interface SetCardProps {
  set: FestivalSet;
  isSelected: boolean;
  hasConflict: boolean;
  onToggle: () => void;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

export function SetCard({ set, isSelected, hasConflict, onToggle }: SetCardProps) {
  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200
        bg-card
        ${isSelected
          ? "border-l-4 border-l-neon-pink border-neon-pink/30 neon-border-pink bg-neon-pink/5"
          : "border-border hover:border-neon-cyan/40 hover:bg-muted/50"
        }
      `}
    >
      <button
        onClick={onToggle}
        className={`
          h-7 w-7 shrink-0 flex items-center justify-center rounded-md border-2 transition-all duration-200 cursor-pointer
          ${isSelected
            ? "border-neon-pink bg-neon-pink/20 text-neon-pink"
            : "border-border text-muted-foreground hover:border-neon-cyan hover:text-neon-cyan"
          }
        `}
      >
        {isSelected ? (
          <Minus className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-sm truncate ${isSelected ? "text-neon-pink" : "text-foreground"}`}>
            {set.artist_name}
          </span>
          {hasConflict && (
            <AlertTriangle className="h-3.5 w-3.5 text-neon-red shrink-0 drop-shadow-[0_0_6px_rgba(255,51,51,0.6)]" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="text-neon-cyan/80">
            {formatTime(set.start_time)} &ndash; {formatTime(set.end_time)}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3 text-neon-yellow/60" />
            <span className="text-neon-yellow/60">{set.stage}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
