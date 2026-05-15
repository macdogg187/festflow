import { MapPin, ExternalLink } from "lucide-react";

interface FestivalMapLinkProps {
  mapUrl: string;
  festivalName: string;
}

export function FestivalMapLink({ mapUrl, festivalName }: FestivalMapLinkProps) {
  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors drop-shadow-[0_0_6px_rgba(0,240,255,0.3)]"
    >
      <MapPin className="h-4 w-4" />
      <span className="tracking-wide">{festivalName} Map</span>
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
