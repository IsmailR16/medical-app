import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { splitLabValue } from "@/lib/utils/clinical-format";

type ClinicalData = {
  vitals?: Record<string, unknown>;
  lab_results?: Record<string, unknown>;
  imaging?: Record<string, unknown>;
  physical_exam?: Record<string, unknown>;
};

function resolveValue(cd: ClinicalData, itemKey: string):
  | { kind: "panel"; sub_items: { label: string; value: string }[] }
  | { kind: "single"; value: string }
  | null {
  if (itemKey === "vitals") {
    const items = dictToList(cd.vitals);
    return items.length > 0 ? { kind: "panel", sub_items: items } : null;
  }
  const [section, subKey] = itemKey.split(":");
  if (section === "lab" && subKey) {
    const val = cd.lab_results?.[subKey];
    if (val == null) return null;
    // Strip reference range — it's already in the label (e.g. "Hb (ref 117-153)")
    const { value: cleanValue } = splitLabValue(String(val));
    return { kind: "single", value: cleanValue };
  }
  if (section === "imaging" && subKey) {
    const val = cd.imaging?.[subKey];
    return val != null ? { kind: "single", value: String(val) } : null;
  }
  if (section === "physical_exam" && subKey) {
    const val = cd.physical_exam?.[subKey];
    return val != null ? { kind: "single", value: String(val) } : null;
  }
  return null;
}

function dictToList(obj: Record<string, unknown> | undefined): { label: string; value: string }[] {
  if (!obj) return [];
  return Object.entries(obj)
    .filter(([k, v]) => !k.startsWith("_") && v != null && String(v).trim() !== "")
    .map(([k, v]) => ({
      label: prettify(k),
      value: typeof v === "object" ? JSON.stringify(v) : String(v),
    }));
}

function prettify(k: string): string {
  const s = k.replace(/_/g, " ");
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Ej autentiserad." }, { status: 401 });
  }

  let itemKey: string;
  try {
    const body = await request.json();
    itemKey = String(body.itemKey ?? "").trim();
    if (!itemKey) throw new Error();
  } catch {
    return NextResponse.json({ error: "itemKey krävs." }, { status: 400 });
  }

  // Section prefix whitelist + any non-colon chars in the subkey (max 80).
  // This allows unicode letters (å/ä/ö), spaces, digits, punctuation in item
  // names like "DT thorax", "Lungröntgen", "övrigt".
  if (!/^(vitals|(lab|imaging|physical_exam):[^:\n\r]{1,80})$/u.test(itemKey)) {
    return NextResponse.json({ error: "Ogiltig itemKey." }, { status: 400 });
  }

  const sb = createServiceRoleClient();

  const { data: session } = await sb
    .from("sessions")
    .select("id, case_id, status, revealed_items")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session hittades inte." }, { status: 404 });
  }
  if (session.status !== "active") {
    return NextResponse.json({ error: "Sessionen är inte aktiv." }, { status: 400 });
  }

  const { data: caseRow } = await sb
    .from("cases")
    .select("simulation")
    .eq("id", session.case_id)
    .single();

  const cd =
    ((caseRow?.simulation as { clinical_data?: ClinicalData } | null)?.clinical_data) ?? {};
  const resolved = resolveValue(cd, itemKey);
  if (!resolved) {
    return NextResponse.json(
      { error: "Undersökningen finns inte i detta case." },
      { status: 404 }
    );
  }

  const alreadyRevealed = (session.revealed_items as string[]).includes(itemKey);
  if (!alreadyRevealed) {
    const nextRevealed = [...(session.revealed_items as string[]), itemKey];
    await sb.from("sessions").update({ revealed_items: nextRevealed }).eq("id", sessionId);
    revalidateTag(`sessions-${userId}`, "default");
  }

  return NextResponse.json({ itemKey, ...resolved });
}
