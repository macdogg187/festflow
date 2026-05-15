"use client";

import { useState, useEffect, useCallback } from "react";
import type { FestivalSet, FestivalDay, ConflictPair } from "@/types";

const STORAGE_KEY = "festflow_selected_sets";

const KILBY_SETS: FestivalSet[] = [
  // Friday - May 15
  { id: "1", festival_id: "kbp", artist_name: "Lorde", stage: "Main Stage", day: "2026-05-15", start_time: "20:30", end_time: "22:00" },
  { id: "2", festival_id: "kbp", artist_name: "Alvvays", stage: "Main Stage", day: "2026-05-15", start_time: "18:30", end_time: "19:30" },
  { id: "3", festival_id: "kbp", artist_name: "Japanese Breakfast", stage: "Second Stage", day: "2026-05-15", start_time: "17:00", end_time: "18:00" },
  { id: "4", festival_id: "kbp", artist_name: "Snail Mail", stage: "Second Stage", day: "2026-05-15", start_time: "15:30", end_time: "16:30" },
  { id: "5", festival_id: "kbp", artist_name: "Makthaverskan", stage: "Main Stage", day: "2026-05-15", start_time: "14:00", end_time: "14:45" },
  { id: "6", festival_id: "kbp", artist_name: "Drinks", stage: "Second Stage", day: "2026-05-15", start_time: "19:45", end_time: "20:45" },

  // Saturday - May 16
  { id: "7", festival_id: "kbp", artist_name: "The xx", stage: "Main Stage", day: "2026-05-16", start_time: "20:30", end_time: "22:00" },
  { id: "8", festival_id: "kbp", artist_name: "Beach House", stage: "Main Stage", day: "2026-05-16", start_time: "18:30", end_time: "19:30" },
  { id: "9", festival_id: "kbp", artist_name: "Mitski", stage: "Second Stage", day: "2026-05-16", start_time: "17:00", end_time: "18:00" },
  { id: "10", festival_id: "kbp", artist_name: "Slowdive", stage: "Second Stage", day: "2026-05-16", start_time: "15:30", end_time: "16:30" },
  { id: "11", festival_id: "kbp", artist_name: "Turnover", stage: "Main Stage", day: "2026-05-16", start_time: "14:00", end_time: "14:45" },
  { id: "12", festival_id: "kbp", artist_name: "Hatchie", stage: "Second Stage", day: "2026-05-16", start_time: "19:45", end_time: "20:45" },

  // Sunday - May 17
  { id: "13", festival_id: "kbp", artist_name: "Hayley Williams", stage: "Main Stage", day: "2026-05-17", start_time: "20:30", end_time: "22:00" },
  { id: "14", festival_id: "kbp", artist_name: "Paramore", stage: "Main Stage", day: "2026-05-17", start_time: "18:30", end_time: "19:30" },
  { id: "15", festival_id: "kbp", artist_name: "Phoebe Bridgers", stage: "Second Stage", day: "2026-05-17", start_time: "17:00", end_time: "18:00" },
  { id: "16", festival_id: "kbp", artist_name: "Julien Baker", stage: "Second Stage", day: "2026-05-17", start_time: "15:30", end_time: "16:30" },
  { id: "17", festival_id: "kbp", artist_name: "Lucy Dacus", stage: "Main Stage", day: "2026-05-17", start_time: "14:00", end_time: "14:45" },
  { id: "18", festival_id: "kbp", artist_name: "Boygenius", stage: "Second Stage", day: "2026-05-17", start_time: "19:45", end_time: "20:45" },
];

const DAY_MAP: Record<FestivalDay, string> = {
  friday: "2026-05-15",
  saturday: "2026-05-16",
  sunday: "2026-05-17",
};

function findConflicts(sets: FestivalSet[]): ConflictPair[] {
  const conflicts: ConflictPair[] = [];
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const a = sets[i];
      const b = sets[j];
      if (a.day === b.day && a.start_time < b.end_time && a.end_time > b.start_time) {
        conflicts.push({ setA: a, setB: b });
      }
    }
  }
  return conflicts;
}

export function useSchedule(activeDay: FestivalDay) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedIds(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
    } catch {}
  }, [selectedIds]);

  const toggleSet = useCallback((setId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) {
        next.delete(setId);
      } else {
        next.add(setId);
      }
      return next;
    });
  }, []);

  const autoSelectByNames = useCallback((artistNames: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const name of artistNames) {
        const normalized = name.toLowerCase().trim();
        const match = KILBY_SETS.find(
          (s) => s.artist_name.toLowerCase() === normalized
        );
        if (match) {
          next.add(match.id);
        }
      }
      return next;
    });
  }, []);

  const dayStr = DAY_MAP[activeDay];
  const daySets = KILBY_SETS.filter((s) => s.day === dayStr).sort(
    (a, b) => a.start_time.localeCompare(b.start_time)
  );
  const selectedSets = daySets.filter((s) => selectedIds.has(s.id));
  const allSelectedSets = KILBY_SETS.filter((s) => selectedIds.has(s.id));
  const conflicts = findConflicts(allSelectedSets);

  return { daySets, selectedSets, selectedIds, toggleSet, autoSelectByNames, conflicts };
}
