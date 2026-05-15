import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "festflow_selected_sets";

export async function mergeLocalScheduleToCloud(): Promise<boolean> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  let localIds: string[] = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      localIds = JSON.parse(stored);
    }
  } catch {
    return false;
  }

  if (localIds.length === 0) return true;

  // Fetch existing cloud schedule to avoid duplicates
  const { data: existing } = await supabase
    .from("user_schedules")
    .select("set_id")
    .eq("user_id", user.id);

  const existingSetIds = new Set((existing ?? []).map((r: { set_id: string }) => r.set_id));

  const newEntries = localIds
    .filter((id) => !existingSetIds.has(id))
    .map((setId) => ({
      user_id: user.id,
      set_id: setId,
    }));

  if (newEntries.length > 0) {
    const { error } = await supabase.from("user_schedules").insert(newEntries);
    if (error) {
      console.error("Failed to merge schedule:", error);
      return false;
    }
  }

  // Clear localStorage after successful merge
  localStorage.removeItem(STORAGE_KEY);
  return true;
}
