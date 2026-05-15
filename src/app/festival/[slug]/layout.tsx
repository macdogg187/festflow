import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chels Block Party 2026",
  description:
    "Your personalized itinerary for Chels Block Party 2026, May 15-17 at Utah State Fairpark, Salt Lake City.",
  openGraph: {
    title: "Chels Block Party 2026 | FestFlow",
    description:
      "Upload your schedule screenshot and get a personalized festival itinerary for Chels Block Party 2026.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chels Block Party 2026 | FestFlow",
    description:
      "Upload your schedule screenshot and get a personalized festival itinerary for Chels Block Party 2026.",
  },
};

export default function FestivalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
