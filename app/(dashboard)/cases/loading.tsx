import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function CasesLoading() {
  return (
    <>
      <TopBar title="Fallbibliotek" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-6">
        <div>
          <Skeleton className="h-7 w-36 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-14 rounded-lg" />
                <Skeleton className="h-4 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-3.5 w-full rounded-lg" />
              <Skeleton className="h-3.5 w-2/3 rounded-lg" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
