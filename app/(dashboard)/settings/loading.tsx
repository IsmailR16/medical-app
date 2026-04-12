import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <>
      <TopBar title="Inställningar" />
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-6">
        <div>
          <Skeleton className="h-7 w-40 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded-lg" />
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded-lg" />
              <Skeleton className="h-3 w-44 rounded-lg" />
            </div>
          </div>
          <div className="border-t border-[#1d3557]/[0.03] pt-5 grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded-lg" />
                <Skeleton className="h-3.5 w-40 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-4">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <div className="grid md:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-[#F9FAFB] rounded-xl p-4 flex items-center justify-between">
                <Skeleton className="h-3.5 w-32 rounded-lg" />
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Security + Preferences */}
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#1d3557]/[0.04] p-6 space-y-3">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-3.5 w-full rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
