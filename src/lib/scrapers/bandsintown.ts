import type { RawSetTime, ScrapeResult, FestivalScrapeConfig } from "./types";

const BANDSINTOWN_BASE = "https://rest.bandsintown.com";

interface BandsintownEvent {
  id: string;
  title: string;
  datetime: string;
  venue?: {
    name: string;
  };
  lineup?: string[];
}

interface BandsintownArtistEvents {
  id: string;
  name: string;
  events?: BandsintownEvent[];
}

export async function scrapeBandsintown(
  config: FestivalScrapeConfig
): Promise<ScrapeResult> {
  const errors: string[] = [];
  const sets: RawSetTime[] = [];

  const appId = process.env.BANDSINTOWN_APP_ID;
  if (!appId) {
    errors.push("BANDSINTOWN_APP_ID is not configured");
    return { source_type: "bandsintown", sets, scraped_at: new Date().toISOString(), errors };
  }

  const query = config.bandsintown_query || config.festival_slug;

  try {
    const searchUrl = `${BANDSINTOWN_BASE}/artists/${encodeURIComponent(query)}?app_id=${appId}&date=upcoming`;
    const response = await fetch(searchUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        errors.push(`Festival "${query}" not found on Bandsintown`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      return { source_type: "bandsintown", sets, scraped_at: new Date().toISOString(), errors };
    }

    const artistData: BandsintownArtistEvents = await response.json();

    if (!artistData.events || artistData.events.length === 0) {
      errors.push(`No upcoming events found for "${query}" on Bandsintown`);
      return { source_type: "bandsintown", sets, scraped_at: new Date().toISOString(), errors };
    }

    for (const event of artistData.events) {
      const eventDate = new Date(event.datetime);
      const day = eventDate.toISOString().split("T")[0];
      const start_time = eventDate.toTimeString().slice(0, 5);

      sets.push({
        artist_name: event.title || artistData.name,
        stage: event.venue?.name,
        day,
        start_time,
        source_type: "bandsintown",
        source_url: `https://bandsintown.com/${query}`,
        confidence: "medium",
      });
    }
  } catch (err) {
    errors.push(
      `Bandsintown scrape failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return {
    source_type: "bandsintown",
    sets,
    scraped_at: new Date().toISOString(),
    errors,
  };
}

export async function searchBandsintownFestival(
  festivalName: string,
  appId: string
): Promise<string | null> {
  try {
    const url = `${BANDSINTOWN_BASE}/artists/${encodeURIComponent(festivalName)}?app_id=${appId}`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      return data.name || null;
    }
  } catch {}

  return null;
}
