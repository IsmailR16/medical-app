import { TopBar } from "@/components/dashboard/TopBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SessionDetailLoading() {
  return (
    <>
      <TopBar title="Session" />
      <div className="w-full max-w-[1600px] mx-auto px-4 py-6 lg:px-6">
        {/* Header skeleton */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>

        {/* 2-column layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat area */}
          <div className="lg:col-span-2 min-w-0 space-y-4">
            <Card className="border-border">
              <CardContent className="p-4 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* Clinical Data Sidebar */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
