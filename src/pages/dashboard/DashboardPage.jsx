// src/pages/dashboard/DashboardPage.jsx
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services";
import {
  AlertTriangle,
  Wrench,
  Clock,
  TrendingUp,
  CheckCircle2,
  Package,
  ArrowUpRight,
  Activity,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import clsx from "clsx";

// ─── KPI Card ─────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color = "orange", trend }) {
  const colors = {
    orange: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    red: "text-red-400    bg-red-500/10    border-red-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400   bg-blue-500/10   border-blue-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  };

  return (
    <div className="kpi-card">
      {/* Icon */}
      <div
        className={clsx(
          "w-9 h-9 rounded-lg border flex items-center justify-center mb-3",
          colors[color],
        )}
      >
        <Icon size={17} />
      </div>
      <div className="kpi-value">{value ?? "–"}</div>
      <div className="kpi-label mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}

      {/* Accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
    </div>
  );
}

// ─── Tool status pie ───────────────────────────────────────────────
const PIE_COLORS = {
  ACTIVA: "#10b981",
  EN_PRESTAMO: "#f97316",
  DANADA: "#ef4444",
  PERDIDA: "#6366f1",
};

function ToolStatusChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value,
  }));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={75}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#64748b"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#161b27",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            fontSize: 12,
          }}
          itemStyle={{ color: "#e2e8f0" }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => (
            <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Alert row ────────────────────────────────────────────────────
function AlertRow({ icon: Icon, text, color = "red", count }) {
  const colors = {
    red: "bg-red-500/10 border-red-500/20 text-red-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  };
  return (
    <div
      className={clsx(
        "flex items-center justify-between px-4 py-3 rounded-lg border",
        colors[color],
      )}
    >
      <div className="flex items-center gap-2.5 text-sm">
        <Icon size={15} />
        {text}
      </div>
      {count > 0 && (
        <span className="text-xs font-bold bg-current/20 rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-executive"],
    queryFn: dashboardService.getExecutive,
    refetchInterval: 60_000, // Refresca cada minuto
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 size={24} className="animate-spin mr-2" />
        Cargando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center text-red-400">
        Error cargando dashboard. Intenta recargar.
      </div>
    );
  }

  const { tools = {}, alerts = {}, details = {} } = data || {};
  console.log("Dashboard data:", data);
  const totalTools = Object.values(tools).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Ejecutivo</h1>
          <p className="page-subtitle">
            Visión general de operaciones en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Activity size={12} className="text-emerald-400 animate-pulse" />
          En vivo
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Herramientas totales"
          value={totalTools}
          sub={`${tools.EN_PRESTAMO || 0} en préstamo`}
          icon={Package}
          color="orange"
        />
        <KpiCard
          label="Préstamos vencidos"
          value={alerts.herramientasVencidas}
          sub="> 48 horas sin devolver"
          icon={Clock}
          color={alerts.herramientasVencidas > 0 ? "red" : "green"}
        />
        <KpiCard
          label="Incidencias abiertas"
          value={alerts.incidentesSinResolver}
          sub="Sin resolver"
          icon={AlertTriangle}
          color={alerts.incidentesSinResolver > 0 ? "yellow" : "green"}
        />
        <KpiCard
          label="Total de trabajadores"
          value={details.trabajadoresActivos}
          sub="Personal activo"
          icon={Wrench}
          color="blue"
        />
      </div>

      {/* Charts + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tool status chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Estado de Herramientas
          </h2>
          <ToolStatusChart data={tools} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">
                {tools.ACTIVA || 0}
              </div>
              <div className="text-xs text-slate-600">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">
                {(tools.DANADA || 0) + (tools.PERDIDA || 0)}
              </div>
              <div className="text-xs text-slate-600">No disponibles</div>
            </div>
          </div>
        </div>

        {/* Alerts panel */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Alertas Activas
          </h2>
          <div className="space-y-2.5">
            {alerts.herramientasVencidas > 0 && (
              <AlertRow
                icon={Clock}
                text="Herramientas no devueltas (+48h)"
                count={alerts.herramientasVencidas}
                color="red"
              />
            )}
            {alerts.incidentesSinResolver > 0 && (
              <AlertRow
                icon={AlertTriangle}
                text="Incidencias sin resolver"
                count={alerts.incidentesSinResolver}
                color="yellow"
              />
            )}
            {alerts.subproyectosRetrasados > 0 && (
              <AlertRow
                icon={Clock}
                text="Subproyectos fuera de fecha"
                count={alerts.subproyectosRetrasados}
                color="orange"
              />
            )}
            {alerts.tareassCriticasPendientes > 0 && (
              <AlertRow
                icon={AlertTriangle}
                text="Tareas críticas pendientes"
                count={alerts.tareassCriticasPendientes}
                color="yellow"
              />
            )}
            {Object.values(alerts).every((v) => v === 0) && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm py-2">
                <CheckCircle2 size={16} />
                Todo en orden — sin alertas activas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delayed subprojects */}
      {details.delayedSubprojects?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Clock size={14} className="text-orange-400" />
            Subproyectos Retrasados
          </h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Subproyecto</th>
                  <th>Proyecto</th>
                  <th>Encargado</th>
                  <th>Fecha estimada</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {details.delayedSubprojects.map((sp) => (
                  <tr key={sp.id}>
                    <td className="text-white font-medium">{sp.nombre}</td>
                    <td className="text-slate-400">{sp.proyecto?.nombre}</td>
                    <td>{sp.encargado?.nombre}</td>
                    <td className="text-red-400">
                      {sp.fechaEstimada
                        ? new Date(sp.fechaEstimada).toLocaleDateString("es-MX")
                        : "—"}
                    </td>
                    <td>
                      <span className="badge-orange">{sp.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Critical tasks */}
      {details.criticalTasks?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400" />
            Tareas Críticas Pendientes
          </h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Tarea</th>
                  <th>Subproyecto</th>
                  <th>Asignado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {details.criticalTasks.map((t) => (
                  <tr key={t.id}>
                    <td className="text-white font-medium">{t.nombre}</td>
                    <td className="text-slate-400">{t.subproyecto?.nombre}</td>
                    <td>
                      {t.asignado?.nombre || (
                        <span className="text-slate-600">Sin asignar</span>
                      )}
                    </td>
                    <td>
                      <span className="badge-yellow">{t.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
