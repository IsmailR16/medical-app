import { Skeleton } from "@/components/ui/skeleton";

/**
 * Segment-level loading state for the (dashboard) route group.
 *
 * IMPORTANT: this is rendered INSIDE the dashboard layout's `{children}`
 * slot — the layout itself (which provides the real AppSidebar + TopBar)
 * has already mounted at this point. Therefore this file must ONLY contain
 * page-body skeletons, NOT a duplicate sidebar.
 *
 * Page-specific loading.tsx files in subroutes (dashboard, cases, sessions,
 * etc.) override this with more tailored skeletons. This fallback only
 * appears in the brief window before route resolution settles on a child.
 */
export default function DashboardSegmentLoading() {
  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-5 space-y-3"
          >
            <Skeleton className="h-3.5 w-28 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-3">
        <Skeleton className="h-4 w-36 rounded-lg" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
