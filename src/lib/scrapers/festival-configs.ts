import type { FestivalScrapeConfig, SourceType } from "./types";

const FESTIVAL_CONFIGS: Record<string, FestivalScrapeConfig> = {
  "kilby-block-party-2026": {
    festival_slug: "kilby-block-party-2026",
    official_url: "https://kilbyblockparty.com",
    selectors: {
      day_containers: "[class*='schedule-day'], [class*='day-schedule']",
      stage_columns: "[class*='stage-col'], [data-stage]",
      artist_elements: "[class*='artist'], [class*='act']",
      time_elements: "[class*='time'], [class*='hour']",
      day_headers: "[class*='day-header'], [class*='day-title']",
    },
    image_urls: [],
    bandsintown_query: "Kilby Block Party",
    songkick_query: "Kilby Block Party",
  },
};

export function getFestivalConfig(slug: string): FestivalScrapeConfig | null {
  return FESTIVAL_CONFIGS[slug] ?? null;
}

export function registerFestivalConfig(
  slug: string,
  config: FestivalScrapeConfig
): void {
  FESTIVAL_CONFIGS[slug] = config;
}

export function getAllFestivalSlugs(): string[] {
  return Object.keys(FESTIVAL_CONFIGS);
}

export function getAvailableSources(
  requested?: SourceType[]
): SourceType[] {
  const all: SourceType[] = requested || ["official_html", "official_image", "bandsintown", "songkick"];

  return all.filter((source) => {
    switch (source) {
      case "official_html":
      case "official_image":
        return true;
      case "bandsintown":
        return !!process.env.BANDSINTOWN_APP_ID;
      case "songkick":
        return !!process.env.SONGKICK_API_KEY;
      default:
        return false;
    }
  });
}
