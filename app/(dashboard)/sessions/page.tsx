import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Calendar, CheckCircle2, Clock } from "lucide-react";

import { getOrCreateUser } from "@/lib/auth/user";
import { getAllSessions } from "@/lib/db/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DifficultyBadge } from "@/components/dashboard/DifficultyBadge";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function SessionsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const sessions = await getAllSessions(user.user_id);

  /* ---- stats ---- */
  const total = sessions.length;
  const completed = sessions.filter(
    (s) => s.status === "evaluated" || s.status === "submitted"
  ).length;
  const inProgress = sessions.filter((s) => s.status === "active").length;
  const scored = sessions.filter((s) => s.overall_score !== null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, s) => sum + (s.overall_score ?? 0), 0) /
            scored.length
        )
      : 0;

  /* ---- helpers ---- */
  function formatDuration(startedAt: string, endAt: string | null): string {
    if (!endAt) return "Pågående";
    const ms =
      new Date(endAt).getTime() - new Date(startedAt).getTime();
    const mins = Math.round(ms / 60000);
    return `${mins} min`;
  }

  return (
    <>
      <TopBar title="Mina sessioner" />
      <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Mina sessioner</h1>
          <p className="text-muted-foreground">
            Se alla dina genomförda och pågående sessioner
          </p>
        </div>
        <Link href="/cases">
          <Button>
            Nytt fall
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold mb-1">{total}</div>
            <div className="text-sm text-muted-foreground">
              Totalt antal sessioner
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold mb-1 text-emerald-600">
              {completed}
            </div>
            <div className="text-sm text-muted-foreground">Genomförda</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold mb-1 text-amber-600">
              {inProgress}
            </div>
            <div className="text-sm text-muted-foreground">Pågående</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold mb-1">{avgScore}</div>
            <div className="text-sm text-muted-foreground">
              Genomsnittlig poäng
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      {sessions.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center text-muted-foreground">
            <p className="text-lg mb-2">Inga sessioner ännu</p>
            <p className="text-sm">
              Starta ditt första patientfall för att börja träna!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patientfall</TableHead>
                  <TableHead>Specialitet</TableHead>
                  <TableHead>Svårighetsgrad</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Tid</TableHead>
                  <TableHead>Poäng</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.case_title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.case_specialty}
                    </TableCell>
                    <TableCell>
                      <DifficultyBadge
                        difficulty={
                          s.case_difficulty as "easy" | "medium" | "hard"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(s.started_at).toLocaleDateString("sv-SE")}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(
                          s.started_at,
                          s.submitted_at ?? s.evaluated_at
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {s.overall_score !== null ? (
                        <span className="text-lg font-semibold text-emerald-600">
                          {s.overall_score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.status === "evaluated" ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 border-emerald-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Klar
                        </Badge>
                      ) : s.status === "submitted" ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Inskickad
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-700 border-amber-200"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pågående
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={
                          s.status === "evaluated"
                            ? `/evaluations/${s.id}`
                            : `/sessions/${s.id}`
                        }
                      >
                        <Button variant="ghost" size="sm">
                          {s.status === "evaluated" ? "Visa" : "Fortsätt"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
}
