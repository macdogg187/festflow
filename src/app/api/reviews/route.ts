import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const festivalSlug = searchParams.get("festival_slug");
    const status = searchParams.get("status") || "pending";

    if (!festivalSlug) {
      return NextResponse.json(
        { error: "festival_slug is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: festival, error: festivalError } = await supabase
      .from("festivals")
      .select("id")
      .eq("slug", festivalSlug)
      .single();

    if (festivalError || !festival) {
      return NextResponse.json(
        { error: `Festival "${festivalSlug}" not found` },
        { status: 404 }
      );
    }

    const { data: reviews, error } = await supabase
      .from("set_time_reviews")
      .select("*")
      .eq("festival_id", festival.id)
      .eq("status", status)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { review_id, resolved_value } = body as {
      review_id: string;
      resolved_value: string;
    };

    if (!review_id || !resolved_value) {
      return NextResponse.json(
        { error: "review_id and resolved_value are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: review, error: fetchError } = await supabase
      .from("set_time_reviews")
      .select("*")
      .eq("id", review_id)
      .single();

    if (fetchError || !review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("set_time_reviews")
      .update({
        status: "resolved",
        resolved_value,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", review_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (review.field === "stage") {
      await supabase
        .from("sets")
        .update({ stage: resolved_value })
        .eq("festival_id", review.festival_id)
        .eq("artist_name", review.artist_name)
        .eq("day", review.day);
    } else {
      await supabase
        .from("sets")
        .update({ [review.field]: resolved_value })
        .eq("festival_id", review.festival_id)
        .eq("artist_name", review.artist_name)
        .eq("day", review.day);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
