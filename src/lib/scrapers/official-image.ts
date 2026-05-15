import OpenAI from "openai";
import type { RawSetTime, ScrapeResult, FestivalScrapeConfig } from "./types";

const COMPLETE_SCHEDULE_PROMPT = `You are a music festival schedule extraction assistant. The user will provide an image of a complete festival schedule, timetable, or set times poster.

Your task is to extract EVERY SINGLE artist performing at the festival along with their set time and stage. This is NOT about highlighted or circled artists — you must extract the COMPLETE schedule.

For each artist, extract:
1. Artist name (exact spelling)
2. Stage name (if visible)
3. Day of performance (if visible — e.g., "Friday", "Saturday", "Sunday", or a date)
4. Start time (if visible)
5. End time (if visible)

Return a JSON object with this exact structure:
{
  "sets": [
    {
      "artist_name": "Artist Name",
      "stage": "Stage Name",
      "day": "Friday",
      "start_time": "2:00 PM",
      "end_time": "2:45 PM"
    }
  ]
}

Rules:
- Include EVERY artist on the schedule, not just headliners
- Use exact spelling from the image
- If start/end time is not visible for an artist, omit that field
- If the stage is not visible, omit the stage field
- Normalize day names to: "Friday", "Saturday", "Sunday", etc.
- Keep times in the format shown in the image (12h or 24h)
- If the schedule spans multiple days, group sets by day
- Do NOT invent or hallucinate data that is not in the image`;

interface LlmSetEntry {
  artist_name: string;
  stage?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
}

export async function scrapeOfficialImage(
  config: FestivalScrapeConfig
): Promise<ScrapeResult> {
  const errors: string[] = [];
  const sets: RawSetTime[] = [];

  const imageUrls = config.image_urls ?? [];

  if (imageUrls.length === 0) {
    try {
      const htmlSets = await extractImageUrlsFromPage(config.official_url);
      if (htmlSets.length > 0) {
        imageUrls.push(...htmlSets);
      }
    } catch (err) {
      errors.push(
        `Could not find schedule images on ${config.official_url}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (imageUrls.length === 0) {
    errors.push("No schedule image URLs found for vision extraction");
    return { source_type: "official_image", sets, scraped_at: new Date().toISOString(), errors };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    errors.push("OPENAI_API_KEY is not configured");
    return { source_type: "official_image", sets, scraped_at: new Date().toISOString(), errors };
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.compactif.ai/v1",
  });

  for (const imageUrl of imageUrls) {
    try {
      const response = await client.chat.completions.create({
        model: "glm-5-1",
        max_tokens: 4096,
        messages: [
          { role: "system", content: COMPLETE_SCHEDULE_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
              {
                type: "text",
                text: "Extract the complete festival schedule from this image. Include every artist, their stage, day, and set times.",
              },
            ],
          },
        ],
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        errors.push(`No response from vision model for ${imageUrl}`);
        continue;
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        errors.push(`Could not parse vision model response for ${imageUrl}`);
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const llmSets: LlmSetEntry[] = parsed.sets ?? parsed.artists ?? [];

      for (const entry of llmSets) {
        sets.push({
          artist_name: entry.artist_name,
          stage: entry.stage,
          day: entry.day ?? "",
          start_time: entry.start_time,
          end_time: entry.end_time,
          source_type: "official_image",
          source_url: imageUrl,
          confidence: "medium",
        });
      }
    } catch (err) {
      errors.push(
        `Vision extraction failed for ${imageUrl}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return {
    source_type: "official_image",
    sets,
    scraped_at: new Date().toISOString(),
    errors,
  };
}

export async function extractFromUploadedImage(
  base64Image: string,
  mediaType: "image/png" | "image/jpeg" | "image/gif" | "image/webp"
): Promise<ScrapeResult> {
  const errors: string[] = [];
  const sets: RawSetTime[] = [];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    errors.push("OPENAI_API_KEY is not configured");
    return { source_type: "official_image", sets, scraped_at: new Date().toISOString(), errors };
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.compactif.ai/v1",
  });

  try {
    const response = await client.chat.completions.create({
      model: "glm-5-1",
      max_tokens: 4096,
      messages: [
        { role: "system", content: COMPLETE_SCHEDULE_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mediaType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: "Extract the complete festival schedule from this image. Include every artist, their stage, day, and set times.",
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No response from vision model");
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse vision model response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const llmSets: LlmSetEntry[] = parsed.sets ?? parsed.artists ?? [];

    for (const entry of llmSets) {
      sets.push({
        artist_name: entry.artist_name,
        stage: entry.stage,
        day: entry.day ?? "",
        start_time: entry.start_time,
        end_time: entry.end_time,
        source_type: "official_image",
        source_url: "upload",
        confidence: "medium",
      });
    }
  } catch (err) {
    errors.push(
      `Vision extraction failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return {
    source_type: "official_image",
    sets,
    scraped_at: new Date().toISOString(),
    errors,
  };
}

async function extractImageUrlsFromPage(
  pageUrl: string
): Promise<string[]> {
  const response = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FestFlowBot/1.0; +https://festflow.app)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) return [];

  const html = await response.text();
  const urls: string[] = [];

  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (
      src &&
      !src.includes("logo") &&
      !src.includes("icon") &&
      !src.includes("avatar") &&
      (src.includes("schedule") ||
        src.includes("timetable") ||
        src.includes("lineup") ||
        src.includes("set-time"))
    ) {
      const absolute = new URL(src, pageUrl).href;
      urls.push(absolute);
    }
  }

  return urls;
}
