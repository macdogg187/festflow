"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Music, Mail, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (!error) {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border-2 border-neon-pink/30 p-6 bg-card neon-border-pink">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="rounded-full bg-neon-pink/10 p-3 border border-neon-pink/30">
            <Zap className="h-6 w-6 text-neon-pink neon-flicker" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-xl tracking-wider neon-text-pink">
            SIGN IN
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Save your festival itinerary and access it from any device.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-2">
            <Mail className="h-8 w-8 text-neon-cyan mx-auto drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <p className="text-sm font-bold text-neon-cyan">Check your email</p>
            <p className="text-xs text-muted-foreground">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-bold text-neon-cyan/70 tracking-wider block mb-1.5"
              >
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex h-9 w-full rounded-md border-2 border-border bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-neon-cyan focus-visible:outline-none focus-visible:drop-shadow-[0_0_8px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-md border-2 border-neon-pink bg-neon-pink/15 text-neon-pink font-bold text-sm tracking-wider hover:bg-neon-pink/25 transition-all cursor-pointer disabled:opacity-50 neon-border-pink"
            >
              {loading ? "Sending..." : "SEND MAGIC LINK"}
            </button>
          </form>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          You can use Chels Block Party without signing in &mdash; your selections are
          saved locally.
        </p>
      </div>
    </div>
  );
}
