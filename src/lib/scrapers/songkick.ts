import type { RawSetTime, ScrapeResult, FestivalScrapeConfig } from "./types";

const SONGKICK_BASE = "https://api.songkick.com/api/3.0";

interface SongkickEvent {
  id: number;
  displayName: string;
  type: string;
  start: {
    date: string;
    time?: string;
  };
  venue?: {
    displayName: string;
  };
  performance?: {
    artist: {
      displayName: string;
    };
    displayName: string;
  }[];
}

interface SongkickResponse {
  resultsPage?: {
    results?: {
      event?: SongkickEvent[];
    };
    status: string;
  };
}

export async function scrapeSongkick(
  config: FestivalScrapeConfig
): Promise<ScrapeResult> {
  const errors: string[] = [];
  const sets: RawSetTime[] = [];

  const apiKey = process.env.SONGKICK_API_KEY;
  if (!apiKey) {
    errors.push("SONGKICK_API_KEY is not configured");
    return { source_type: "songkick", sets, scraped_at: new Date().toISOString(), errors };
  }

  const query = config.songkick_query || config.festival_slug;

  try {
    const searchUrl = `${SONGKICK_BASE}/search.json?query=${encodeURIComponent(query)}&apikey=${apiKey}`;
    const searchResponse = await fetch(searchUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!searchResponse.ok) {
      throw new Error(`Search HTTP ${searchResponse.status}`);
    }

    const searchData: SongkickResponse = await searchResponse.json();
    const events = searchData.resultsPage?.results?.event;

    if (!events || events.length === 0) {
      errors.push(`Festival "${query}" not found on Songkick`);
      return { source_type: "songkick", sets, scraped_at: new Date().toISOString(), errors };
    }

    const start = config.festival_start_date;
    const end = config.festival_end_date;
    const inWindow = (d?: string) => !start || !end || (!!d && d >= start && d <= end);
    const nameMatches = (e: SongkickEvent) =>
      e.displayName.toLowerCase().includes(query.toLowerCase().replace(/-/g, " "));

    // Prefer a Festival-typed event whose start.date falls within the festival
    // window so we don't grab the 2024 or 2025 Kilby Block Party Songkick page.
    const festivalEvent =
      events.find((e) => e.type === "Festival" && nameMatches(e) && inWindow(e.start?.date)) ||
      events.find((e) => nameMatches(e) && inWindow(e.start?.date)) ||
      events.find((e) => e.type === "Festival" && nameMatches(e)) ||
      events[0];

    const detailUrl = `${SONGKICK_BASE}/events/${festivalEvent.id}.json?apikey=${apiKey}`;
    const detailResponse = await fetch(detailUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!detailResponse.ok) {
      throw new Error(`Detail HTTP ${detailResponse.status}`);
    }

    const detailData: SongkickResponse = await detailResponse.json();
    const event = detailData.resultsPage?.results?.event?.[0];

    if (!event?.performance) {
      errors.push("No performance data in Songkick event");
      return { source_type: "songkick", sets, scraped_at: new Date().toISOString(), errors };
    }

    const day = event.start.date;
    const startTime = event.start.time || undefined;
    const stage = event.venue?.displayName;

    if (!inWindow(day)) {
      errors.push(
        `Songkick best-match event (${festivalEvent.displayName}, ${day}) is outside festival window ${start} … ${end}; discarding ${event.performance.length} performances`
      );
      return { source_type: "songkick", sets, scraped_at: new Date().toISOString(), errors };
    }

    for (const perf of event.performance) {
      sets.push({
        artist_name: perf.artist.displayName,
        stage,
        day,
        start_time: startTime,
        source_type: "songkick",
        source_url: `https://songkick.com/events/${festivalEvent.id}`,
        confidence: "medium",
      });
    }
  } catch (err) {
    errors.push(
      `Songkick scrape failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return {
    source_type: "songkick",
    sets,
    scraped_at: new Date().toISOString(),
    errors,
  };
}
