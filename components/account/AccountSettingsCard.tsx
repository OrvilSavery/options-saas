interface AccountSettingsCardProps {
  title: string;
  description: string;
  items: string[];
}

export default function AccountSettingsCard({
  title,
  description,
  items,
}: AccountSettingsCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </p>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-zinc-700">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}