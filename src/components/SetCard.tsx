"use client";

import { useState } from "react";
import { Heart, AlertTriangle, MapPin } from "lucide-react";
import type { FestivalSet } from "@/types";
import type { ChelsTier } from "@/lib/chels-picks";

interface SetCardProps {
  set: FestivalSet;
  isSelected: boolean;
  hasConflict: boolean;
  onToggle: () => void;
  chelsTier: ChelsTier | null;
  variant?: "list" | "grid";
  maxDurationMinutes?: number;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
}

function formatTimeShort(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m}`;
}

type StageTheme = "desert" | "lake" | "mountain" | "kilby";

function getStageTheme(stage: string): StageTheme {
  const lower = stage.toLowerCase();
  if (lower.includes("desert")) return "desert";
  if (lower.includes("lake")) return "lake";
  if (lower.includes("mountain")) return "mountain";
  return "kilby";
}

const STAGE_BORDER_CLASSES: Record<StageTheme, string> = {
  desert: "border-l-stage-desert neon-border-desert",
  lake: "border-l-stage-lake neon-border-lake",
  mountain: "border-l-stage-mountain neon-border-mountain",
  kilby: "border-l-neon-pink neon-border-pink",
};

const STAGE_BG_WASH: Record<StageTheme, string> = {
  desert: "bg-[rgba(245,166,35,0.04)]",
  lake: "bg-[rgba(0,180,216,0.04)]",
  mountain: "bg-[rgba(46,204,113,0.04)]",
  kilby: "bg-[rgba(255,45,149,0.04)]",
};

const STAGE_TEXT_CLASSES: Record<StageTheme, string> = {
  desert: "text-stage-desert",
  lake: "text-stage-lake",
  mountain: "text-stage-mountain",
  kilby: "text-neon-pink",
};

const STAGE_BORDER_TOP: Record<StageTheme, string> = {
  desert: "border-t-stage-desert/40",
  lake: "border-t-stage-lake/40",
  mountain: "border-t-stage-mountain/40",
  kilby: "border-t-neon-pink/40",
};

const DURATION_BAR_COLOR: Record<StageTheme, string> = {
  desert: "bg-stage-desert/60",
  lake: "bg-stage-lake/60",
  mountain: "bg-stage-mountain/60",
  kilby: "bg-neon-pink/60",
};

function getDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function SetCard({ set, isSelected, hasConflict, onToggle, chelsTier, variant = "list", maxDurationMinutes }: SetCardProps) {
  const [animating, setAnimating] = useState(false);
  const stageTheme = getStageTheme(set.stage);

  const handleToggle = () => {
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 300);
  };

  const heartColor = chelsTier === "really"
    ? "text-chels-purple fill-chels-purple"
    : chelsTier === "wants"
      ? "text-chels-green fill-chels-green"
      : isSelected
        ? "text-neon-pink fill-neon-pink"
        : "text-muted-foreground";

  const heartGlow = chelsTier === "really" ? "heart-glow" : "";

  if (variant === "grid") {
    const durationMinutes = getDurationMinutes(set.start_time, set.end_time);
    const durationPct = maxDurationMinutes
      ? Math.min((durationMinutes / maxDurationMinutes) * 100, 100)
      : 50;

    return (
      <div
        className={`
          flex flex-col gap-1 px-2 py-1.5 rounded border transition-all duration-200 cursor-pointer
          border-t-2 ${STAGE_BORDER_TOP[stageTheme]}
          ${STAGE_BG_WASH[stageTheme]}
          ${isSelected ? "ring-1 ring-neon-cyan/40" : ""}
          hover:border-border
        `}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggle(); }}
            className={`
              h-5 w-5 shrink-0 flex items-center justify-center rounded border transition-all duration-200 cursor-pointer
              ${chelsTier === "really"
                ? "border-chels-purple/40 bg-chels-purple/10"
                : chelsTier === "wants"
                  ? "border-chels-green/40 bg-chels-green/10"
                  : isSelected
                    ? "border-neon-pink bg-neon-pink/20"
                    : "border-border hover:border-neon-cyan"
              }
              ${animating ? "heart-pop" : ""}
            `}
          >
            <Heart
              className={`
                h-2.5 w-2.5 transition-all duration-200
                ${heartColor}
                ${chelsTier ? "fill-current" : ""}
                ${heartGlow}
                ${!chelsTier && !isSelected ? "fill-none" : ""}
              `}
            />
          </button>
          <span
            className={`font-bold text-xs truncate leading-tight ${
              chelsTier === "really"
                ? "text-chels-purple"
                : chelsTier === "wants"
                  ? "text-chels-green"
                  : isSelected
                    ? "text-neon-pink"
                    : "text-foreground"
            }`}
          >
            {set.artist_name}
          </span>
          {hasConflict && (
            <AlertTriangle className="h-3 w-3 text-neon-red shrink-0 drop-shadow-[0_0_6px_rgba(255,51,51,0.6)]" />
          )}
        </div>
        <div className="text-[0.6rem] text-muted-foreground leading-tight">
          {formatTimeShort(set.start_time)} &ndash; {formatTimeShort(set.end_time)}
        </div>
        <div className="duration-bar-track">
          <div
            className={`duration-bar-fill ${DURATION_BAR_COLOR[stageTheme]}`}
            style={{ width: `${durationPct}%` }}
          />
        </div>
      </div>
    );
  }

  // List variant (original layout)
  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200
        border-l-4 ${STAGE_BORDER_CLASSES[stageTheme]}
        ${STAGE_BG_WASH[stageTheme]}
        ${isSelected && !chelsTier ? "border-neon-pink/30" : ""}
      `}
    >
      <button
        onClick={handleToggle}
        className={`
          h-7 w-7 shrink-0 flex items-center justify-center rounded-md border-2 transition-all duration-200 cursor-pointer
          ${chelsTier === "really"
            ? "border-chels-purple/40 bg-chels-purple/10"
            : chelsTier === "wants"
              ? "border-chels-green/40 bg-chels-green/10"
              : isSelected
                ? "border-neon-pink bg-neon-pink/20"
                : "border-border hover:border-neon-cyan hover:bg-neon-cyan/10"
          }
          ${animating ? "heart-pop" : ""}
        `}
      >
        <Heart
          className={`
            h-3.5 w-3.5 transition-all duration-200
            ${heartColor}
            ${chelsTier ? "fill-current" : ""}
            ${heartGlow}
            ${!chelsTier && !isSelected ? "fill-none" : ""}
          `}
        />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold text-sm truncate ${
              chelsTier === "really"
                ? "text-chels-purple"
                : chelsTier === "wants"
                  ? "text-chels-green"
                  : isSelected
                    ? "text-neon-pink"
                    : "text-foreground"
            }`}
          >
            {set.artist_name}
          </span>
          {chelsTier && (
            <Heart
              className={`h-3 w-3 shrink-0 ${
                chelsTier === "really"
                  ? "text-chels-purple fill-chels-purple heart-glow"
                  : "text-chels-green fill-chels-green"
              }`}
            />
          )}
          {hasConflict && (
            <AlertTriangle className="h-3.5 w-3.5 text-neon-red shrink-0 drop-shadow-[0_0_6px_rgba(255,51,51,0.6)]" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="text-neon-cyan/80">
            {formatTime(set.start_time)} &ndash; {formatTime(set.end_time)}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className={`h-3 w-3 ${STAGE_TEXT_CLASSES[stageTheme]} opacity-70`} />
            <span className={`${STAGE_TEXT_CLASSES[stageTheme]} opacity-70`}>{set.stage}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
