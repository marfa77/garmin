interface CoachCardProps {
  title: string;
  message: string;
}

export function CoachCard({ title, message }: CoachCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">{title}</p>
      <p className="text-sm leading-relaxed text-zinc-200">{message}</p>
    </div>
  );
}
