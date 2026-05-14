import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout-level loading state for the (dashboard) segment.
 *
 * Shown while the dashboard layout's `getOrCreateUser()` call is running
 * (e.g. when a user signs in for the first time or when Vercel function
 * cold-starts). Without this, users would see a white page during the
 * 300-1500ms server work before any child segment's loading.tsx kicks in.
 *
 * Renders just the sidebar shell + a generic content skeleton — the more
 * specific page-level loading.tsx files (e.g. dashboard/loading.tsx) take
 * over once routing resolves to a specific child segment.
 */
export default function DashboardSegmentLoading() {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#1d3557] p-5 gap-2">
        <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
        <div className="mt-6 space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl bg-white/[0.06]" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-6 md:p-10 space-y-6">
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
      </main>
    </div>
  );
}
