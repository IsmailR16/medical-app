"use client";

import { ClinicalDataPanel, type ClinicalDataSection } from "@/components/dashboard/ClinicalDataPanel";

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
      <div className="text-[13px] text-[#94A3B8] py-4">
        Inga kliniska data tillgängliga.
      </div>
    );
  }

  return (
    <div className="sticky top-6 space-y-3">
      <div>
        <h2 className="text-[14px] font-bold text-[#1d3557]">Kliniska data</h2>
        <p className="text-[12px] text-[#94A3B8] mt-1">
          Klicka för att visa data när du behöver det
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
