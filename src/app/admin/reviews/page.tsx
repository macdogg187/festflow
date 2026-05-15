"use client";

import { useState, useEffect, useCallback } from "react";
import type { SetTimeReview } from "@/types";

export default function AdminReviewsPage() {
  const [festivalSlug, setFestivalSlug] = useState("kilby-block-party-2026");
  const [reviews, setReviews] = useState<SetTimeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?festival_slug=${encodeURIComponent(festivalSlug)}&status=pending`
      );
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch {}
    setLoading(false);
  }, [festivalSlug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleResolve = async (reviewId: string, resolvedValue: string) => {
    setResolving(reviewId);
    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, resolved_value: resolvedValue }),
      });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {}
    setResolving(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Set Time Reviews</h1>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={festivalSlug}
            onChange={(e) => setFestivalSlug(e.target.value)}
            placeholder="Festival slug"
            className="flex-1 px-3 py-2 rounded border border-border bg-background text-foreground"
          />
          <button
            onClick={fetchReviews}
            className="px-4 py-2 rounded bg-neon-pink text-white font-semibold hover:opacity-90"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">No pending discrepancies found.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onResolve={handleResolve}
                resolving={resolving === review.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  onResolve,
  resolving,
}: {
  review: SetTimeReview;
  onResolve: (id: string, value: string) => void;
  resolving: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const values = review.values as { source: string; value: string }[];

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-lg">{review.artist_name}</h3>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {review.field}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        {review.day} &middot; {review.stage || "Unknown stage"}
      </p>

      <div className="space-y-2">
        {values.map((v, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
              selected === v.value
                ? "bg-neon-pink/20 border border-neon-pink/50"
                : "bg-muted/50 border border-transparent hover:bg-muted"
            }`}
          >
            <input
              type="radio"
              name={`review-${review.id}`}
              value={v.value}
              checked={selected === v.value}
              onChange={() => setSelected(v.value)}
              className="accent-neon-pink"
            />
            <span className="font-mono">{v.value}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {v.source}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={() => selected && onResolve(review.id, selected)}
        disabled={!selected || resolving}
        className="px-4 py-2 rounded bg-neon-cyan text-background font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resolving ? "Resolving..." : "Resolve"}
      </button>
    </div>
  );
}
