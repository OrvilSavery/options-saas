import type { ReactNode } from "react";
import AccountManageButtons from "@/components/account/AccountManageButtons";
import SignOutAction from "@/components/account/SignOutAction";
import { ensureUserRecord } from "@/lib/auth";
import { getAllAnalysisRuns } from "@/lib/analysis-history/getAllAnalysisRuns";
import { getWatchlistItems } from "@/lib/watchlist/getWatchlistItems";

function getInitials(email: string | null) {
  if (!email) return "SC";
  const localPart = email.split("@")[0] ?? "";
  return localPart.slice(0, 2).toUpperCase() || "SC";
}

function formatMemberSince(value: unknown) {
  if (typeof value !== "string" || !value) return "April 2026";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "April 2026";
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function UsageTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

function Feature({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-sm leading-6 text-white">
      <span className="font-semibold text-emerald-400">✓</span>
      <span>{children}</span>
    </li>
  );
}

export default async function AccountPage() {
  const user = await ensureUserRecord();
  const email = user?.email ?? null;
  const userRecord = user as ({ created_at?: unknown; createdAt?: unknown } & Record<string, unknown>) | null;
  const memberSince = formatMemberSince(userRecord?.created_at ?? userRecord?.createdAt);
  const savedAnalysesResult = user ? await getAllAnalysisRuns(user.id) : { totalCount: 0 };
  const watchlistItems = user ? await getWatchlistItems(user.id) : [];

  return (
    <div className="mx-auto max-w-[640px] space-y-4">
      <header className="pt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Account</h1>
        <p className="mt-1 text-sm text-zinc-600">Manage your profile and subscription.</p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
            {getInitials(email)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-zinc-950">{email ?? "Signed-in user"}</p>
            <p className="mt-1 text-sm text-zinc-500">Member since {memberSince}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <UsageTile label="Plan" value="Starter (free)" />
          <UsageTile label="Saved analyses" value={savedAnalysesResult.totalCount} />
          <UsageTile label="Watchlist tickers" value={watchlistItems.length} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <AccountManageButtons />
          <SignOutAction />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-950">Starter</h2>
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Free
              </span>
            </div>
            <p className="mt-5 text-sm leading-6 text-zinc-600">
              3 analyses per day · Single ticker · Verdict + risk flags · Last 10 saved analyses
            </p>
          </div>
          <a href="/billing" className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-500">
            View billing →
          </a>
        </div>
      </section>

      <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg shadow-slate-200">
        <h2 className="text-xl font-semibold">Upgrade to Pro</h2>
        <p className="mt-1 text-sm leading-6 text-slate-300">
          Everything in Starter, plus the tools serious premium sellers need.
        </p>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <ul className="space-y-1">
            <Feature>Unlimited analyses</Feature>
            <Feature>Full breakdown + alternatives</Feature>
            <Feature>Daily digest email</Feature>
          </ul>
          <ul className="space-y-1">
            <Feature>Watchlist scanning</Feature>
            <Feature>Unlimited saved history</Feature>
            <Feature>Priority support</Feature>
          </ul>
        </div>

        <div className="mt-6 flex items-end gap-1">
          <span className="font-mono text-3xl font-semibold tracking-tight">$24</span>
          <span className="pb-1 text-sm text-slate-400">/ month</span>
        </div>

        <a
          href="/billing"
          className="mt-5 flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-zinc-100"
          style={{ color: "#020617" }}
        >
          Start 14-day free trial
        </a>
        <p className="mt-3 text-center text-xs text-slate-500">No credit card required to start</p>
      </section>
    </div>
  );
}
