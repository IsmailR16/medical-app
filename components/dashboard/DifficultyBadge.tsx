import { Badge } from "@/components/ui/badge";

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const config: Record<Difficulty, { label: string; className: string }> = {
  easy: {
    label: "Lätt",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  medium: {
    label: "Medel",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  hard: {
    label: "Svår",
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const { label, className } = config[difficulty] ?? config.medium;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
