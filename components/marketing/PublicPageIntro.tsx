interface PublicPageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export default function PublicPageIntro({
  eyebrow,
  title,
  description,
}: PublicPageIntroProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white px-6 py-12 shadow-sm sm:px-10">
      <div className="max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}