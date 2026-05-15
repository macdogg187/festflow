import * as cheerio from "cheerio";
import type { RawSetTime, ScrapeResult, FestivalScrapeConfig } from "./types";

export async function scrapeOfficialHtml(
  config: FestivalScrapeConfig
): Promise<ScrapeResult> {
  const errors: string[] = [];
  const sets: RawSetTime[] = [];

  try {
    const response = await fetch(config.official_url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FestFlowBot/1.0; +https://festflow.app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const selectors = config.selectors;

    if (selectors?.day_containers && selectors?.artist_elements) {
      const daySets = parseWithSelectors($, config);
      sets.push(...daySets);
    } else {
      const tableSets = parseTableFormat($, config);
      if (tableSets.length > 0) {
        sets.push(...tableSets);
      } else {
        const divSets = parseDivGridFormat($, config);
        sets.push(...divSets);
      }
    }
  } catch (err) {
    errors.push(
      `Failed to scrape ${config.official_url}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return {
    source_type: "official_html",
    sets,
    scraped_at: new Date().toISOString(),
    errors,
  };
}

function parseWithSelectors(
  $: cheerio.CheerioAPI,
  config: FestivalScrapeConfig
): RawSetTime[] {
  const selectors = config.selectors!;
  const results: RawSetTime[] = [];

  $(selectors.day_containers!).each((_dayIdx, dayEl) => {
    const $day = $(dayEl);
    let dayName = "";

    if (selectors.day_headers) {
      dayName = $day.find(selectors.day_headers).first().text().trim();
    }

    $day.find(selectors.artist_elements!).each((_artistIdx, artistEl) => {
      const $artist = $(artistEl);
      const artistName = $artist.text().trim();

      if (!artistName || artistName.length < 2) return;

      let timeStr = "";
      if (selectors.time_elements) {
        timeStr = $artist.find(selectors.time_elements).text().trim();
      }

      let stageName: string | undefined;
      if (selectors.stage_columns) {
        const $stage = $artist.closest(selectors.stage_columns);
        stageName = $stage.attr("data-stage") || $stage.find(".stage-name").text().trim() || undefined;
      }

      const { start_time, end_time } = parseTimeString(timeStr);

      results.push({
        artist_name: artistName,
        stage: stageName,
        day: dayName,
        start_time,
        end_time,
        source_type: "official_html",
        source_url: config.official_url,
        confidence: "high",
      });
    });
  });

  return results;
}

function parseTableFormat(
  $: cheerio.CheerioAPI,
  config: FestivalScrapeConfig
): RawSetTime[] {
  const results: RawSetTime[] = [];

  $("table").each((_tableIdx, tableEl) => {
    const $table = $(tableEl);
    const headers: string[] = [];

    $table.find("thead tr th, tr:first-child th").each((_thIdx, thEl) => {
      headers.push($(thEl).text().trim().toLowerCase());
    });

    const stageColumns = headers.reduce<Map<number, string>>((map, h, i) => {
      if (h.includes("stage") || h.includes("venue")) {
        map.set(i, h);
      }
      return map;
    }, new Map());

    $table.find("tbody tr, tr").each((_rowIdx, rowEl) => {
      if (_rowIdx === 0 && $(rowEl).find("th").length > 0) return;

      const $row = $(rowEl);
      const cells: string[] = [];
      $row.find("td").each((_cellIdx, cellEl) => {
        cells.push($(cellEl).text().trim());
      });

      if (cells.length === 0) return;

      let timeValue = "";
      let dayValue = "";
      const artistsWithStage: { artist: string; stage?: string }[] = [];

      for (let i = 0; i < cells.length; i++) {
        const cellText = cells[i];
        if (!cellText) continue;

        const header = headers[i]?.toLowerCase() || "";

        if (header.includes("time") || isTimeString(cellText)) {
          timeValue = cellText;
        } else if (header.includes("day") || header.includes("date")) {
          dayValue = cellText;
        } else if (header.includes("artist") || header.includes("name")) {
          artistsWithStage.push({ artist: cellText });
        } else if (stageColumns.has(i)) {
          artistsWithStage.push({
            artist: cellText,
            stage: stageColumns.get(i),
          });
        } else {
          artistsWithStage.push({ artist: cellText });
        }
      }

      const { start_time, end_time } = parseTimeString(timeValue);

      for (const { artist, stage } of artistsWithStage) {
        if (!artist || artist.length < 2) continue;
        results.push({
          artist_name: artist,
          stage,
          day: dayValue,
          start_time,
          end_time,
          source_type: "official_html",
          source_url: config.official_url,
          confidence: "high",
        });
      }
    });
  });

  return results;
}

function parseDivGridFormat(
  $: cheerio.CheerioAPI,
  config: FestivalScrapeConfig
): RawSetTime[] {
  const results: RawSetTime[] = [];

  const schedulePatterns = [
    "[class*='schedule']",
    "[class*='timetable']",
    "[class*='lineup']",
    "[class*='set-time']",
    "[class*='settime']",
  ];

  const scheduleSelector = schedulePatterns.join(", ");
  const $schedule = $(scheduleSelector).first();

  if ($schedule.length === 0) return results;

  const stageEls = $schedule.find(
    "[class*='stage'], [class*='venue'], [data-stage]"
  );

  if (stageEls.length > 0) {
    stageEls.each((_stageIdx, stageEl) => {
      const $stage = $(stageEl);
      const stageName =
        $stage.attr("data-stage") ||
        $stage.find("[class*='stage-name'], [class*='title']").first().text().trim() ||
        `Stage ${_stageIdx + 1}`;

      $stage.find("[class*='artist'], [class*='act'], [class*='event']").each(
        (_artistIdx, artistEl) => {
          const $artist = $(artistEl);
          const artistName = $artist
            .find("[class*='name'], [class*='title']")
            .first()
            .text()
            .trim() || $artist.text().trim();

          if (!artistName || artistName.length < 2) return;

          const timeText = $artist
            .find("[class*='time'], [class*='hour']")
            .text()
            .trim();
          const dayText = $artist
            .find("[class*='day'], [class*='date']")
            .text()
            .trim();

          const { start_time, end_time } = parseTimeString(timeText);

          results.push({
            artist_name: artistName,
            stage: stageName,
            day: dayText,
            start_time,
            end_time,
            source_type: "official_html",
            source_url: config.official_url,
            confidence: "high",
          });
        }
      );
    });
  } else {
    $schedule.find("[class*='artist'], [class*='act']").each((_idx, el) => {
      const $el = $(el);
      const artistName = $el.text().trim();
      if (!artistName || artistName.length < 2) return;

      results.push({
        artist_name: artistName,
        day: "",
        source_type: "official_html",
        source_url: config.official_url,
        confidence: "medium",
      });
    });
  }

  return results;
}

function isTimeString(s: string): boolean {
  return /^\d{1,2}:\d{2}\s*(am|pm|AM|PM)?/.test(s.trim());
}

function parseTimeString(timeStr: string): {
  start_time?: string;
  end_time?: string;
} {
  if (!timeStr) return {};

  const rangeMatch = timeStr.match(
    /(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?)\s*[-\u2013\u2014]\s*(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?)/
  );

  if (rangeMatch) {
    return {
      start_time: to24h(rangeMatch[1].trim()),
      end_time: to24h(rangeMatch[2].trim()),
    };
  }

  const singleMatch = timeStr.match(/(\d{1,2}:\d{2}\s*(?:am|pm|AM|PM)?)/);
  if (singleMatch) {
    return { start_time: to24h(singleMatch[1].trim()) };
  }

  return {};
}

function to24h(time12: string): string {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?/);
  if (!match) return time12;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3]?.toLowerCase();

  if (ampm === "pm" && hours !== 12) {
    hours += 12;
  } else if (ampm === "am" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}
