import { NextResponse } from "next/server";
import type { WeatherDay, WeatherHour } from "@/types";

// SLC coordinates for Kilby Block Party
const LAT = 40.75;
const LON = -111.95;

// Festival hours: noon to 11 PM
const FESTIVAL_START_HOUR = 12;
const FESTIVAL_END_HOUR = 23;

const FESTIVAL_DATES = ["2026-05-15", "2026-05-16", "2026-05-17"];

export async function GET() {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ forecast: getMockForecast() });
  }

  try {
    // Fetch 5-day/3-hour forecast from OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=imperial&appid=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`Weather API returned ${res.status}`);
    }

    const data = await res.json();
    const forecast = extractFestivalDays(data);
    return NextResponse.json({ forecast });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json({ forecast: getMockForecast() });
  }
}

interface OwmForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: { description: string; icon: string }[];
  pop: number;
}

function extractFestivalDays(data: { list: OwmForecastItem[] }): WeatherDay[] {
  const dayMap = new Map<
    string,
    { high: number; low: number; condition: string; icon: string; hours: WeatherHour[] }
  >();

  for (const item of data.list) {
    const dateObj = new Date(item.dt * 1000);
    const date = dateObj.toISOString().split("T")[0];
    if (!FESTIVAL_DATES.includes(date)) continue;

    const hour = dateObj.getUTCHours();
    // Filter to festival hours only
    if (hour < FESTIVAL_START_HOUR || hour > FESTIVAL_END_HOUR) continue;

    const temp = Math.round(item.main.temp);
    const condition = capitalize(item.weather[0]?.description ?? "");
    const icon = item.weather[0]?.icon ?? "02d";
    const pop = Math.round((item.pop ?? 0) * 100);

    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: "America/Denver",
    });

    const existing = dayMap.get(date);
    const hourData: WeatherHour = {
      time: timeStr,
      temp_f: temp,
      condition,
      icon,
      pop,
    };

    if (!existing) {
      dayMap.set(date, {
        high: temp,
        low: temp,
        condition,
        icon,
        hours: [hourData],
      });
    } else {
      existing.high = Math.max(existing.high, temp);
      existing.low = Math.min(existing.low, temp);
      existing.hours.push(hourData);
    }
  }

  return FESTIVAL_DATES
    .filter((d) => dayMap.has(d))
    .map((date) => {
      const d = dayMap.get(date)!;
      return {
        date,
        high_f: d.high,
        low_f: d.low,
        condition: d.condition,
        icon: d.icon,
        hours: d.hours.sort((a, b) => a.time.localeCompare(b.time)),
      };
    });
}

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getMockForecast(): WeatherDay[] {
  return [
    {
      date: "2026-05-15",
      high_f: 73,
      low_f: 52,
      condition: "Partly Cloudy",
      icon: "02d",
      hours: [
        { time: "12 PM", temp_f: 62, condition: "Sunny", icon: "01d", pop: 0 },
        { time: "1 PM", temp_f: 64, condition: "Sunny", icon: "01d", pop: 0 },
        { time: "2 PM", temp_f: 67, condition: "Partly Cloudy", icon: "02d", pop: 5 },
        { time: "3 PM", temp_f: 70, condition: "Partly Cloudy", icon: "02d", pop: 5 },
        { time: "4 PM", temp_f: 72, condition: "Partly Cloudy", icon: "02d", pop: 10 },
        { time: "5 PM", temp_f: 73, condition: "Partly Cloudy", icon: "02d", pop: 10 },
        { time: "6 PM", temp_f: 71, condition: "Mostly Cloudy", icon: "03d", pop: 15 },
        { time: "7 PM", temp_f: 68, condition: "Mostly Cloudy", icon: "03d", pop: 15 },
        { time: "8 PM", temp_f: 65, condition: "Partly Cloudy", icon: "02d", pop: 10 },
        { time: "9 PM", temp_f: 62, condition: "Clear", icon: "01n", pop: 5 },
        { time: "10 PM", temp_f: 58, condition: "Clear", icon: "01n", pop: 0 },
        { time: "11 PM", temp_f: 55, condition: "Clear", icon: "01n", pop: 0 },
      ],
    },
    {
      date: "2026-05-16",
      high_f: 68,
      low_f: 49,
      condition: "Mostly Sunny",
      icon: "01d",
      hours: [
        { time: "12 PM", temp_f: 58, condition: "Sunny", icon: "01d", pop: 0 },
        { time: "1 PM", temp_f: 61, condition: "Sunny", icon: "01d", pop: 0 },
        { time: "2 PM", temp_f: 64, condition: "Sunny", icon: "01d", pop: 0 },
        { time: "3 PM", temp_f: 66, condition: "Mostly Sunny", icon: "01d", pop: 0 },
        { time: "4 PM", temp_f: 68, condition: "Mostly Sunny", icon: "01d", pop: 0 },
        { time: "5 PM", temp_f: 67, condition: "Mostly Sunny", icon: "01d", pop: 5 },
        { time: "6 PM", temp_f: 64, condition: "Partly Cloudy", icon: "02d", pop: 10 },
        { time: "7 PM", temp_f: 61, condition: "Partly Cloudy", icon: "02d", pop: 10 },
        { time: "8 PM", temp_f: 58, condition: "Clear", icon: "01n", pop: 5 },
        { time: "9 PM", temp_f: 55, condition: "Clear", icon: "01n", pop: 0 },
        { time: "10 PM", temp_f: 52, condition: "Clear", icon: "01n", pop: 0 },
        { time: "11 PM", temp_f: 50, condition: "Clear", icon: "01n", pop: 0 },
      ],
    },
    {
      date: "2026-05-17",
      high_f: 65,
      low_f: 47,
      condition: "Light Rain",
      icon: "10d",
      hours: [
        { time: "12 PM", temp_f: 56, condition: "Cloudy", icon: "04d", pop: 20 },
        { time: "1 PM", temp_f: 58, condition: "Cloudy", icon: "04d", pop: 30 },
        { time: "2 PM", temp_f: 60, condition: "Light Rain", icon: "10d", pop: 55 },
        { time: "3 PM", temp_f: 62, condition: "Light Rain", icon: "10d", pop: 60 },
        { time: "4 PM", temp_f: 63, condition: "Light Rain", icon: "10d", pop: 50 },
        { time: "5 PM", temp_f: 65, condition: "Drizzle", icon: "09d", pop: 40 },
        { time: "6 PM", temp_f: 62, condition: "Cloudy", icon: "04d", pop: 25 },
        { time: "7 PM", temp_f: 59, condition: "Cloudy", icon: "04d", pop: 20 },
        { time: "8 PM", temp_f: 56, condition: "Mostly Cloudy", icon: "03d", pop: 15 },
        { time: "9 PM", temp_f: 53, condition: "Partly Cloudy", icon: "02n", pop: 10 },
        { time: "10 PM", temp_f: 50, condition: "Clear", icon: "01n", pop: 5 },
        { time: "11 PM", temp_f: 48, condition: "Clear", icon: "01n", pop: 0 },
      ],
    },
  ];
}
