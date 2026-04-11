export default function BudgetCard({ budget, spent }) {
  const pct =
    budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-400">Presupuesto utilizado</span>
        <span
          className={`font-mono text-sm font-bold ${pct > 100 ? "text-red-400" : "text-brand-400"}`}
        >
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${pct > 100 ? "bg-red-500" : "bg-brand-500"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>Gastado: ${spent.toLocaleString("es-MX")}</span>
        <span>Total: ${budget.toLocaleString("es-MX")}</span>
      </div>
    </div>
  );
}
