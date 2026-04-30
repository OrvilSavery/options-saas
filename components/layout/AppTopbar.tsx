"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analyzer", label: "Analyzer" },
  { href: "/history", label: "History" },
  { href: "/watchlist", label: "Watchlist" },
];

function StrikeMark() {
  return (
    <span aria-hidden="true" className="relative inline-flex h-4 w-5 items-center">
      <span className="absolute left-[1px] right-[1px] top-1/2 h-px -translate-y-1/2 bg-slate-300" />
      <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-500" />
      <span className="absolute left-[7px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber-500" />
      <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-900" />
    </span>
  );
}

function AccountIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M10 10a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 10 10Zm0 1.5c-3.02 0-5.5 1.58-5.5 3.5 0 .83.67 1.5 1.5 1.5h8c.83 0 1.5-.67 1.5-1.5 0-1.92-2.48-3.5-5.5-3.5Z"
      />
    </svg>
  );
}

function BillingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M3 5.25C3 4.56 3.56 4 4.25 4h11.5c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25H4.25C3.56 16 3 15.44 3 14.75v-9.5Zm1.5 1.25v1h11v-1h-11Zm0 3v5h11v-5h-11Zm1.25 3.25c0-.41.34-.75.75-.75H9c.41 0 .75.34.75.75s-.34.75-.75.75H6.5a.75.75 0 0 1-.75-.75Z"
      />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return open ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
      />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 5h16v1.5H2V5Zm0 4.25h16v1.5H2v-1.5Zm0 4.25h16v1.5H2v-1.5Z"
      />
    </svg>
  );
}

export default function AppTopbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-[52px] items-center justify-between px-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-7">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2"
            aria-label="EntryCheck dashboard"
          >
            <StrikeMark />
            <span className="text-[15px] font-bold tracking-[-0.01em] text-slate-950">
              EntryCheck
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-md px-3 py-2 text-[13px] transition",
                    isActive
                      ? "bg-slate-100 font-semibold text-slate-950"
                      : "font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 sm:hidden"
          >
            <HamburgerIcon open={mobileMenuOpen} />
          </button>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-[30px] w-[30px] rounded-full",
                userButtonPopoverCard: "rounded-xl border border-slate-200 shadow-lg shadow-slate-200/60",
                userButtonPopoverActionButton: "text-slate-700 hover:bg-slate-50",
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Account"
                href="/account"
                labelIcon={<AccountIcon />}
              />
              <UserButton.Link
                label="Billing"
                href="/billing"
                labelIcon={<BillingIcon />}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-slate-100 bg-white px-4 pb-3 pt-2 sm:hidden"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "block rounded-md px-3 py-2.5 text-[14px] transition",
                  isActive
                    ? "bg-slate-100 font-semibold text-slate-950"
                    : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}
