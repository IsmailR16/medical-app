import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UpgradeCard() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardDescription>Free-plan</CardDescription>
        <CardTitle className="text-lg font-semibold">
          Uppgradera till Pro
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Få obegränsat antal patientfall, detaljerade utvärderingar och mer.
        </p>
        <div className="pt-2">
          <Button asChild size="sm">
            <Link href="/pricing">
              Se prisplaner
              <IconArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
