"use client";

import Link from "next/link";
import { IconPlayerPlay } from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StartCaseCardProps {
  /** Whether the user has reached the free limit */
  limitReached: boolean;
}

export function StartCaseCard({ limitReached }: StartCaseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Nytt patientfall</CardDescription>
        <CardTitle className="text-lg font-semibold">
          Starta nytt patientfall
        </CardTitle>
        <div className="pt-2">
          {limitReached ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">
                Uppgradera för fler fall
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/cases">
                <IconPlayerPlay className="mr-1 size-4" />
                Välj patientfall
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
