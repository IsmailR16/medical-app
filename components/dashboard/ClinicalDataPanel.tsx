"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{section.title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="text-xs"
          >
            {isRevealed ? (
              <>
                <EyeOff className="mr-1 h-3.5 w-3.5" />
                Dölj
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3.5 w-3.5" />
                Visa
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isRevealed && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="flex justify-between border-b border-border pb-2 text-sm last:border-0"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
