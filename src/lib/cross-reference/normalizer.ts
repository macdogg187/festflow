import type { RawSetTime } from "../scrapers/types";

const FEAT_PATTERNS = [
  /\s+(?:feat\.?|ft\.?|featuring|with)\s+/gi,
  /\s*\(feat\.?\s+[^)]+\)/gi,
  /\s*\(ft\.?\s+[^)]+\)/gi,
  /\s*\(with\s+[^)]+\)/gi,
];

const STAGE_ALIASES: Record<string, string[]> = {
  "main stage": ["main", "mainstage", "principal", "headliner stage", "stage 1", "stage a"],
  "second stage": ["second", "2nd stage", "stage 2", "stage b", "side stage", "aux stage"],
  "outdoor stage": ["outdoor", "outside stage", "open air", "open-air stage"],
  "indoor stage": ["indoor", "inside stage", "club stage"],
  "park stage": ["park", "parkside", "forest stage", "woods stage"],
};

const DAY_NAME_MAP: Record<string, string> = {
  fri: "friday",
  sat: "saturday",
  sun: "sunday",
  mon: "monday",
  tue: "tuesday",
  wed: "wednesday",
  thu: "thursday",
};

export function normalizeArtistName(name: string): string {
  let normalized = name.trim();

  for (const pattern of FEAT_PATTERNS) {
    normalized = normalized.replace(pattern, "");
  }

  normalized = normalized
    .replace(/[^\w\s.'&/-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return normalized;
}

export function normalizeStageName(stage: string | undefined): string {
  if (!stage) return "";

  let normalized = stage.trim().toLowerCase();

  for (const [canonical, aliases] of Object.entries(STAGE_ALIASES)) {
    if (normalized === canonical || aliases.includes(normalized)) {
      return canonical;
    }
  }

  if (normalized.endsWith(" stage")) {
    return normalized;
  }

  return normalized;
}

export function normalizeTimeTo24h(time: string | undefined): string | undefined {
  if (!time) return undefined;

  const trimmed = time.trim();

  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = match24[2];
    if (h >= 0 && h <= 23) {
      return `${h.toString().padStart(2, "0")}:${m}`;
    }
  }

  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2];
    const ampm = match12[3].toLowerCase();

    if (ampm === "pm" && h !== 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:${m}`;
  }

  const match12NoColon = trimmed.match(/^(\d{1,2})\s*(am|pm)$/i);
  if (match12NoColon) {
    let h = parseInt(match12NoColon[1], 10);
    const ampm = match12NoColon[2].toLowerCase();

    if (ampm === "pm" && h !== 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;

    return `${h.toString().padStart(2, "0")}:00`;
  }

  return undefined;
}

export function normalizeDay(day: string | undefined, festivalStart?: string, festivalEnd?: string): string {
  if (!day) return "";

  const trimmed = day.trim().toLowerCase();

  const dayLookup = DAY_NAME_MAP[trimmed] || trimmed;
  if (["friday", "saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"].includes(dayLookup)) {
    if (festivalStart) {
      return dayNameToDate(dayLookup, festivalStart, festivalEnd);
    }
    return dayLookup;
  }

  const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    return trimmed;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch && festivalStart) {
    const year = slashMatch[3]
      ? slashMatch[3].length === 2
        ? `20${slashMatch[3]}`
        : slashMatch[3]
      : festivalStart.split("-")[0];
    const month = slashMatch[1].padStart(2, "0");
    const dayNum = slashMatch[2].padStart(2, "0");
    return `${year}-${month}-${dayNum}`;
  }

  return trimmed;
}

function dayNameToDate(
  dayName: string,
  startDate: string,
  endDate?: string
): string {
  const start = new Date(startDate + "T00:00:00");
  const end = endDate ? new Date(endDate + "T00:00:00") : new Date(start.getTime() + 7 * 86400000);

  const targetDay = [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  ].indexOf(dayName);

  if (targetDay === -1) return dayName;

  const current = new Date(start);
  while (current <= end) {
    if (current.getDay() === targetDay) {
      return current.toISOString().split("T")[0];
    }
    current.setDate(current.getDate() + 1);
  }

  return dayName;
}

export interface NormalizedSetTime {
  artist_name: string;
  artist_name_normalized: string;
  stage: string;
  stage_normalized: string;
  day: string;
  day_normalized: string;
  start_time: string | undefined;
  start_time_normalized: string | undefined;
  end_time: string | undefined;
  end_time_normalized: string | undefined;
  source_type: string;
  source_url: string;
  confidence: string;
}

export function normalizeRawSet(
  raw: RawSetTime,
  festivalStart?: string,
  festivalEnd?: string
): NormalizedSetTime {
  return {
    artist_name: raw.artist_name,
    artist_name_normalized: normalizeArtistName(raw.artist_name),
    stage: raw.stage ?? "",
    stage_normalized: normalizeStageName(raw.stage),
    day: raw.day,
    day_normalized: normalizeDay(raw.day, festivalStart, festivalEnd),
    start_time: raw.start_time,
    start_time_normalized: normalizeTimeTo24h(raw.start_time),
    end_time: raw.end_time,
    end_time_normalized: normalizeTimeTo24h(raw.end_time),
    source_type: raw.source_type,
    source_url: raw.source_url,
    confidence: raw.confidence,
  };
}
