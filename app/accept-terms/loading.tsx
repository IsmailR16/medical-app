import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for /accept-terms — shown while the page's server component runs
 * getOrCreateUser() (creates the Supabase row for a brand-new user, which
 * can take ~300-700ms). Mirrors the actual form's layout so the transition
 * feels stable instead of jumping.
 */
export default function AcceptTermsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] to-white flex items-center justify-center p-6">
      <div className="w-full max-w-[640px] bg-white rounded-3xl border border-[#1d3557]/[0.06] shadow-[0_8px_32px_-8px_rgba(29,53,87,0.08)] p-8 md:p-10">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </div>

        {/* Amber warning placeholder */}
        <div className="mb-5 rounded-xl border border-[#1d3557]/[0.04] bg-[#F9FAFB] p-4 space-y-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-5/6 rounded-md" />
        </div>

        {/* Three required checkboxes */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1d3557]/[0.08] bg-white p-4 flex items-start gap-3"
            >
              <Skeleton className="h-4 w-4 rounded-sm shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Optional checkbox + submit button */}
        <div className="mt-5 pt-5 border-t border-[#1d3557]/[0.06] space-y-5">
          <div className="rounded-xl border border-[#1d3557]/[0.08] bg-white p-4 flex items-start gap-3">
            <Skeleton className="h-4 w-4 rounded-sm shrink-0 mt-0.5" />
            <Skeleton className="h-3.5 flex-1 rounded-md" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
