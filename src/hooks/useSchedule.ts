"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FestivalSet, FestivalDay, ConflictPair } from "@/types";

const STORAGE_KEY = "festflow_selected_sets";

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

export function useSchedule(activeDay: FestivalDay, festivalId?: string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [allSets, setAllSets] = useState<FestivalSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedIds(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    async function fetchSets() {
      if (!festivalId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("sets")
          .select("*")
          .eq("festival_id", festivalId)
          .order("start_time", { ascending: true });

        if (!error && data) {
          setAllSets(data as FestivalSet[]);
        }
      } catch {}
      setLoading(false);
    }

    fetchSets();
  }, [festivalId]);

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

  const autoSelectByNames = useCallback(
    (artistNames: string[]) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const name of artistNames) {
          const normalized = name.toLowerCase().trim();
          const match = allSets.find(
            (s) => s.artist_name.toLowerCase() === normalized
          );
          if (match) {
            next.add(match.id);
          }
        }
        return next;
      });
    },
    [allSets]
  );

  const dayDateMap = buildDayDateMap(allSets);
  const dayStr = dayDateMap[activeDay];
  const daySets = allSets
    .filter((s) => s.day === dayStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  const selectedSets = daySets.filter((s) => selectedIds.has(s.id));
  const allSelectedSets = allSets.filter((s) => selectedIds.has(s.id));
  const conflicts = findConflicts(allSelectedSets);

  return {
    daySets,
    selectedSets,
    selectedIds,
    toggleSet,
    autoSelectByNames,
    conflicts,
    loading,
    allSets,
  };
}

function buildDayDateMap(sets: FestivalSet[]): Record<FestivalDay, string> {
  const uniqueDates = [...new Set(sets.map((s) => s.day))].sort();

  const dayNames: FestivalDay[] = ["friday", "saturday", "sunday"];

  const map: Record<string, string> = {};
  for (let i = 0; i < Math.min(uniqueDates.length, dayNames.length); i++) {
    map[dayNames[i]] = uniqueDates[i];
  }

  return map as Record<FestivalDay, string>;
}
