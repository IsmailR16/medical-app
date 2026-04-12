import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionsLoading() {
  return (
    <>
      <TopBar title="Mina sessioner" />
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

        <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] overflow-hidden">
          <div className="p-4 border-b border-[#1d3557]/[0.03]">
            <div className="flex items-center gap-4">
              <Skeleton className="h-3.5 w-1/4 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-[#1d3557]/[0.03] last:border-b-0">
              <Skeleton className="h-3.5 w-1/4 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
              <Skeleton className="h-3.5 w-1/6 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
