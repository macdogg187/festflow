import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeOfficialHtml } from "@/lib/scrapers/official-html";
import { scrapeOfficialImage } from "@/lib/scrapers/official-image";
import { scrapeBandsintown } from "@/lib/scrapers/bandsintown";
import { scrapeSongkick } from "@/lib/scrapers/songkick";
import { getFestivalConfig, getAvailableSources } from "@/lib/scrapers/festival-configs";
import { mergeScrapeResults } from "@/lib/cross-reference/merger";
import type { ScrapeResult, SourceType } from "@/lib/scrapers/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { festival_slug, sources } = body as {
      festival_slug: string;
      sources?: SourceType[];
    };

    if (!festival_slug) {
      return NextResponse.json(
        { error: "festival_slug is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: festival, error: festivalError } = await supabase
      .from("festivals")
      .select("*")
      .eq("slug", festival_slug)
      .single();

    if (festivalError || !festival) {
      return NextResponse.json(
        { error: `Festival "${festival_slug}" not found` },
        { status: 404 }
      );
    }

    const baseConfig = getFestivalConfig(festival_slug);
    if (!baseConfig) {
      return NextResponse.json(
        { error: `No scrape config for "${festival_slug}"` },
        { status: 404 }
      );
    }

    // Inject festival date window so scrapers can cross-reference event year
    // and reject prior-year results (see merger.ts safety net for backstop).
    const config = {
      ...baseConfig,
      festival_start_date: festival.start_date,
      festival_end_date: festival.end_date,
    };

    const enabledSources = getAvailableSources(sources);

    const scraperMap: Record<SourceType, () => Promise<ScrapeResult>> = {
      official_html: () => scrapeOfficialHtml(config),
      official_image: () => scrapeOfficialImage(config),
      bandsintown: () => scrapeBandsintown(config),
      songkick: () => scrapeSongkick(config),
    };

    const jobIds: { source_type: SourceType; job_id: string }[] = [];

    for (const sourceType of enabledSources) {
      const scraper = scraperMap[sourceType];
      if (!scraper) continue;

      const { data: job, error: jobError } = await supabase
        .from("scrape_jobs")
        .insert({
          festival_id: festival.id,
          source_type: sourceType,
          status: "running",
        })
        .select("id")
        .single();

      if (jobError || !job) continue;

      jobIds.push({ source_type: sourceType, job_id: job.id });
    }

    const scrapePromises = enabledSources.map(async (sourceType) => {
      const scraper = scraperMap[sourceType];
      if (!scraper) return null;

      try {
        const result = await scraper();
        return result;
      } catch (err) {
        return {
          source_type: sourceType,
          sets: [],
          scraped_at: new Date().toISOString(),
          errors: [err instanceof Error ? err.message : String(err)],
        } as ScrapeResult;
      }
    });

    const scrapeResults = (await Promise.all(scrapePromises)).filter(
      (r): r is ScrapeResult => r !== null
    );

    for (const result of scrapeResults) {
      const jobId = jobIds.find((j) => j.source_type === result.source_type);

      if (jobId) {
        await supabase
          .from("scrape_jobs")
          .update({
            status: result.errors.length > 0 && result.sets.length === 0 ? "failed" : "completed",
            completed_at: new Date().toISOString(),
            sets_found: result.sets.length,
            error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
          })
          .eq("id", jobId.job_id);
      }

      if (result.sets.length > 0) {
        await supabase.from("set_time_sources").insert({
          festival_id: festival.id,
          source_type: result.source_type,
          source_url: config.official_url,
          raw_data: result.sets,
          scraped_at: result.scraped_at,
        });
      }
    }

    const mergerResult = mergeScrapeResults(
      scrapeResults,
      festival.start_date,
      festival.end_date
    );

    for (const merged of mergerResult.approved) {
      if (!merged.start_time || !merged.end_time) continue;

      const { data: existing } = await supabase
        .from("sets")
        .select("id, sources")
        .eq("festival_id", festival.id)
        .eq("artist_name", merged.artist_name)
        .eq("day", merged.day)
        .maybeSingle();

      if (existing) {
        const existingSources = Array.isArray(existing.sources) ? existing.sources : [];
        const newSources = merged.sources.filter(
          (ns) => !existingSources.some((es: { source_type: string; source_url: string }) => es.source_type === ns.source_type)
        );

        await supabase
          .from("sets")
          .update({
            start_time: merged.start_time,
            end_time: merged.end_time,
            stage: merged.stage,
            sources: [...existingSources, ...newSources],
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("sets").insert({
          festival_id: festival.id,
          artist_name: merged.artist_name,
          stage: merged.stage,
          day: merged.day,
          start_time: merged.start_time,
          end_time: merged.end_time,
          sources: merged.sources,
        });
      }
    }

    for (const disc of mergerResult.discrepancies) {
      const { data: existingReview } = await supabase
        .from("set_time_reviews")
        .select("id")
        .eq("festival_id", festival.id)
        .eq("artist_name", disc.artist_name)
        .eq("day", disc.day)
        .eq("field", disc.field)
        .eq("status", "pending")
        .maybeSingle();

      if (!existingReview) {
        await supabase.from("set_time_reviews").insert({
          festival_id: festival.id,
          artist_name: disc.artist_name,
          stage: disc.stage,
          day: disc.day,
          field: disc.field,
          values: disc.values,
          status: "pending",
        });
      } else {
        await supabase
          .from("set_time_reviews")
          .update({ values: disc.values })
          .eq("id", existingReview.id);
      }
    }

    return NextResponse.json({
      festival_slug,
      sets_approved: mergerResult.approved.length,
      discrepancies_flagged: mergerResult.discrepancies.length,
      scrape_results: scrapeResults.map((r) => ({
        source_type: r.source_type,
        sets_found: r.sets.length,
        errors: r.errors,
      })),
      jobs: jobIds,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
