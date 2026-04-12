import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionDetailLoading() {
  return (
    <>
      <TopBar title="Session" />
      <div className="p-6 md:p-10 w-full max-w-[1600px] mx-auto">
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-52 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-lg" />
            <Skeleton className="h-5 w-14 rounded-lg" />
          </div>
          <Skeleton className="h-3.5 w-80 rounded-lg" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-w-0 space-y-4">
            <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-4 space-y-3">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded-lg" />
                <Skeleton className="h-3.5 w-2/3 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
