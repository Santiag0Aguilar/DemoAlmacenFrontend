// src/pages/projects/ProjectDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService, subprojectsService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Plus, ChevronRight } from "lucide-react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

function SubprojectForm({ proyectoId, onSubmit, isLoading }) {
  const { data: managers = [] } = useQuery({
    queryKey: ["managers"],
    queryFn: () =>
      import("@/services").then((s) =>
        s.usersService.getAll({ role: "ENCARGADO" }),
      ),
  });
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    encargadoId: "",
    ubicacion: "",
    presupuestoAsignado: "",
    fechaEstimada: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, proyectoId });
      }}
      className="space-y-4"
    >
      <div>
        <label className="input-label">Nombre *</label>
        <input
          className="input"
          value={form.nombre}
          onChange={set("nombre")}
          required
        />
      </div>
      <div>
        <label className="input-label">Ubicación</label>
        <input
          className="input"
          value={form.ubicacion}
          onChange={set("ubicacion")}
          placeholder="Nave A, Nave B..."
        />
      </div>
      <div>
        <label className="input-label">Encargado *</label>
        <select
          className="input"
          value={form.encargadoId}
          onChange={set("encargadoId")}
          required
        >
          <option value="">Seleccionar...</option>
          {managers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">Presupuesto</label>
        <input
          className="input"
          type="number"
          min="0"
          value={form.presupuestoAsignado}
          onChange={set("presupuestoAsignado")}
        />
      </div>
      <div>
        <label className="input-label">Fecha estimada</label>
        <input
          className="input"
          type="date"
          value={form.fechaEstimada}
          onChange={set("fechaEstimada")}
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full justify-center"
        disabled={isLoading}
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}Crear
        subproyecto
      </button>
    </form>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsService.getById(id),
  });
  /*   console.log(project); */
  const createSubMutation = useMutation({
    mutationFn: subprojectsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setShowCreate(false);
      toast.success("Subproyecto creado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error"),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  if (!project)
    return (
      <div className="text-center py-16 text-slate-600">
        Proyecto no encontrado
      </div>
    );

  const budget = Number(project.presupuestoAsignado);
  const spent = Number(project.presupuestoGastado || 0);
  const pct =
    budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.nombre}</h1>
          <p className="page-subtitle">
            {project.cliente?.nombre}{" "}
            {project.ubicacion ? `· ${project.ubicacion}` : ""}
          </p>
        </div>
        {hasRole("ADMIN", "ENCARGADO") && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Nuevo subproyecto
          </button>
        )}
      </div>

      {/* Budget */}
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

      {/* Subprojects */}
      <div className="card">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-semibold text-slate-300 text-sm">
            Contratos ({project.Contracts?.length || 0})
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {project.Contracts?.map((sp) => (
            <div
              key={sp.id}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer"
              onClick={() => navigate(`/contracts/${sp.id}`)}
            >
              <div>
                <div className="text-sm font-medium text-white">
                  {sp.nombre}
                </div>
                <div className="text-xs text-slate-500">
                  {sp.ubicacion || sp.encargado?.nombre}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600">
                  {sp._count?.tasks || 0} tareas
                </span>
                <span
                  className={`badge badge-${sp.estado === "ACTIVO" ? "green" : sp.estado === "COMPLETADO" ? "gray" : "yellow"}`}
                >
                  {sp.estado}
                </span>
                <ChevronRight size={14} className="text-slate-600" />
              </div>
            </div>
          ))}
          {!project.Contracts?.length && (
            <p className="px-5 py-8 text-center text-slate-600 text-sm">
              Sin contratos aún
            </p>
          )}
        </div>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo Subproyecto"
      >
        <SubprojectForm
          proyectoId={id}
          onSubmit={createSubMutation.mutate}
          isLoading={createSubMutation.isPending}
        />
      </Modal>
    </div>
  );
}
