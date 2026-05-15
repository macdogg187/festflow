"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { DaySwitcher } from "@/components/DaySwitcher";
import { FestivalMapLink } from "@/components/FestivalMapLink";
import { AuthButton } from "@/components/AuthButton";
import { ScheduleTimeline } from "@/components/ScheduleTimeline";
import { WeatherCard } from "@/components/WeatherCard";
import { useSchedule } from "@/hooks/useSchedule";
import { Zap } from "lucide-react";
import type { FestivalDay, Festival } from "@/types";

interface FestivalPageClientProps {
  festival: Festival | null;
  slug: string;
}

export function FestivalPageClient({ festival, slug }: FestivalPageClientProps) {
  const [activeDay, setActiveDay] = useState<FestivalDay>("friday");
  const [festivalData, setFestivalData] = useState<Festival | null>(festival);

  useEffect(() => {
    if (!festivalData) {
      const supabase = createClient();
      supabase
        .from("festivals")
        .select("*")
        .eq("slug", slug)
        .single()
        .then(({ data }) => {
          if (data) setFestivalData(data as Festival);
        });
    }
  }, [festivalData, slug]);

  const festivalId = festivalData?.id;
  const { daySets, selectedSets, selectedIds, toggleSet, autoSelectByNames, conflicts, loading } = useSchedule(activeDay, festivalId);

  const location = festivalData?.location ?? "";
  const startDate = festivalData?.start_date ?? "";
  const endDate = festivalData?.end_date ?? "";
  const mapUrl = festivalData?.map_url ?? "#";

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
              CHELS BLOCK PARTY
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
          {location && (
            <p className="text-neon-cyan mt-2 text-sm sm:text-base tracking-wide">
              {location}
            </p>
          )}
          {startDate && endDate && (
            <p className="text-muted-foreground mt-1 text-sm tracking-wide">
              {formatDateRange(startDate, endDate)}
            </p>
          )}
          <div className="mt-4">
            <FestivalMapLink mapUrl={mapUrl} festivalName="Chels Block Party" />
          </div>
        </div>
      </section>

      {/* Weather Card */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <WeatherCard activeDay={activeDay} />
        </div>
      </section>

      {/* Day Switcher */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <DaySwitcher activeDay={activeDay} onDayChange={setActiveDay} />
        </div>
      </section>

      {/* Schedule Timeline */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading schedule...
            </div>
          ) : (
            <ScheduleTimeline
              day={activeDay}
              daySets={daySets}
              selectedIds={selectedIds}
              selectedSets={selectedSets}
              onToggleSet={toggleSet}
              conflicts={conflicts}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-yellow/20 py-4 text-center">
        <span className="neon-text-yellow text-xs font-[family-name:var(--font-display)] tracking-wider">
          CHELS BLOCK PARTY
        </span>
        {startDate && endDate && (
          <span className="text-muted-foreground text-xs ml-2">
            {formatDateShort(startDate, endDate)}
          </span>
        )}
      </footer>
    </div>
  );
}

function formatDateRange(start: string, end: string): string {
  const startMonth = new Date(start + "T00:00:00").toLocaleString("en-US", { month: "short" });
  const startDay = new Date(start + "T00:00:00").getDate();
  const endMonth = new Date(end + "T00:00:00").toLocaleString("en-US", { month: "short" });
  const endDay = new Date(end + "T00:00:00").getDate();
  const year = new Date(end + "T00:00:00").getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth.toUpperCase()} ${startDay} \u2013 ${endDay}, ${year}`;
  }
  return `${startMonth.toUpperCase()} ${startDay} \u2013 ${endMonth.toUpperCase()} ${endDay}, ${year}`;
}

function formatDateShort(start: string, end: string): string {
  const startMonth = new Date(start + "T00:00:00").toLocaleString("en-US", { month: "short" });
  const startDay = new Date(start + "T00:00:00").getDate();
  const endMonth = new Date(end + "T00:00:00").toLocaleString("en-US", { month: "short" });
  const endDay = new Date(end + "T00:00:00").getDate();
  const year = new Date(end + "T00:00:00").getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth.toUpperCase()} ${startDay}\u2013${endDay}, ${year}`;
  }
  return `${startMonth.toUpperCase()} ${startDay}\u2013${endMonth.toUpperCase()} ${endDay}, ${year}`;
}
