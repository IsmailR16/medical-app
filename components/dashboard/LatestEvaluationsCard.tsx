import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LatestEvaluation } from "@/lib/db/dashboard";

interface LatestEvaluationsCardProps {
  evaluations: LatestEvaluation[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
  });
}

export function LatestEvaluationsCard({
  evaluations,
}: LatestEvaluationsCardProps) {
  if (evaluations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Senaste resultat</CardTitle>
          <CardDescription>Inga resultat än.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senaste resultat</CardTitle>
        <CardDescription>Dina 5 senaste utvärderingar</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {evaluations.map((e) => (
            <li key={e.id} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {e.case_title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.created_at)}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Badge variant={e.diagnosis_correct ? "default" : "secondary"}>
                  {e.grade}
                </Badge>
                <span className="text-sm font-semibold tabular-nums">
                  {Math.round(e.total_score * 100)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
