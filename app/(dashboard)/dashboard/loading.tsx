import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <TopBar title="Översikt" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-6">
        <div>
          <Skeleton className="h-7 w-40 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-5 space-y-3">
              <Skeleton className="h-3.5 w-28 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-3">
              <Skeleton className="h-4 w-36 rounded-lg" />
              <Skeleton className="h-3.5 w-48 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-xl" />
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
    </>
  );
}
