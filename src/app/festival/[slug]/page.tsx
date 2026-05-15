import { createClient } from "@/lib/supabase/server";
import { FestivalPageClient } from "./FestivalPageClient";
import type { Festival } from "@/types";

export default async function FestivalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: festival } = await supabase
    .from("festivals")
    .select("*")
    .eq("slug", slug)
    .single();

  const festivalMeta: Festival | null = festival as Festival | null;

  return <FestivalPageClient festival={festivalMeta} slug={slug} />;
}
