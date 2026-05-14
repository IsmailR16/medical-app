"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
  Activity,
  FlaskConical,
  Image as ImageIcon,
  Stethoscope,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { OrderableItem, OrderableSection } from "@/lib/db/dashboard";
import { isLabValueOutOfRange } from "@/lib/utils/clinical-format";

interface InvestigationPanelProps {
  sessionId: string;
  orderables: OrderableItem[];
  sessionActive: boolean;
}

const SECTION_META: Record<OrderableSection, { title: string; icon: typeof Activity }> = {
  vitals: { title: "Vitalparametrar", icon: Activity },
  labs: { title: "Laboratorieprover", icon: FlaskConical },
  imaging: { title: "Bilddiagnostik / EKG", icon: ImageIcon },
  physical_exam: { title: "Status", icon: Stethoscope },
};

const SECTION_ORDER: OrderableSection[] = ["vitals", "labs", "imaging", "physical_exam"];

export function InvestigationPanel({ sessionId, orderables, sessionActive }: InvestigationPanelProps) {
  const [items, setItems] = useState<OrderableItem[]>(orderables);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<OrderableSection, boolean>>({
    vitals: true,
    labs: true,
    imaging: true,
    physical_exam: true,
  });

  const toggleSection = useCallback((section: OrderableSection) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleOrder = useCallback(
    async (itemKey: string) => {
      if (!sessionActive || loadingKey) return;
      setLoadingKey(itemKey);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemKey }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Kunde inte beställa undersökningen.");

        setItems((prev) =>
          prev.map((it) =>
            it.key === itemKey
              ? {
                  ...it,
                  revealed: true,
                  value: body.kind === "single" ? String(body.value ?? "") : undefined,
                  sub_items: body.kind === "panel" ? body.sub_items : undefined,
                }
              : it
          )
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Något gick fel.");
      } finally {
        setLoadingKey(null);
      }
    },
    [sessionId, sessionActive, loadingKey]
  );

  const grouped: Record<OrderableSection, OrderableItem[]> = {
    vitals: [],
    labs: [],
    imaging: [],
    physical_exam: [],
  };
  for (const it of items) grouped[it.section].push(it);

  const hasAny = items.length > 0;

  if (!hasAny) {
    return (
      <div className="text-[13px] text-[#94A3B8] py-4">
        Inga undersökningar tillgängliga för detta fall.
      </div>
    );
  }

  return (
    <div className="sticky top-6 max-h-[700px] overflow-y-auto space-y-4 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#1d3557]/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#1d3557]/20">
      <div>
        <h2 className="text-[14px] font-bold text-[#1d3557]">Undersökningar</h2>
        <p className="text-[12px] text-[#94A3B8] mt-1">
          Klicka &quot;Beställ&quot; för att se resultatet
        </p>
      </div>

      {SECTION_ORDER.map((section) => {
        const list = grouped[section];
        if (list.length === 0) return null;
        const { title, icon: Icon } = SECTION_META[section];
        const isCollapsed = collapsed[section];
        const orderedCount = list.filter((it) => it.revealed).length;
        return (
          <div
            key={section}
            className="bg-white rounded-xl border border-[#1d3557]/[0.06] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleSection(section)}
              className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[#F9FAFB] transition-colors duration-200 cursor-pointer"
            >
              <Icon className="w-4 h-4 text-[#457b9d] shrink-0" strokeWidth={1.5} />
              <h3 className="text-[13px] font-semibold text-[#1d3557] flex-1 text-left">
                {title}
              </h3>
              <span className="text-[11px] text-[#94A3B8] font-medium">
                {orderedCount}/{list.length}
              </span>
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
              ) : (
                <ChevronUp className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
              )}
            </button>
            {!isCollapsed && (
              <div className="divide-y divide-[#1d3557]/[0.04] border-t border-[#1d3557]/[0.04]">
                {list.map((it) => (
                  <OrderableRow
                    key={it.key}
                    item={it}
                    loading={loadingKey === it.key}
                    disabled={!sessionActive}
                    onOrder={() => handleOrder(it.key)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderableRow({
  item,
  loading,
  disabled,
  onOrder,
}: {
  item: OrderableItem;
  loading: boolean;
  disabled: boolean;
  onOrder: () => void;
}) {
  if (!item.revealed) {
    return (
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-[13px] text-[#1d3557] font-medium truncate">{item.label}</span>
        <button
          onClick={onOrder}
          disabled={disabled || loading}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#457b9d] text-white hover:bg-[#3a6781] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
              <span>Beställer…</span>
            </>
          ) : (
            <span>Beställ</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-[#1d3557] font-semibold">{item.label}</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          Beställd
        </span>
      </div>
      {item.sub_items && item.sub_items.length > 0 && (
        <div className="space-y-1 mt-2">
          {item.sub_items.map((s) => (
            <div key={s.label} className="flex justify-between items-start gap-3 py-1">
              <span className="text-[11px] text-[#94A3B8] uppercase tracking-wide font-medium">
                {s.label}
              </span>
              <span className="text-[12px] text-[#1d3557] font-mono font-semibold text-right">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
      {!item.sub_items && item.value && (
        <p
          className={`text-[12px] font-mono leading-relaxed whitespace-pre-wrap ${
            item.section === "labs" &&
            isLabValueOutOfRange(item.value, item.reference ?? null)
              ? "text-rose-600 font-semibold"
              : "text-[#1d3557]"
          }`}
        >
          {item.value}
        </p>
      )}
    </div>
  );
}
