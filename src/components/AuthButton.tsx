"use client";

import { createClient } from "@/lib/supabase/client";
import { mergeLocalScheduleToCloud } from "@/lib/schedule-sync";
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        const success = await mergeLocalScheduleToCloud();
        if (success) {
          router.refresh();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  if (user) {
    return (
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.refresh();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neon-cyan/70 hover:text-neon-cyan border border-neon-cyan/20 hover:border-neon-cyan/50 rounded-md transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.3)] cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push("/auth/login")}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neon-cyan border border-neon-cyan/30 hover:border-neon-cyan rounded-md transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.3)] cursor-pointer"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">Sign In</span>
    </button>
  );
}
