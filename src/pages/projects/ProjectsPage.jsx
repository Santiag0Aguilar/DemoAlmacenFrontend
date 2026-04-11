// src/pages/projects/ProjectsPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { projectsService, clientsService, usersService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import {
  Plus,
  FolderKanban,
  ChevronRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import clsx from "clsx";

const STATUS_BADGE = {
  PLANEACION: "badge-blue",
  ACTIVO: "badge-green",
  EN_PAUSA: "badge-yellow",
  COMPLETADO: "badge-gray",
  CANCELADO: "badge-red",
};

function ProjectForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    clienteId: "",
    encargadoId: "",
    fechaInicio: "",
    fechaEstimada: "",
    ubicacion: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: clientsService.getAll,
  });
  const { data: managers = [] } = useQuery({
    queryKey: ["users", "ENCARGADO"],
    queryFn: () => usersService.getAll({ role: "ENCARGADO" }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="input-label">Nombre del proyecto *</label>
          <input
            className="input"
            value={form.nombre}
            onChange={set("nombre")}
            required
          />
        </div>
        <div>
          <label className="input-label">Cliente *</label>
          <select
            className="input"
            value={form.clienteId}
            onChange={set("clienteId")}
            required
          >
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">Encargado *</label>
          <select
            className="input"
            value={form.encargadoId}
            onChange={set("encargadoId")}
            required
          >
            <option value="">Seleccionar encargado...</option>
            {managers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Ubicación</label>
          <input
            className="input"
            value={form.ubicacion}
            onChange={set("ubicacion")}
            placeholder="Planta Norte - Nave A"
          />
        </div>
        <div>
          <label className="input-label">Fecha inicio</label>
          <input
            className="input"
            type="date"
            value={form.fechaInicio}
            onChange={set("fechaInicio")}
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
        <div className="col-span-2">
          <label className="input-label">Descripción</label>
          <textarea
            className="input resize-none"
            rows={2}
            value={form.descripcion}
            onChange={set("descripcion")}
          />
        </div>
      </div>
      <button
        type="submit"
        className="btn-primary w-full justify-center"
        disabled={isLoading}
      >
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        Crear proyecto
      </button>
    </form>
  );
}

export default function ProjectsPage() {
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsService.getAll,
  });

  const statusMutation = useMutation({
    mutationFn: ({ projectId, estado }) =>
      projectsService.update(projectId, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Estado del proyecto actualizado");
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || "Error actualizando estado");
    },
  });

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      toast.success("Proyecto creado");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error"),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Proyectos</h1>
          <p className="page-subtitle">{projects.length} proyectos</p>
        </div>
        {hasRole("ADMIN") && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Nuevo proyecto
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="animate-spin mr-2" size={20} />
          Cargando...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => {
            const budget = Number(p.presupuestoAsignado);
            const spent = Number(p.presupuestoGastado || 0);
            const pct =
              budget > 0
                ? Math.min(100, Math.round((spent / budget) * 100))
                : 0;
            const isOver = pct > 100;

            return (
              <div
                key={p.id}
                className="card-hover p-5 cursor-pointer group"
                onClick={() => navigate(`/projects/${p.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {p.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.cliente?.nombre}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "badge",
                      STATUS_BADGE[p.estado] || "badge-gray",
                    )}
                  >
                    {p.estado}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-4">
                  Encargado:{" "}
                  <span className="text-slate-400">{p.encargado?.nombre}</span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-600">
                    {p._count?.Contracts || 0} contratos
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-slate-700 group-hover:text-slate-400 transition-colors"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nuevo Proyecto"
        size="lg"
      >
        <ProjectForm
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}
