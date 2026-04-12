import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function EvaluationsLoading() {
  return (
    <>
      <TopBar title="Utvärderingar" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-6">
        <div>
          <Skeleton className="h-7 w-44 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-5 space-y-3">
              <Skeleton className="h-7 w-7 rounded-xl" />
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="h-5 w-14 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Overall performance skeleton */}
        <div className="rounded-[2rem] bg-[#1d3557]/[0.03] p-8 md:p-10 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-5 w-48 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-3.5 w-56 rounded-lg" />
        </div>

        {/* Category bars skeleton */}
        <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#1d3557]/[0.03]">
            <Skeleton className="h-4 w-40 rounded-lg" />
          </div>
          <div className="p-6 space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation list skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-44 rounded-lg" />
                  <Skeleton className="h-3 w-28 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
