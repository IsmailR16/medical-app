import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function EvaluationDetailLoading() {
  return (
    <>
      <TopBar title="Utvärdering" />
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto w-full space-y-6">
        <Skeleton className="h-3.5 w-40 rounded-lg" />

        <div className="text-center space-y-3">
          <Skeleton className="h-12 w-12 rounded-2xl mx-auto" />
          <Skeleton className="h-7 w-56 mx-auto rounded-lg" />
          <Skeleton className="h-3.5 w-40 mx-auto rounded-lg" />
        </div>

        <div className="rounded-[2rem] bg-[#1d3557]/[0.02] py-8 text-center space-y-3">
          <Skeleton className="h-12 w-20 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-28 mx-auto rounded-lg" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-5 space-y-3">
              <Skeleton className="h-3 w-28 rounded-lg" />
              <Skeleton className="h-5 w-12 rounded-lg" />
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-3">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-3.5 w-full rounded-lg" />
          <Skeleton className="h-3.5 w-full rounded-lg" />
          <Skeleton className="h-3.5 w-2/3 rounded-lg" />
        </div>

        <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-3">
          <Skeleton className="h-4 w-36 rounded-lg" />
          <Skeleton className="h-3.5 w-full rounded-lg" />
          <Skeleton className="h-3.5 w-5/6 rounded-lg" />
        </div>
      </div>
    </>
  );
}
