export interface Festival {
  id: string;
  name: string;
  slug: string;
  location: string;
  start_date: string;
  end_date: string;
  map_url: string | null;
}

export interface FestivalSet {
  id: string;
  festival_id: string;
  artist_name: string;
  stage: string;
  day: string;
  start_time: string;
  end_time: string;
  sources?: { source_type: string; source_url: string }[];
}

export interface SetTimeReview {
  id: string;
  festival_id: string;
  artist_name: string;
  stage: string | null;
  day: string;
  field: "start_time" | "end_time" | "stage";
  values: { source: string; value: string }[];
  status: "pending" | "resolved";
  resolved_value: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface ScrapeJob {
  id: string;
  festival_id: string;
  source_type: string;
  status: "running" | "completed" | "failed";
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  sets_found: number;
}

export interface UserSchedule {
  id: string;
  user_id: string;
  set_id: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
}

export interface OcrResult {
  artists: {
    name: string;
    time?: string;
    day?: string;
  }[];
}

export interface WeatherDay {
  date: string;
  high_f: number;
  low_f: number;
  condition: string;
  icon: string;
  hours: WeatherHour[];
}

export interface WeatherHour {
  time: string;
  temp_f: number;
  condition: string;
  icon: string;
  pop: number;
}

export type FestivalDay = "friday" | "saturday" | "sunday";

export interface ConflictPair {
  setA: FestivalSet;
  setB: FestivalSet;
}
