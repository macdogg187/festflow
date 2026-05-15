import { Card } from "@/components/ui/card";

export function ScheduleSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="h-7 w-7 rounded-md bg-muted animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-28 rounded bg-muted animate-pulse" />
            <div className="h-3 w-40 rounded bg-muted animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}
