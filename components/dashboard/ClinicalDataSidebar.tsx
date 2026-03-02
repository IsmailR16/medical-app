"use client";

import { ClinicalDataPanel } from "@/components/dashboard/ClinicalDataPanel";
import type { ClinicalDataSection } from "@/lib/db/dashboard";

interface ClinicalDataSidebarProps {
  sections: ClinicalDataSection[];
  onReveal?: (title: string) => void;
}

export function ClinicalDataSidebar({
  sections,
  onReveal,
}: ClinicalDataSidebarProps) {
  if (sections.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Inga kliniska data tillgängliga.
      </div>
    );
  }

  return (
    <div className="sticky top-6 space-y-4">
      <div>
        <h2 className="font-semibold">Kliniska data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Klicka &quot;Visa&quot; för att se data när du behöver det
        </p>
      </div>
      {sections.map((section, index) => (
        <ClinicalDataPanel
          key={index}
          section={section}
          onReveal={onReveal ? () => onReveal(section.title) : undefined}
        />
      ))}
    </div>
  );
}
