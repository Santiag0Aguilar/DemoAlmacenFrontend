// src/pages/tools/ToolsPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toolsService, unidadesMedidaService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import {
  Plus,
  Search,
  Wrench,
  ChevronRight,
  Loader2,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import clsx from "clsx";

const STATUS_BADGE = {
  ACTIVA: "badge-green",
  STOCK: "badge-green",
  EN_PRESTAMO: "badge-orange",
  SIN_STOCK: "badge-orange",
  DANADA: "badge-red",
  PERDIDA: "badge-gray",
};

const STATUS_LABEL = {
  ACTIVA: "Disponible",
  EN_PRESTAMO: "En préstamo",
  DANADA: "Dañada",
  PERDIDA: "Perdida",
  STOCK: "En stock",
  SIN_STOCK: "Stock agotado",
};

function ToolForm({ onSubmit, isLoading, unidades = [] }) {
  const [form, setForm] = useState({
    nombre: "",
    tipo: "TOOL",
    numeroSerie: "",
    estado: "ACTIVA",
    stock: "",
    marca: "",
    modelo: "",
    descripcion: "",
    precio_unidad: "",
    unidadMedidaId: "",
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

      precio_unidad: Number(form.precio_unidad) || 0,
      unidadMedidaId: form.unidadMedidaId || null,
    };
    if (form.tipo === "TOOL") {
      payload.numeroSerie = form.numeroSerie || undefined;
    }

    if (form.tipo === "TOOL") {
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
                precio_unidad: form.precio_unidad,
                unidadMedidaId: form.unidadMedidaId,
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
              placeholder="Número de serie"
              onChange={set("numeroSerie")}
              required
            />
          </div>
        )}
        <div>
          <label className="input-label">Precio unidad *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input"
            placeholder="00.00"
            value={form.precio_unidad}
            onChange={set("precio_unidad")}
          />
        </div>
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
      <div>
        <label className="input-label">Unidad de medida *</label>
        <select
          className="input"
          value={form.unidadMedidaId}
          onChange={set("unidadMedidaId")}
        >
          <option value="">Sin unidad</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} ({u.abreviacion})
            </option>
          ))}
        </select>
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

