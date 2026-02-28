import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UsageCardProps {
  plan: string;
  sessionsUsed: number;
  limit: number; // 3 for free, Infinity for pro
}

export function UsageCard({ plan, sessionsUsed, limit }: UsageCardProps) {
  const isPro = plan !== "free";

  return (
    <Card>
      <CardHeader>
        <CardDescription>Månadsanvändning</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {isPro ? (
            "Obegränsat"
          ) : (
            <>
              {sessionsUsed}/{limit} fall
            </>
          )}
        </CardTitle>
        <div>
          <Badge variant="outline" className="capitalize">
            {plan}-plan
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
