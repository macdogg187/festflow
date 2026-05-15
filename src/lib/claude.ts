import OpenAI from "openai";

const SYSTEM_PROMPT = `You are a music festival schedule OCR assistant. The user will provide a screenshot of a festival schedule where they have circled or highlighted specific artist names and times.

Your task:
1. Identify all circled or highlighted artist names in the image
2. For each artist, extract the time if visible
3. If you can determine the day, include it

Return a JSON object with this exact structure:
{
  "artists": [
    { "name": "Artist Name", "time": "7:30 PM", "day": "Friday" }
  ]
}

If you cannot determine the time or day for an artist, omit those fields. Only include artists that appear to be circled or highlighted — not all artists on the schedule.`;

export interface OcrArtist {
  name: string;
  time?: string;
  day?: string;
}

export async function extractArtistsFromImage(
  base64Image: string,
  mediaType: "image/png" | "image/jpeg" | "image/gif" | "image/webp"
): Promise<OcrArtist[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.compactif.ai/v1",
  });

  const response = await client.chat.completions.create({
    model: "glm-5-1",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
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
            text: "Please identify the circled or highlighted artists and their times from this festival schedule screenshot.",
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No text in model response");
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse OCR result");
  }

  const result = JSON.parse(jsonMatch[0]);
  return result.artists ?? [];
}
