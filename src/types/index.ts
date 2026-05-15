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
