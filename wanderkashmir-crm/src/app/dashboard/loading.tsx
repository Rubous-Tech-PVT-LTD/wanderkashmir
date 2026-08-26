import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading data...</p>
      </div>
    </div>
  );
}
