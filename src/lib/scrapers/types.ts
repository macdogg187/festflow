export type SourceType = "official_html" | "official_image" | "bandsintown" | "songkick";

export interface RawSetTime {
  artist_name: string;
  stage?: string;
  day: string;
  start_time?: string;
  end_time?: string;
  source_type: SourceType;
  source_url: string;
  confidence: "high" | "medium" | "low";
}

export interface FestivalScrapeConfig {
  festival_slug: string;
  official_url: string;
  selectors?: ScheduleSelectors;
  image_urls?: string[];
  bandsintown_query?: string;
  songkick_query?: string;
}

export interface ScheduleSelectors {
  day_containers?: string;
  stage_columns?: string;
  artist_elements?: string;
  time_elements?: string;
  day_headers?: string;
}

export interface ScrapeResult {
  source_type: SourceType;
  sets: RawSetTime[];
  scraped_at: string;
  errors: string[];
}

export interface DiscrepancyValue {
  source: string;
  value: string;
}

export interface Discrepancy {
  artist_name: string;
  stage?: string;
  day: string;
  field: "start_time" | "end_time" | "stage";
  values: DiscrepancyValue[];
}

export interface MergedSet {
  artist_name: string;
  stage: string;
  day: string;
  start_time: string;
  end_time: string;
  sources: { source_type: SourceType; source_url: string }[];
  confidence: "multi_source" | "single_source";
}

export interface MergerResult {
  approved: MergedSet[];
  discrepancies: Discrepancy[];
}
