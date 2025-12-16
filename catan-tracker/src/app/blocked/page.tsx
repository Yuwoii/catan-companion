import { Hexagon, ShieldAlert } from "lucide-react";

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
      <div className="relative mb-6">
        <Hexagon className="w-24 h-24 text-muted/20" strokeWidth={1} />
        <ShieldAlert className="w-10 h-10 text-destructive absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
      <p className="text-muted-foreground max-w-md">
        Sorry, Catan Companion is currently only available in Switzerland.
      </p>
      
      <div className="mt-8 text-xs text-muted-foreground">
        Error: 403_GEO_RESTRICTION
      </div>
    </div>
  );
}