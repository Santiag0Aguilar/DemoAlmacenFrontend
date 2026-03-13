// src/pages/tools/ToolsPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toolsService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { Plus, Search, Wrench, ChevronRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import clsx from "clsx";

const STATUS_BADGE = {
  ACTIVA: "badge-green",
  EN_PRESTAMO: "badge-orange",
  DANADA: "badge-red",
  PERDIDA: "badge-gray",
};

const STATUS_LABEL = {
  ACTIVA: "Disponible",
  EN_PRESTAMO: "En préstamo",
  DANADA: "Dañada",
  PERDIDA: "Perdida",
};

function ToolForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "TOOL",
    numeroSerie: "",
    estado: "ACTIVA",
    stock: "",
    marca: "",
    modelo: "",
    descripcion: "",
  });

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      nombre: form.nombre,
      tipo: form.tipo,
      marca: form.marca || undefined,
      modelo: form.modelo || undefined,
      descripcion: form.descripcion || undefined,
    };

    if (form.tipo === "TOOL") {
      payload.numeroSerie = form.numeroSerie;
      payload.estado = form.estado;
    }

    if (form.tipo === "CONSUMABLE") {
      payload.stock = Number(form.stock);
      payload.estado = form.stock > 0 ? "STOCK" : "SIN_STOCK";
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="input-label">Nombre *</label>
          <input
            className="input"
            value={form.nombre}
            onChange={set("nombre")}
            required
          />
        </div>

        <div>
          <label className="input-label">Tipo *</label>
          <select
            className="input"
            value={form.tipo}
            onChange={(e) =>
              setForm({
                nombre: form.nombre,
                tipo: e.target.value,
                numeroSerie: "",
                estado: "ACTIVA",
                stock: "",
                marca: form.marca,
                modelo: form.modelo,
                descripcion: form.descripcion,
              })
            }
          >
            <option value="TOOL">Herramienta</option>
            <option value="CONSUMABLE">Consumible</option>
          </select>
        </div>

        {form.tipo === "TOOL" && (
          <div>
            <label className="input-label">Número de serie *</label>
            <input
              className="input"
              value={form.numeroSerie}
              onChange={set("numeroSerie")}
              required
            />
          </div>
        )}

        {form.tipo === "TOOL" && (
          <div>
            <label className="input-label">Estado *</label>
            <select
              className="input"
              value={form.estado}
              onChange={set("estado")}
            >
              <option value="ACTIVA">Disponible</option>
              <option value="DANADA">Dañada</option>
              <option value="PERDIDA">Perdida</option>
            </select>
          </div>
        )}

        {form.tipo === "CONSUMABLE" && (
          <div>
            <label className="input-label">Stock inicial *</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.stock}
              onChange={set("stock")}
              required
            />
          </div>
        )}

        <div>
          <label className="input-label">Marca</label>
          <input className="input" value={form.marca} onChange={set("marca")} />
        </div>

        <div>
          <label className="input-label">Modelo</label>
          <input
            className="input"
            value={form.modelo}
            onChange={set("modelo")}
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

      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          Registrar recurso
        </button>
      </div>
    </form>
  );
}

export default function ToolsPage() {
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["tools", search, statusFilter],
    queryFn: () =>
      toolsService.getAll({
        search: search || undefined,
        estado: statusFilter || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: toolsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      setShowCreate(false);
      toast.success("Herramienta registrada");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Error al registrar"),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo de Herramientas</h1>
          <p className="page-subtitle">
            {tools.length} herramientas registradas
          </p>
        </div>
        {hasRole("ADMIN", "ENCARGADO") && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Nueva herramienta
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre o serie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVA">Disponible</option>
          <option value="EN_PRESTAMO">En préstamo</option>
          <option value="DANADA">Dañada</option>
          <option value="PERDIDA">Perdida</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 size={20} className="animate-spin mr-2" /> Cargando...
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <Wrench size={32} className="mx-auto mb-3 opacity-30" />
            <p>No hay herramientas registradas</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Nº Serie</th>
                  <th>Marca/Modelo</th>
                  <th>Estado</th>
                  <th>Asignada a</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => {
                  const active = tool.assignments?.[0];
                  return (
                    <tr
                      key={tool.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/tools/${tool.id}`)}
                    >
                      <td className="font-medium text-white">{tool.nombre}</td>
                      <td className="text-slate-400">{tool.tipo}</td>
                      <td className="font-mono text-xs text-slate-500">
                        {tool.numeroSerie || "—"}
                      </td>
                      <td className="text-slate-400 text-xs">
                        {[tool.marca, tool.modelo].filter(Boolean).join(" ") ||
                          "—"}
                      </td>
                      <td>
                        <span
                          className={STATUS_BADGE[tool.estado] || "badge-gray"}
                        >
                          {STATUS_LABEL[tool.estado] || tool.estado}
                        </span>
                      </td>
                      <td>
                        {active ? (
                          <span className="text-xs text-slate-400">
                            {active.trabajador?.nombre}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-700">—</span>
                        )}
                      </td>
                      <td>
                        <ChevronRight size={14} className="text-slate-600" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Registrar Herramienta"
      >
        <ToolForm
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
        />
      </Modal>
    </div>
  );
}
