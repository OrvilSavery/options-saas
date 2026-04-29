"use client";

import { useClerk } from "@clerk/nextjs";

export default function SignOutAction() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => void signOut({ redirectUrl: "/" })}
      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
    >
      Sign out
    </button>
  );
}
