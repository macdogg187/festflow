import type { ScrapeResult, MergedSet, Discrepancy, MergerResult, DiscrepancyValue } from "../scrapers/types";
import { normalizeRawSet, type NormalizedSetTime } from "./normalizer";

interface GroupKey {
  artist_normalized: string;
  day_normalized: string;
}

function groupKey(set: NormalizedSetTime): string {
  return `${set.artist_name_normalized}|||${set.day_normalized}`;
}

export function mergeScrapeResults(
  results: ScrapeResult[],
  festivalStart?: string,
  festivalEnd?: string
): MergerResult {
  const approved: MergedSet[] = [];
  const discrepancies: Discrepancy[] = [];

  const normalizedSets: NormalizedSetTime[] = [];

  for (const result of results) {
    for (const raw of result.sets) {
      normalizedSets.push(normalizeRawSet(raw, festivalStart, festivalEnd));
    }
  }

  const groups = new Map<string, NormalizedSetTime[]>();

  for (const set of normalizedSets) {
    const key = groupKey(set);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(set);
  }

  for (const [key, group] of groups) {
    const [artistNormalized, dayNormalized] = key.split("|||") as [string, string];
    const artistName = pickBestName(group);

    if (group.length === 1) {
      const s = group[0];
      approved.push({
        artist_name: artistName,
        stage: s.stage_normalized || s.stage,
        day: s.day_normalized || s.day,
        start_time: s.start_time_normalized || s.start_time || "",
        end_time: s.end_time_normalized || s.end_time || "",
        sources: [{ source_type: s.source_type as any, source_url: s.source_url }],
        confidence: "single_source",
      });
      continue;
    }

    const startTimes = collectUniqueValues(group, "start_time_normalized");
    const endTimes = collectUniqueValues(group, "end_time_normalized");
    const stages = collectUniqueValues(group, "stage_normalized");

    if (startTimes.length <= 1 && endTimes.length <= 1 && stages.length <= 1) {
      const representative = group.find((s) => s.start_time_normalized) || group[0];
      approved.push({
        artist_name: artistName,
        stage: representative.stage_normalized || representative.stage,
        day: dayNormalized,
        start_time: representative.start_time_normalized || representative.start_time || "",
        end_time: representative.end_time_normalized || representative.end_time || "",
        sources: group.map((s) => ({
          source_type: s.source_type as any,
          source_url: s.source_url,
        })),
        confidence: "multi_source",
      });
    } else {
      const representative = group.find((s) => s.start_time_normalized) || group[0];

      if (startTimes.length > 1) {
        discrepancies.push({
          artist_name: artistName,
          stage: representative.stage_normalized || representative.stage,
          day: dayNormalized,
          field: "start_time",
          values: group
            .filter((s) => s.start_time_normalized)
            .map((s) => ({
              source: s.source_type,
              value: s.start_time_normalized || s.start_time || "",
            })),
        });
      }

      if (endTimes.length > 1) {
        discrepancies.push({
          artist_name: artistName,
          stage: representative.stage_normalized || representative.stage,
          day: dayNormalized,
          field: "end_time",
          values: group
            .filter((s) => s.end_time_normalized)
            .map((s) => ({
              source: s.source_type,
              value: s.end_time_normalized || s.end_time || "",
            })),
        });
      }

      if (stages.length > 1) {
        discrepancies.push({
          artist_name: artistName,
          stage: representative.stage_normalized || representative.stage,
          day: dayNormalized,
          field: "stage",
          values: group
            .filter((s) => s.stage_normalized)
            .map((s) => ({
              source: s.source_type,
              value: s.stage_normalized || s.stage,
            })),
        });
      }

      const bestStart = pickConsensusValue(group, "start_time_normalized");
      const bestEnd = pickConsensusValue(group, "end_time_normalized");
      const bestStage = pickConsensusValue(group, "stage_normalized");

      approved.push({
        artist_name: artistName,
        stage: bestStage || representative.stage_normalized || representative.stage,
        day: dayNormalized,
        start_time: bestStart || representative.start_time_normalized || representative.start_time || "",
        end_time: bestEnd || representative.end_time_normalized || representative.end_time || "",
        sources: group.map((s) => ({
          source_type: s.source_type as any,
          source_url: s.source_url,
        })),
        confidence: "multi_source",
      });
    }
  }

  return { approved, discrepancies };
}

function collectUniqueValues(
  group: NormalizedSetTime[],
  field: keyof NormalizedSetTime
): string[] {
  const values = new Set<string>();
  for (const s of group) {
    const v = s[field];
    if (v && typeof v === "string" && v.trim()) {
      values.add(v.trim());
    }
  }
  return [...values];
}

function pickBestName(group: NormalizedSetTime[]): string {
  const official = group.find(
    (s) => s.source_type === "official_html" || s.source_type === "official_image"
  );
  return official?.artist_name || group[0].artist_name;
}

function pickConsensusValue(
  group: NormalizedSetTime[],
  field: "start_time_normalized" | "end_time_normalized" | "stage_normalized"
): string | undefined {
  const counts = new Map<string, number>();

  for (const s of group) {
    const v = s[field];
    if (v && typeof v === "string" && v.trim()) {
      counts.set(v.trim(), (counts.get(v.trim()) || 0) + 1);
    }
  }

  if (counts.size === 0) return undefined;

  let best = "";
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }

  return best;
}
