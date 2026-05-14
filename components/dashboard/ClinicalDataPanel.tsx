"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ClinicalDataItem {
  label: string;
  value: string;
}

export interface ClinicalDataSection {
  title: string;
  items: ClinicalDataItem[];
}

interface ClinicalDataPanelProps {
  section: ClinicalDataSection;
  /** Called when the user reveals this section for the first time */
  onReveal?: () => void;
}

export function ClinicalDataPanel({ section, onReveal }: ClinicalDataPanelProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  function toggle() {
    if (!isRevealed && onReveal) {
      onReveal();
    }
    setIsRevealed((prev) => !prev);
  }

  return (
    <div className="bg-white rounded-xl border border-[#1d3557]/[0.06] overflow-hidden">
      <button
        onClick={toggle}
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer"
      >
        <h3 className="text-[13px] font-semibold text-[#1d3557]">{section.title}</h3>
        {isRevealed ? (
          <ChevronUp className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
        )}
      </button>

      {isRevealed && (
        <div className="px-4 pb-4 border-t border-[#1d3557]/[0.04] pt-3">
          <div className="space-y-2">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-1.5"
              >
                <span className="text-[11px] text-[#94A3B8] uppercase tracking-wide font-medium">
                  {item.label}
                </span>
                <span className="text-[13px] font-semibold text-[#1d3557] font-mono">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
