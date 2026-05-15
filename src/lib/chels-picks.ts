export type ChelsTier = "really" | "wants";

const CHELS_PICKS: Record<string, ChelsTier> = {
  // Friday — Really Wants to See
  "Gelli Haha": "really",
  Drugdealer: "really",
  "Beach Bunny": "really",
  "Father John Misty": "really",
  "Japanese Breakfast": "really",
  Sports: "really",

  // Friday — Wants to See
  "Dad Bod": "wants",
  Wombo: "wants",
  Newdad: "wants",
  Turnstile: "wants",

  // Saturday — Really Wants to See
  Automatic: "really",
  "The Moss": "really",
  "The xx": "really",

  // Saturday — Wants to See
  "The Kilans": "wants",
  "Feeble Little Horse": "wants",
  Dehd: "wants",
  "The Last Dinner Party": "wants",
  "Alex G": "wants",

  // Sunday — Really Wants to See
  "Mustard Service": "really",
  "This Is Lorelei": "really",
  Tops: "really",
  "Freak Slug": "really",
  "Blood Orange": "really",

  // Sunday — Wants to See
  Flipturn: "wants",
  "Magdalena Bay": "wants",
  "Wild Nothing (Playing Gemini)": "wants",
};

export function getChelsTier(artistName: string): ChelsTier | null {
  return CHELS_PICKS[artistName] ?? null;
}

export function isChelsPick(artistName: string): boolean {
  return artistName in CHELS_PICKS;
}
