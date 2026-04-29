import Link from "next/link";

export default function PublicHeaderNav() {
  const items = [
    { href: "/pricing", label: "Pricing" },
    { href: "/sample-analysis", label: "Sample analysis" },
  ];

  return (
    <nav className="hidden items-center gap-5 sm:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}