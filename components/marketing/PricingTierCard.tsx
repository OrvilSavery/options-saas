import Link from "next/link";

interface PricingTierCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  badge?: string;
  emphasized?: boolean;
}

export default function PricingTierCard({
  name,
  price,
  description,
  features,
  ctaLabel,
  ctaHref,
  badge,
  emphasized = false,
}: PricingTierCardProps) {
  return (
    <section
      className={`rounded-3xl border p-6 shadow-sm ${
        emphasized
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-950"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-semibold uppercase tracking-wide ${
              emphasized ? "text-zinc-300" : "text-zinc-400"
            }`}
          >
            {name}
          </p>
          <h3 className="mt-3 text-3xl font-semibold">{price}</h3>
        </div>

        {badge ? (
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              emphasized
                ? "border-zinc-700 text-zinc-200"
                : "border-zinc-200 text-zinc-600"
            }`}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <p
        className={`mt-4 text-sm leading-6 ${
          emphasized ? "text-zinc-300" : "text-zinc-600"
        }`}
      >
        {description}
      </p>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className={`flex gap-3 text-sm leading-6 ${
              emphasized ? "text-zinc-100" : "text-zinc-700"
            }`}
          >
            <span
              className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                emphasized ? "bg-zinc-300" : "bg-zinc-400"
              }`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-8 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${
          emphasized
            ? "bg-white text-zinc-950 hover:bg-zinc-100"
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {ctaLabel}
      </Link>
    </section>
  );
}