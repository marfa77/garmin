interface MetricItem {
  label: string;
  value: string;
  hint?: string;
}

export function MetricGrid({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
          {item.hint && <p className="mt-1 text-xs text-zinc-500">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}
