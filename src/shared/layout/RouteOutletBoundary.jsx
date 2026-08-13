import { memo, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/shared/utils/utils";

const RouteLoading = memo(function RouteLoading({ compact = false }) {
  return (
    <div className={cn("flex w-full items-center justify-center", compact ? "min-h-40" : "min-h-[320px]")}> 
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#10B981]" />
        <span>Memuat halaman...</span>
      </div>
    </div>
  );
});

export const RouteOutletBoundary = memo(function RouteOutletBoundary({ className, compact = false }) {
  return (
    <div className={cn("min-w-0 max-w-full", className)}>
      <Suspense fallback={<RouteLoading compact={compact} />}>
        <Outlet />
      </Suspense>
    </div>
  );
});
