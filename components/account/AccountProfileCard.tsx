interface AccountProfileCardProps {
  email: string | null;
  clerkUserId: string | null;
  databaseUserId: string | null;
}

export default function AccountProfileCard({
  email,
  clerkUserId,
  databaseUserId,
}: AccountProfileCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Profile summary
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Email
          </p>
          <p className="mt-2 break-all text-sm font-medium text-zinc-950">
            {email ?? "Not available"}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Clerk user ID
          </p>
          <p className="mt-2 break-all text-sm font-medium text-zinc-950">
            {clerkUserId ?? "Not available"}
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Database user ID
          </p>
          <p className="mt-2 break-all text-sm font-medium text-zinc-950">
            {databaseUserId ?? "Not available"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-600">
        This section is the current account shell. More editable profile controls can be added later once account preferences and settings are actually part of the product scope.
      </p>
    </section>
  );
}