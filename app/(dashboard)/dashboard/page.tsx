import { getOrCreateUser } from "@/lib/auth/user";
import { redirect } from "next/navigation";
import ManageSubscriptionButton from "@/components/dashboard/ManageSubscriptionButton";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const isPaid = user.plan !== "free";
  const periodEnd = user.current_period_end
    ? new Date(user.current_period_end)
    : null;

  /** Format a date as "26 feb 2026" in Swedish locale */
  const formatDate = (d: Date) =>
    d.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Välkommen tillbaka, {user.full_name ?? user.email}
        </p>
      </div>

      {/* Subscription card */}
      <section
        aria-labelledby="sub-heading"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2
          id="sub-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Din prenumeration
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {/* Plan */}
          <div>
            <p className="text-sm text-slate-500">Plan</p>
            <p className="mt-1 text-base font-medium capitalize text-slate-900">
              {user.plan}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-1 text-base font-medium text-slate-900">
              <StatusBadge
                status={user.subscription_status}
                cancelAtPeriodEnd={user.cancel_at_period_end}
              />
            </p>
          </div>

          {/* Period end */}
          <div>
            <p className="text-sm text-slate-500">Nästa fakturering</p>
            <p className="mt-1 text-base font-medium text-slate-900">
              {user.cancel_at_period_end && periodEnd
                ? `Avslutas ${formatDate(periodEnd)}`
                : periodEnd
                  ? formatDate(periodEnd)
                  : "—"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isPaid ? (
            <ManageSubscriptionButton />
          ) : (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Uppgradera till Pro
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({
  status,
  cancelAtPeriodEnd,
}: {
  status: string;
  cancelAtPeriodEnd: boolean;
}) {
  let label: string;
  let color: string;

  if (cancelAtPeriodEnd) {
    label = "Avslutas";
    color = "bg-amber-100 text-amber-800";
  } else {
    switch (status) {
      case "active":
        label = "Aktiv";
        color = "bg-green-100 text-green-800";
        break;
      case "trialing":
        label = "Provperiod";
        color = "bg-blue-100 text-blue-800";
        break;
      case "past_due":
        label = "Förfallen betalning";
        color = "bg-red-100 text-red-800";
        break;
      case "canceled":
        label = "Avslutad";
        color = "bg-slate-100 text-slate-600";
        break;
      default:
        label = "Inaktiv";
        color = "bg-slate-100 text-slate-600";
    }
  }

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}