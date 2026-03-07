import { TopBar } from "@/components/dashboard/TopBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EvaluationDetailLoading() {
  return (
    <>
      <TopBar title="Utvärdering" />
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 max-w-5xl mx-auto w-full">
        {/* Back button */}
        <Skeleton className="h-9 w-48" />

        {/* Header */}
        <div className="text-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>

        {/* Overall Score Card */}
        <Card className="border-2 border-[#0f766e]">
          <CardContent className="p-8 text-center space-y-3">
            <Skeleton className="h-16 w-24 mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
          </CardContent>
        </Card>

        {/* Score Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback Card */}
        <Card className="border-border">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
