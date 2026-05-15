/**
 * Debug-only script — runs each scraper independently against the
 * kilby-block-party-2026 config and writes NDJSON evidence to the
 * Cursor debug session log file so we can prove/reject hypotheses.
 *
 * Usage: npx tsx scripts/debug-scrape.ts
 */
import * as path from "node:path";
import * as fs from "node:fs";

// Lightweight .env.local loader so we don't need an extra dependency
function loadEnvLocal() {
  const p = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf-8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnvLocal();

import { scrapeOfficialHtml } from "../src/lib/scrapers/official-html";
import { scrapeOfficialImage } from "../src/lib/scrapers/official-image";
import { scrapeBandsintown } from "../src/lib/scrapers/bandsintown";
import { scrapeSongkick } from "../src/lib/scrapers/songkick";
import { getFestivalConfig } from "../src/lib/scrapers/festival-configs";
import { mergeScrapeResults } from "../src/lib/cross-reference/merger";
import type { ScrapeResult, RawSetTime } from "../src/lib/scrapers/types";

const LOG_PATH = "/Users/mac/festflow/.cursor/debug-06b9a4.log";
const SESSION_ID = "06b9a4";
const RUN_ID = `debug-scrape-${Date.now()}`;

// #region agent log
function log(hypothesisId: string, location: string, message: string, data: unknown) {
  const entry = {
    sessionId: SESSION_ID,
    runId: RUN_ID,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + "\n");
}
// #endregion

function yearStats(sets: RawSetTime[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of sets) {
    const m = (s.day || "").match(/(\d{4})/);
    const year = m ? m[1] : "no-year";
    counts[year] = (counts[year] || 0) + 1;
  }
  return counts;
}

function summarize(result: ScrapeResult) {
  return {
    source_type: result.source_type,
    sets_found: result.sets.length,
    errors: result.errors,
    year_breakdown: yearStats(result.sets),
    first_5_artists: result.sets.slice(0, 5).map((s) => ({
      artist: s.artist_name,
      day: s.day,
      stage: s.stage,
      start: s.start_time,
      end: s.end_time,
    })),
    all_artists: result.sets.map((s) => s.artist_name),
  };
}

async function main() {
  log("INIT", "scripts/debug-scrape.ts:run", "starting debug scrape run", {
    BANDSINTOWN_APP_ID_set: !!process.env.BANDSINTOWN_APP_ID,
    SONGKICK_API_KEY_set: !!process.env.SONGKICK_API_KEY,
    OPENAI_API_KEY_set: !!process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  const config = getFestivalConfig("kilby-block-party-2026");
  if (!config) {
    log("INIT", "scripts/debug-scrape.ts:run", "NO CONFIG FOUND for slug", {
      slug: "kilby-block-party-2026",
    });
    return;
  }
  log("INIT", "scripts/debug-scrape.ts:run", "config loaded", {
    official_url: config.official_url,
    image_urls: config.image_urls,
    bandsintown_query: config.bandsintown_query,
    songkick_query: config.songkick_query,
    selectors: config.selectors,
  });

  // H4 — official_html
  try {
    const r = await scrapeOfficialHtml(config);
    log("H4", "official-html.ts", "scrapeOfficialHtml result", summarize(r));
  } catch (e) {
    log("H4", "official-html.ts", "scrapeOfficialHtml threw", {
      err: e instanceof Error ? e.message : String(e),
    });
  }

  // H5 — official_image
  try {
    const r = await scrapeOfficialImage(config);
    log("H5", "official-image.ts", "scrapeOfficialImage result", summarize(r));
  } catch (e) {
    log("H5", "official-image.ts", "scrapeOfficialImage threw", {
      err: e instanceof Error ? e.message : String(e),
    });
  }

  // H2 — bandsintown
  try {
    const r = await scrapeBandsintown(config);
    log("H2", "bandsintown.ts", "scrapeBandsintown result", summarize(r));
  } catch (e) {
    log("H2", "bandsintown.ts", "scrapeBandsintown threw", {
      err: e instanceof Error ? e.message : String(e),
    });
  }

  // H3 — songkick
  try {
    const r = await scrapeSongkick(config);
    log("H3", "songkick.ts", "scrapeSongkick result", summarize(r));
  } catch (e) {
    log("H3", "songkick.ts", "scrapeSongkick threw", {
      err: e instanceof Error ? e.message : String(e),
    });
  }

  // H1 — verify seed.sql contents (filesystem check)
  try {
    const seed = fs.readFileSync(
      path.resolve(process.cwd(), "supabase/seed.sql"),
      "utf-8"
    );
    const matches = seed.match(/'[A-Za-z][A-Za-z0-9 .'&-]*'/g) || [];
    const artistGuess = matches.filter(
      (m) =>
        ![
          "'a1b2c3d4-0001-4000-8000-000000000001'",
          "'Main Stage'",
          "'Second Stage'",
          "'Kilby Block Party'",
          "'kilby-block-party-2026'",
          "'Utah State Fairpark, Salt Lake City'",
          "'https://kilbyblockparty.com/map'",
        ].includes(m) && !/\d{4}-\d{2}-\d{2}/.test(m) && !/^\d{2}:\d{2}$/.test(m.replace(/'/g, ""))
    );
    log("H1", "supabase/seed.sql", "seed file artist mentions", {
      total_quoted_strings: matches.length,
      artist_like_strings: artistGuess.slice(0, 40),
    });
  } catch (e) {
    log("H1", "supabase/seed.sql", "could not read seed", {
      err: e instanceof Error ? e.message : String(e),
    });
  }

  // H6 — what would merger produce given all (empty?) scrape results, and
  // verify date filtering behavior with synthetic mixed-year data
  const synthetic: ScrapeResult[] = [
    {
      source_type: "bandsintown" as const,
      scraped_at: new Date().toISOString(),
      errors: [],
      sets: [
        {
          artist_name: "Test 2024 Artist",
          day: "2024-05-18",
          start_time: "20:00",
          end_time: "21:00",
          source_type: "bandsintown",
          source_url: "https://example.com",
          confidence: "medium",
        },
        {
          artist_name: "Test 2026 Artist",
          day: "2026-05-15",
          start_time: "20:00",
          end_time: "21:00",
          source_type: "bandsintown",
          source_url: "https://example.com",
          confidence: "medium",
        },
      ],
    },
  ];
  const merger = mergeScrapeResults(synthetic, "2026-05-15", "2026-05-17");
  log("H6", "merger.ts", "merger with synthetic mixed-year input", {
    approved: merger.approved.map((m) => ({
      artist: m.artist_name,
      day: m.day,
      start: m.start_time,
      end: m.end_time,
    })),
    discrepancies: merger.discrepancies.length,
    note:
      "If 2024-05-18 set is in approved[], merger does NOT enforce festival year range",
  });

  // Post-fix probe: verify the seed file now contains the actual 2026 lineup
  try {
    const seed = fs.readFileSync(
      path.resolve(process.cwd(), "supabase/seed.sql"),
      "utf-8"
    );
    const expected = [
      "Turnstile",
      "Japanese Breakfast",
      "Modest Mouse",
      "Father John Misty",
      "The xx",
      "Lucy Dacus",
      "Hayley Williams",
      "Lorde",
      "Alex G",
      "Blood Orange",
    ];
    const missingFromExpected = expected.filter((a) => !seed.includes(`'${a}'`));
    const wrongPlaceholders = [
      "Makthaverskan",
      "Alvvays",
      "Drinks",
      "Mitski",
      "Slowdive",
      "Beach House",
      "Turnover",
      "Hatchie",
      "Paramore",
      "Phoebe Bridgers",
      "Julien Baker",
      "Boygenius",
    ];
    const stillPresentPlaceholders = wrongPlaceholders.filter((a) =>
      seed.includes(`'${a}'`)
    );
    log("H1-FIX", "supabase/seed.sql", "post-fix seed verification", {
      expected_artists_missing_from_seed: missingFromExpected,
      placeholder_artists_still_present: stillPresentPlaceholders,
      verdict:
        missingFromExpected.length === 0 && stillPresentPlaceholders.length === 0
          ? "PASS"
          : "FAIL",
    });
  } catch (e) {
    log("H1-FIX", "supabase/seed.sql", "could not read seed", {
      err: e instanceof Error ? e.message : String(e),
    });
  }

  log("DONE", "scripts/debug-scrape.ts:run", "debug scrape complete", {
    log_path: LOG_PATH,
  });
}

main().catch((e) => {
  log("FATAL", "scripts/debug-scrape.ts:main", "uncaught", {
    err: e instanceof Error ? e.message : String(e),
    stack: e instanceof Error ? e.stack : undefined,
  });
  process.exit(1);
});
