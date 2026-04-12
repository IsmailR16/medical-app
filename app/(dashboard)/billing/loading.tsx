import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <>
      <TopBar title="Abonnemang" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-6">
        <div>
          <Skeleton className="h-7 w-40 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>

        <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-lg" />
              <Skeleton className="h-3.5 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-14 rounded-lg" />
          </div>
          <Skeleton className="h-1 w-full rounded-full" />
          <Skeleton className="h-3.5 w-40 rounded-lg" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-3">
              <Skeleton className="h-4 w-16 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 flex-1 rounded-lg" />
                </div>
              ))}
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
