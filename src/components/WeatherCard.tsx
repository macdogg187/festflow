"use client";

import { useEffect, useState } from "react";
import { CloudSun, Thermometer, CloudRain } from "lucide-react";
import type { WeatherDay, WeatherHour, FestivalDay } from "@/types";

const DAY_MAP: Record<FestivalDay, string> = {
  friday: "2026-05-15",
  saturday: "2026-05-16",
  sunday: "2026-05-17",
};

interface WeatherCardProps {
  activeDay: FestivalDay;
}

export function WeatherCard({ activeDay }: WeatherCardProps) {
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        const data = await res.json();
        if (data.forecast) {
          setForecast(data.forecast);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neon-cyan/60">
        <CloudSun className="h-4 w-4 animate-pulse" />
        <span>Loading forecast...</span>
      </div>
    );
  }

  if (forecast.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudSun className="h-4 w-4" />
        <span>Weather unavailable</span>
      </div>
    );
  }

  const activeDate = DAY_MAP[activeDay];
  const todayForecast = forecast.find((d) => d.date === activeDate);

  if (!todayForecast) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudSun className="h-4 w-4" />
        <span>Weather unavailable for this day</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Day summary */}
      <div className="flex items-center gap-3 text-sm">
        <CloudSun className="h-4 w-4 text-neon-cyan shrink-0" />
        <span className="font-bold text-neon-cyan tracking-wider">
          {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}
        </span>
        <span className="text-muted-foreground">{todayForecast.condition}</span>
        <Thermometer className="h-3.5 w-3.5 text-neon-yellow" />
        <span className="text-neon-yellow">
          {todayForecast.high_f}°/<span className="text-muted-foreground">{todayForecast.low_f}°</span>
        </span>
      </div>

      {/* Hourly scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {todayForecast.hours.map((hour, i) => (
          <HourCard key={i} hour={hour} />
        ))}
      </div>
    </div>
  );
}

function HourCard({ hour }: { hour: WeatherHour }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 text-xs shrink-0 min-w-[56px] rounded-md border border-border bg-card">
      <span className="text-neon-cyan/60">{hour.time}</span>
      <span className="font-bold text-neon-yellow">{hour.temp_f}°</span>
      {hour.pop > 20 ? (
        <div className="flex items-center gap-0.5 text-blue-400">
          <CloudRain className="h-2.5 w-2.5" />
          <span>{hour.pop}%</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-[10px]">{hour.condition.split(" ").pop()}</span>
      )}
    </div>
  );
}