// Tabla reutilizable
function ToolTable({ items, navigate }) {
  const isConsumable = items[0]?.tipo === "CONSUMABLE";

  if (items.length === 0) return null;

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Nº Serie</th>
            <th>Marca/Modelo</th>
            <th>Estado</th>
            {!isConsumable && <th>Asignada a</th>}
            {isConsumable && <th>Stock</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((tool) => {
            const active = tool.assignments?.[0];
            return (
              <tr
                key={tool.id}
                className="cursor-pointer"
                onClick={() => navigate(`/tools/${tool.id}`)}
              >
                <td className="font-medium text-white">{tool.nombre}</td>
                <td className="font-mono text-xs text-slate-500">
                  {tool.numeroSerie || "—"}
                </td>
                <td className="text-slate-400 text-xs">
                  {[tool.marca, tool.modelo].filter(Boolean).join(" ") || "—"}
                </td>
                <td>
                  <span className={STATUS_BADGE[tool.estado] || "badge-gray"}>
                    {STATUS_LABEL[tool.estado] || tool.estado}
                  </span>
                </td>
                {!isConsumable && (
                  <td>
                    {active ? (
                      <span className="text-xs text-slate-400">
                        {active.trabajador?.nombre}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-700">—</span>
                    )}
                  </td>
                )}
                {isConsumable && (
                  <td className="text-slate-400 text-xs">
                    {tool.stock ?? "—"}
                  </td>
                )}
                <td>
                  <ChevronRight size={14} className="text-slate-600" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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

  const [showUnidadModal, setShowUnidadModal] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [unidadForm, setUnidadForm] = useState({
    nombre: "",
    abreviacion: "",
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ["unidadesMedida"],
    queryFn: unidadesMedidaService.getAll,
  });

  const createUnidad = useMutation({
    mutationFn: unidadesMedidaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades-medida"] });
      setShowUnidadModal(false);
      setUnidadForm({ nombre: "", abreviacion: "" });
      toast.success("Unidad creada");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Error al crear"),
  });

  const updateUnidad = useMutation({
    mutationFn: ({ id, data }) => unidadesMedidaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades-medida"] });
      setShowUnidadModal(false);
      setEditingUnidad(null);
      toast.success("Unidad actualizada");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Error al actualizar"),
  });

  const deleteUnidad = useMutation({
    mutationFn: unidadesMedidaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades-medida"] });
      toast.success("Unidad eliminada");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Error al eliminar"),
  });

  const handleUnidadSubmit = (e) => {
    e.preventDefault();

    if (editingUnidad) {
      updateUnidad.mutate({
        id: editingUnidad.id,
        data: unidadForm,
      });
    } else {
      createUnidad.mutate(unidadForm);
    }
  };

  const openEditUnidad = (u) => {
    setEditingUnidad(u);
    setUnidadForm({
      nombre: u.nombre,
      abreviacion: u.abreviacion,
    });
    setShowUnidadModal(true);
  };
  // Separar por tipo directamente
  const toolItems = tools.filter((t) => t.tipo === "TOOL");
  const consumableItems = tools.filter((t) => t.tipo === "CONSUMABLE");

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

  const isEmpty = toolItems.length === 0 && consumableItems.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Catálogo de Herramientas</h1>
          <p className="page-subtitle">
            {toolItems.length} herramientas · {consumableItems.length}{" "}
            consumibles
          </p>
        </div>
        {hasRole("ADMIN", "ENCARGADO") && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Nueva herramienta
          </button>
        )}
      </div>

      {/* Filters — sin filtro de tipo */}
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
          <option value="STOCK">Stock</option>
          <option value="SIN_STOCK">Sin stock</option>
          <option value="EN_PRESTAMO">En préstamo</option>
          <option value="DANADA">Dañada</option>
          <option value="PERDIDA">Perdida</option>
        </select>
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center py-16 text-slate-500">
          <Loader2 size={20} className="animate-spin mr-2" /> Cargando...
        </div>
      ) : isEmpty ? (
        <div className="card text-center py-16 text-slate-600">
          <Wrench size={32} className="mx-auto mb-3 opacity-30" />
          <p>No hay herramientas registradas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabla: Herramientas */}
          {toolItems.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Wrench size={15} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-300">
                  Herramientas
                </h2>
                <span className="text-xs text-slate-600">
                  ({toolItems.length})
                </span>
              </div>
              <ToolTable items={toolItems} navigate={navigate} />
            </div>
          )}

          {/* Tabla: Consumibles */}
          {consumableItems.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Package size={15} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-300">
                  Consumibles
                </h2>
                <span className="text-xs text-slate-600">
                  ({consumableItems.length})
                </span>
              </div>
              <ToolTable items={consumableItems} navigate={navigate} />
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Registrar Herramienta"
      >
        <ToolForm
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
          unidades={unidades}
        />
      </Modal>

      <div className="card space-y-3">
        <div className="flex items-center justify-between px-1 ">
          <h2 className="text-sm font-semibold text-slate-300">
            Unidades de Medida
          </h2>

          {hasRole("ADMIN", "ENCARGADO") && (
            <button
              className="btn-primary"
              onClick={() => {
                setEditingUnidad(null);
                setUnidadForm({ nombre: "", abreviacion: "" });
                setShowUnidadModal(true);
              }}
            >
              <Plus size={14} />
              Nueva
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Abreviación</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u) => (
                <tr key={u.id}>
                  <td className="text-white">{u.nombre}</td>
                  <td className="text-slate-400">{u.abreviacion}</td>
                  <td className="flex gap-2">
                    <button
                      className="text-xs text-blue-400"
                      onClick={() => openEditUnidad(u)}
                    >
                      Editar
                    </button>
                    {hasRole("ADMIN") && (
                      <button
                        className="text-xs text-red-400"
                        onClick={() => deleteUnidad.mutate(u.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        open={showUnidadModal}
        onClose={() => {
          setShowUnidadModal(false);
          setEditingUnidad(null);
        }}
        title={editingUnidad ? "Editar unidad" : "Nueva unidad"}
      >
        <form onSubmit={handleUnidadSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nombre</label>
            <input
              className="input"
              value={unidadForm.nombre}
              onChange={(e) =>
                setUnidadForm({ ...unidadForm, nombre: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="input-label">Abreviación</label>
            <input
              className="input"
              value={unidadForm.abreviacion}
              onChange={(e) =>
                setUnidadForm({ ...unidadForm, abreviacion: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end">
            <button className="btn-primary">
              {editingUnidad ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
