"use client";

import { useState } from "react";
import type { ScrapeJob } from "@/types";

export default function AdminScrapePage() {
  const [festivalSlug, setFestivalSlug] = useState("kilby-block-party-2026");
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<{
    sets_approved: number;
    discrepancies_flagged: number;
    scrape_results: { source_type: string; sets_found: number; errors: string[] }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);

  const handleScrape = async () => {
    setScraping(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ festival_slug: festivalSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scrape failed");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scrape failed");
    }

    setScraping(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Scrape Festival Set Times</h1>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={festivalSlug}
            onChange={(e) => setFestivalSlug(e.target.value)}
            placeholder="Festival slug"
            className="flex-1 px-3 py-2 rounded border border-border bg-background text-foreground"
          />
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="px-4 py-2 rounded bg-neon-pink text-white font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {scraping ? "Scraping..." : "Scrape Now"}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-400 mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded border border-neon-cyan/30 bg-neon-cyan/5">
                <p className="text-2xl font-bold text-neon-cyan">
                  {result.sets_approved}
                </p>
                <p className="text-sm text-muted-foreground">Sets Approved</p>
              </div>
              <div className="p-4 rounded border border-neon-yellow/30 bg-neon-yellow/5">
                <p className="text-2xl font-bold text-neon-yellow">
                  {result.discrepancies_flagged}
                </p>
                <p className="text-sm text-muted-foreground">Discrepancies</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Per-Source Results
              </h3>
              {result.scrape_results.map((sr, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded border border-border"
                >
                  <span className="font-mono text-sm">{sr.source_type}</span>
                  <span className="text-sm">
                    {sr.sets_found} sets found
                  </span>
                  {sr.errors.length > 0 && (
                    <span className="text-xs text-red-400">
                      {sr.errors.join("; ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold mb-3">Available Festivals</h2>
          <p className="text-sm text-muted-foreground">
            Configure festival scraping in{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              src/lib/scrapers/festival-configs.ts
            </code>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            To add a new festival, register a config with the festival&apos;s official URL,
            CSS selectors (for HTML scraping), and/or image URLs (for vision extraction).
          </p>
        </div>
      </div>
    </div>
  );
}
