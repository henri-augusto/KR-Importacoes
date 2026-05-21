import Link from "next/link";

type ErrorStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  statusCode?: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  onRetry?: () => void;
};

export function ErrorState({
  eyebrow = "Ops",
  title,
  description,
  statusCode,
  primaryAction,
  secondaryAction,
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="flex min-h-[60dvh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-200/70 bg-white p-8 text-center shadow-[0_24px_70px_-45px_rgba(24,24,27,0.35)] md:p-10">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-rose-50 text-rose-900">
          <span className="font-mono text-sm font-semibold">{statusCode ?? "!"}</span>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 md:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-600 md:text-base">
          {description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-900 px-6 text-sm font-medium text-white transition-transform active:scale-[0.98]"
            >
              Tentar novamente
            </button>
          )}
          {primaryAction && (
            <Link
              href={primaryAction.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-900 px-6 text-sm font-medium text-white transition-transform active:scale-[0.98]"
            >
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-medium text-zinc-800"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
