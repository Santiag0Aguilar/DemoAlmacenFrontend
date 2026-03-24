// src/pages/tools/ToolDetailPage.jsx
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toolsService } from "@/services";
import { Loader2, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ToolDetailPage() {
  const { id } = useParams();

  console.log(id);
  const { data: tool, isLoading } = useQuery({
    queryKey: ["tool", id],
    queryFn: () => toolsService.getById(id),
  });
  console.log(tool);
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  if (!tool)
    return (
      <div className="text-center py-16 text-slate-600">
        Herramienta no encontrada
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{tool.nombre}</h1>
          <p className="page-subtitle">
            {tool.tipo} {tool.marca ? `· ${tool.marca}` : ""}{" "}
            {tool.modelo ? tool.modelo : ""}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Información
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              ["N° Serie", tool.numeroSerie],
              ["Estado", tool.estado],
              ["Descripción", tool.descripcion],
              ["Stock disponible", tool?.stock],
            ].map(
              ([k, v]) =>
                v && (
                  <div key={k} className="flex justify-between">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-slate-300 text-right">{v}</dd>
                  </div>
                ),
            )}
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Historial de asignaciones ({tool.assignments?.length || 0})
          </h2>
          <div className="space-y-2">
            {tool.assignments?.slice(0, 10).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-xs py-2 border-b border-white/5"
              >
                <div>
                  <span className="text-slate-300">{a.trabajador?.nombre}</span>
                  <span className="text-slate-600 ml-2">
                    {new Date(a.fechaEntrega).toLocaleDateString("es-MX")}
                  </span>

                  {a?.quantity !== undefined && a?.quantity !== null && (
                    <div className="p-1">
                      Cantidad:{" "}
                      <span className="text-slate-300">{a.quantity}</span>
                    </div>
                  )}
                </div>
                <span
                  className={
                    a.estado === "DEVUELTA" ? "badge-green" : "badge-orange"
                  }
                >
                  {a.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ToolUpdateForm tool={tool} />
    </div>
  );
}

function ToolUpdateForm({ tool }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState({
    estado: tool.estado || "",
    cantidad: "",
    descripcion: tool.descripcion || "",
  });

  useEffect(() => {
    if (tool) {
      setState({
        estado: tool.estado || "",
        cantidad: "",
        descripcion: tool.descripcion || "",
      });
    }
  }, [tool]);

  const updateMutation = useMutation({
    mutationFn: (payload) => toolsService.update(tool.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tool", tool.id] });
      toast.success("Recurso actualizado");
    },
    onError: (e) => {
      toast.error(e.response?.data?.message || "Error actualizando recurso");
    },
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {};

    if (tool.tipo === "CONSUMABLE") {
      const quantity = Number(state.cantidad);
      if (state.cantidad === "" || Number.isNaN(quantity) || quantity < 0) {
        toast.error("Ingresa una cantidad válida (0 o más)");
        return;
      }
      if (quantity > 0) {
        payload.quantity = quantity;
      } else {
        toast.error("La cantidad debe ser mayor a 0 para actualizar stock");
        return;
      }
    }

    if (tool.tipo === "TOOL") {
      const status = state.estado;
      const allowedStatuses = ["ACTIVA", "DANADA", "PERDIDA"];
      if (!allowedStatuses.includes(status)) {
        toast.error("El estado es inválido para una herramienta");
        return;
      }
      if (status !== tool.estado) {
        payload.estado = status;
      }
    }

    if (state.descripcion !== tool.descripcion) {
      payload.descripcion = state.descripcion;
    }

    if (Object.keys(payload).length === 0) {
      toast("No hay cambios para guardar");
      return;
    }

    updateMutation.mutate(payload);
  };

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-4">
        Actualizar recurso
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {tool.tipo === "CONSUMABLE" ? (
          <div>
            <label className="input-label">Agregar stock (número)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={state.cantidad}
              onChange={(e) =>
                setState((s) => ({ ...s, cantidad: e.target.value }))
              }
              placeholder="Ej. 5"
            />
            <p className="text-xs text-slate-500 mt-1">
              Se sumará a stock actual y ajustará estado automáticamente.
            </p>
          </div>
        ) : (
          <div>
            <label className="input-label">Estado</label>
            <select
              className="input"
              value={state.estado}
              onChange={(e) =>
                setState((s) => ({ ...s, estado: e.target.value }))
              }
            >
              <option value="">Seleccionar estado</option>
              <option value="ACTIVA">ACTIVA</option>
              <option value="DANADA">DANADA</option>
              <option value="PERDIDA">PERDIDA</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Cambie el estado aquí cuando la herramienta esté dañada, perdida o
              encontrada de nuevo. El valor se alinea con el proceso de negocio
              (ACTIVA, DANADA, PERDIDA) y evita estados inválidos.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary w-full justify-center"
          disabled={updateMutation.isLoading}
        >
          {updateMutation.isLoading ? (
            <Loader2 className="animate-spin mr-2" size={14} />
          ) : (
            <Wrench size={14} className="mr-2" />
          )}
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
