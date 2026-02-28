import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentSession } from "@/lib/db/dashboard";

const statusLabel: Record<string, string> = {
  active: "Pågående",
  submitted: "Inskickad",
  evaluated: "Utvärderad",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  submitted: "secondary",
  evaluated: "outline",
};

interface RecentSessionsTableProps {
  sessions: RecentSession[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentSessionsTable({ sessions }: RecentSessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Senaste sessioner</CardTitle>
          <CardDescription>
            Inga sessioner ännu — starta ditt första patientfall.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senaste sessioner</CardTitle>
        <CardDescription>Dina 10 senaste patientfall</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patientfall</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Startad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/sessions/${s.id}`}
                    className="hover:underline"
                  >
                    {s.case_title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[s.status] ?? "outline"}>
                    {statusLabel[s.status] ?? s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDate(s.started_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
