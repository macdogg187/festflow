import { FestivalPageClient } from "./FestivalPageClient";

const FESTIVAL_META = {
  name: "Chels Block Party",
  slug: "kilby-block-party-2026",
  location: "Utah State Fairpark, Salt Lake City",
  startDate: "2026-05-15",
  endDate: "2026-05-17",
  mapUrl: "https://kilbyblockparty.com/map",
};

export default function FestivalPage() {
  return <FestivalPageClient festival={FESTIVAL_META} />;
}
