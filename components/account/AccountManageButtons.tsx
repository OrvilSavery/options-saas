"use client";

import { useClerk } from "@clerk/nextjs";

export default function AccountManageButtons() {
  const { openUserProfile } = useClerk();

  return (
    <>
      <button
        type="button"
        onClick={() => openUserProfile()}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
      >
        Change email
      </button>
      <button
        type="button"
        onClick={() => openUserProfile()}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
      >
        Change password
      </button>
    </>
  );
}
