import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "LLM API key not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = imageFile.type || "image/png";

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
                url: `data:${mediaType};base64,${base64}`,
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
      return NextResponse.json(
        { error: "No text in model response" },
        { status: 500 }
      );
    }

    // Extract JSON from the response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse OCR result" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("OCR API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
