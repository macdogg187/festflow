import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeOfficialHtml } from "@/lib/scrapers/official-html";
import { scrapeOfficialImage } from "@/lib/scrapers/official-image";
import { scrapeBandsintown } from "@/lib/scrapers/bandsintown";
import { scrapeSongkick } from "@/lib/scrapers/songkick";
import { getFestivalConfig, getAllFestivalSlugs, getAvailableSources } from "@/lib/scrapers/festival-configs";
import { mergeScrapeResults } from "@/lib/cross-reference/merger";
import type { ScrapeResult, SourceType } from "@/lib/scrapers/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const results: { festival: string; sets_approved: number; discrepancies: number }[] = [];

  const { data: festivals } = await supabase
    .from("festivals")
    .select("*");

  if (!festivals || festivals.length === 0) {
    return NextResponse.json({ message: "No festivals found", results });
  }

  for (const festival of festivals) {
    const config = getFestivalConfig(festival.slug);
    if (!config) continue;

    const today = new Date();
    const endDate = new Date(festival.end_date + "T00:00:00");
    const weekBefore = new Date(endDate.getTime() - 7 * 86400000);

    if (today < weekBefore || today > new Date(endDate.getTime() + 2 * 86400000)) {
      continue;
    }

    const enabledSources = getAvailableSources();

    const scraperMap: Record<SourceType, () => Promise<ScrapeResult>> = {
      official_html: () => scrapeOfficialHtml(config),
      official_image: () => scrapeOfficialImage(config),
      bandsintown: () => scrapeBandsintown(config),
      songkick: () => scrapeSongkick(config),
    };

    const scrapePromises = enabledSources.map(
      async (sourceType) => {
        try {
          return await scraperMap[sourceType]();
        } catch {
          return null;
        }
      }
    );

    const scrapeResults = (await Promise.all(scrapePromises)).filter(
      (r): r is ScrapeResult => r !== null
    );

    for (const result of scrapeResults) {
      await supabase.from("scrape_jobs").insert({
        festival_id: festival.id,
        source_type: result.source_type,
        status: result.errors.length > 0 && result.sets.length === 0 ? "failed" : "completed",
        completed_at: new Date().toISOString(),
        sets_found: result.sets.length,
        error_message: result.errors.length > 0 ? result.errors.join("; ") : null,
      });

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
        .select("id, start_time, end_time, stage, sources")
        .eq("festival_id", festival.id)
        .eq("artist_name", merged.artist_name)
        .eq("day", merged.day)
        .maybeSingle();

      if (existing) {
        const hasChanges =
          existing.start_time !== merged.start_time ||
          existing.end_time !== merged.end_time ||
          existing.stage !== merged.stage;

        if (hasChanges) {
          const existingSources = Array.isArray(existing.sources) ? existing.sources : [];
          const newSources = merged.sources.filter(
            (ns) => !existingSources.some((es: { source_type: string }) => es.source_type === ns.source_type)
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
        }
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
      }
    }

    results.push({
      festival: festival.slug,
      sets_approved: mergerResult.approved.length,
      discrepancies: mergerResult.discrepancies.length,
    });
  }

  return NextResponse.json({ results });
}
