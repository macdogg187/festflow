"use client";

import { useState } from "react";
import { DaySwitcher } from "@/components/DaySwitcher";
import { FestivalMapLink } from "@/components/FestivalMapLink";
import { AuthButton } from "@/components/AuthButton";
import { UploadZone } from "@/components/UploadZone";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import { WeatherCard } from "@/components/WeatherCard";
import { useSchedule } from "@/hooks/useSchedule";
import { Zap } from "lucide-react";
import type { FestivalDay } from "@/types";

interface FestivalMeta {
  name: string;
  slug: string;
  location: string;
  startDate: string;
  endDate: string;
  mapUrl: string;
}

export function FestivalPageClient({ festival }: { festival: FestivalMeta }) {
  const [activeDay, setActiveDay] = useState<FestivalDay>("friday");
  const { daySets, selectedSets, selectedIds, toggleSet, autoSelectByNames, conflicts } = useSchedule(activeDay);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neon-pink/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-neon-pink neon-flicker" />
            <span
              className="font-[family-name:var(--font-display)] text-lg tracking-wider neon-text-pink"
            >
              FESTFLOW
            </span>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Festival Hero */}
      <section className="border-b border-neon-pink/20 bg-gradient-to-b from-neon-pink/10 via-purple-950/30 to-transparent">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1
            className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl neon-text-pink tracking-wider"
          >
            CHELS BLOCK PARTY
          </h1>
          <p className="text-neon-cyan mt-2 text-sm sm:text-base tracking-wide">
            {festival.location}
          </p>
          <p className="text-muted-foreground mt-1 text-sm tracking-wide">
            MAY 15 &ndash; 17, 2026
          </p>
          <div className="mt-4">
            <FestivalMapLink mapUrl={festival.mapUrl} festivalName={festival.name} />
          </div>
        </div>
      </section>

      {/* Weather Card */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <WeatherCard activeDay={activeDay} />
        </div>
      </section>

      {/* Day Switcher + Upload */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-3 space-y-3">
          <DaySwitcher activeDay={activeDay} onDayChange={setActiveDay} />
          <UploadZone onArtistsDetected={autoSelectByNames} />
        </div>
      </section>

      {/* Schedule Timeline */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4">
          <ScheduleTimeline
            day={activeDay}
            daySets={daySets}
            selectedIds={selectedIds}
            selectedSets={selectedSets}
            onToggleSet={toggleSet}
            conflicts={conflicts}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-yellow/20 py-4 text-center">
        <span className="neon-text-yellow text-xs font-[family-name:var(--font-display)] tracking-wider">
          CHELS BLOCK PARTY
        </span>
        <span className="text-muted-foreground text-xs ml-2">
          MAY 15&ndash;17, 2026
        </span>
      </footer>
    </div>
  );
}
