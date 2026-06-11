import type { ReactNode } from "react";

type Span = "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4";

const spanClass: Record<Span, string> = {
  full: "md:col-span-2 lg:col-span-12",
  "1/2": "md:col-span-1 lg:col-span-6",
  "1/3": "lg:col-span-4",
  "2/3": "lg:col-span-8",
  "1/4": "lg:col-span-3",
  "3/4": "lg:col-span-9",
};

export function DashboardTile({
  children,
  title,
  subtitle,
  span = "1/2",
  className = "",
  noPadding = false,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  span?: Span;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-zinc-800/70 bg-zinc-950/50 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] ${spanClass[span]} ${noPadding ? "" : "p-5"} ${className}`}
    >
      {title && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{title}</p>
          {subtitle && <p className="mt-1 text-xs text-zinc-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function DashboardGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 ${className}`}>
      {children}
    </div>
  );
}
