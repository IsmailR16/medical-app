"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2 } from "lucide-react";

export function AcceptTermsForm() {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acknowledgeNoRealData, setAcknowledgeNoRealData] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inflightRef = useRef(false);

  const allRequiredAccepted =
    acceptTerms && acceptPrivacy && acknowledgeNoRealData;

  async function onSubmit() {
    if (inflightRef.current || !allRequiredAccepted) return;
    inflightRef.current = true;
    setSubmitting(true);
    const toastId = toast.loading("Sparar...");
    try {
      const res = await fetch("/api/users/me/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acceptTerms,
          acceptPrivacy,
          acknowledgeNoRealPatientData: acknowledgeNoRealData,
          marketingConsent,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Kunde inte spara acceptansen.");
      }
      toast.success("Tack! Välkommen till Diagnostika.", { id: toastId });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Något gick fel.", {
        id: toastId,
      });
      inflightRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Critical warning box */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex gap-3">
        <AlertTriangle
          className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
        <div className="text-[13px] text-amber-900 leading-relaxed">
          <p className="font-semibold mb-1">Viktigt</p>
          <p>
            Skriv aldrig in namn, personnummer, journalinformation eller andra
            uppgifter som kan identifiera en verklig person — varken
            patienter, anhöriga eller dig själv. Diagnostika är endast för
            fiktiva patientfall.
          </p>
        </div>
      </div>

      {/* Required checkboxes */}
      <Checkbox
        id="terms"
        checked={acceptTerms}
        onChange={setAcceptTerms}
        disabled={submitting}
        required
      >
        Jag har läst och accepterar{" "}
        <Link
          href="/anvandarvillkor"
          target="_blank"
          className="text-[#457b9d] font-semibold hover:underline"
        >
          Användarvillkoren
        </Link>
        .
      </Checkbox>

      <Checkbox
        id="privacy"
        checked={acceptPrivacy}
        onChange={setAcceptPrivacy}
        disabled={submitting}
        required
      >
        Jag har läst och förstår{" "}
        <Link
          href="/integritetspolicy"
          target="_blank"
          className="text-[#457b9d] font-semibold hover:underline"
        >
          Integritetspolicyn
        </Link>{" "}
        och hur mina uppgifter behandlas.
      </Checkbox>

      <Checkbox
        id="no-real-data"
        checked={acknowledgeNoRealData}
        onChange={setAcknowledgeNoRealData}
        disabled={submitting}
        required
      >
        Jag förstår att Diagnostika är en{" "}
        <strong>utbildningstjänst med fiktiva patientfall</strong> — inte ett
        kliniskt beslutsstöd — och att jag aldrig får skriva in uppgifter om
        verkliga personer.
      </Checkbox>

      {/* Optional */}
      <div className="border-t border-[#1d3557]/[0.06] pt-5">
        <Checkbox
          id="marketing"
          checked={marketingConsent}
          onChange={setMarketingConsent}
          disabled={submitting}
        >
          Jag vill få e-post om nya funktioner och uppdateringar (valfritt).
        </Checkbox>
      </div>

      <button
        onClick={onSubmit}
        disabled={!allRequiredAccepted || submitting}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#457b9d] text-white font-semibold rounded-xl px-6 py-3.5 text-[14px] transition-all duration-300 hover:bg-[#3a6781] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_-4px_rgba(69,123,157,0.4)]"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            Sparar...
          </>
        ) : (
          "Acceptera och fortsätt"
        )}
      </button>

      <p className="text-[12px] text-[#94A3B8] text-center mt-2">
        Du kan när som helst återkalla samtycken eller radera ditt konto i{" "}
        <span className="font-medium">Inställningar</span>.
      </p>
    </div>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  disabled,
  required,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
        checked
          ? "border-[#457b9d]/40 bg-[#457b9d]/[0.04]"
          : "border-[#1d3557]/[0.08] bg-white hover:border-[#1d3557]/[0.12]"
      } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 w-4 h-4 accent-[#457b9d] cursor-pointer"
      />
      <span className="text-[13px] text-[#1d3557] leading-relaxed flex-1">
        {children}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </span>
    </label>
  );
}
