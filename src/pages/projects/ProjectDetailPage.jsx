// src/pages/projects/ProjectDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsService,
  subprojectsService,
  projectWorkersService,
  attendanceService,
} from "@/services";
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

function AttendanceTable({
  workers,
  workersAvailable,
  encargadoId,
  onSubmit,
  assignWorker,
  removeWorker,
}) {
  const [rows, setRows] = useState({});
  const [selectedWorker, setSelectedWorker] = useState(null);

  const [horaEntradaGeneral, setHoraEntradaGeneral] = useState(null);
  const [horaSalidaGeneral, setHoraSalidaGeneral] = useState(null);

  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSalidaModal, setShowSalidaModal] = useState(false);

  const [tempHora, setTempHora] = useState("");
  const formatHora = (iso) => {
    if (!iso) return null;

    const date = new Date(iso);

    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const setEstado = (id, estado) => {
    setRows((r) => {
      const prev = r[id] || {};

      const newRow = { ...prev, estado };

      // limpiar horas personalizadas si ya no aplica
      if (estado !== "EXTRA") {
        delete newRow.horaSalida;
      }

      if (estado !== "RETARDO") {
        delete newRow.horaEntrada;
      }

      return {
        ...r,
        [id]: newRow,
      };
    });
  };

  const submit = () => {
    const now = new Date();

    const asistencias = workers.map((w) => ({
      trabajadorId: w.trabajadorId,
      estado: rows[w.trabajadorId]?.estado || "PRESENTE",
      horaEntrada:
        rows[w.trabajadorId]?.horaEntrada ||
        horaEntradaGeneral ||
        now.toISOString(),

      horaSalida: rows[w.trabajadorId]?.horaSalida || horaSalidaGeneral || null,
    }));

    onSubmit({
      fecha: now.toISOString().split("T")[0],
      encargadoId,
      asistencias,
    });
  };
  const assignedIds = new Set(workers.map((w) => w.trabajadorId));
  const availableWorkers = workersAvailable.filter(
    (w) => !assignedIds.has(w.id),
  );

  return (
    <div className="card">
      <div className="p-4 flex gap-3 border-b border-white/5">
        <button
          className="btn-secondary text-xs"
          onClick={() => setShowEntradaModal(true)}
        >
          {horaEntradaGeneral
            ? `Entrada: ${formatHora(horaEntradaGeneral)}`
            : "Seleccionar hora entrada"}
        </button>

        <button
          className="btn-secondary text-xs"
          onClick={() => setShowSalidaModal(true)}
        >
          {horaSalidaGeneral
            ? `Salida: ${formatHora(horaSalidaGeneral)}`
            : "Seleccionar hora salida"}
        </button>
      </div>
      {/* Asignar trabajador */}
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-slate-300">
          Asignar trabajador
        </h2>
      </div>
      <div className="p-4 flex gap-2 border-b border-white/5">
        <select
          className="input flex-1"
          onChange={(e) => assignWorker(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Seleccionar trabajador
          </option>

          {availableWorkers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.nombre}
              {console.log(w)}
            </option>
          ))}
        </select>
      </div>
      {/* Asistencia */}
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-slate-300">
          Asistencia de hoy
        </h2>
      </div>
      <div className="divide-y divide-white/5">
        {workers.map((w) => {
          const estadoActual = rows[w.trabajadorId]?.estado || "PRESENTE";

          return (
            <div
              key={w.id}
              className="px-5 py-3 flex justify-between items-center"
            >
              <div>
                <div className="text-sm">{w.trabajador.nombre}</div>
                <div className="text-xs text-slate-500">
                  {w.trabajador.identificador}
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <select
                  className="input w-32"
                  value={rows[w.trabajadorId]?.estado || "PRESENTE"}
                  onChange={(e) => setEstado(w.trabajadorId, e.target.value)}
                >
                  <option value="PRESENTE">Presente</option>
                  <option value="FALTA">Falta</option>
                  <option value="EXTRA">EXTRA</option>
                  <option value="RETARDO">Retardo</option>
                  <option value="PERMISO">Permiso</option>
                  <option value="VACACIONES">Vacaciones</option>
                </select>

                {estadoActual === "EXTRA" && (
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => {
                      setSelectedWorker(w.trabajadorId);
                      setShowSalidaModal(true);
                    }}
                  >
                    {rows[w.trabajadorId]?.horaSalida
                      ? `Salida: ${formatHora(rows[w.trabajadorId].horaSalida)}`
                      : "Hora salida trabajador"}
                  </button>
                )}

                {estadoActual === "RETARDO" && (
                  <button
                    className="btn-secondary text-xs"
                    onClick={() => {
                      setSelectedWorker(w.trabajadorId);
                      setShowEntradaModal(true);
                    }}
                  >
                    {rows[w.trabajadorId]?.horaEntrada
                      ? `Entrada: ${formatHora(rows[w.trabajadorId].horaEntrada)}`
                      : "Hora entrada trabajador"}
                  </button>
                )}

                <button
                  className="text-red-400 text-xs hover:text-red-300"
                  onClick={() => removeWorker(w.trabajadorId)}
                >
                  Quitar
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4">
        <button className="btn-primary w-full justify-center" onClick={submit}>
          Guardar asistencia
        </button>
      </div>
      <Modal
        open={showEntradaModal}
        onClose={() => setShowEntradaModal(false)}
        title="Seleccionar hora de entrada"
      >
        <div className="space-y-4">
          <input
            type="time"
            className="input w-full"
            value={tempHora}
            onChange={(e) => setTempHora(e.target.value)}
          />

          <button
            className="btn-primary w-full"
            onClick={() => {
              const now = new Date();
              const [h, m] = tempHora.split(":");

              now.setHours(h);
              now.setMinutes(m);

              setHoraEntradaGeneral(now.toISOString());
              setTempHora("");
              setShowEntradaModal(false);
            }}
          >
            Guardar hora
          </button>
        </div>
      </Modal>
      <Modal
        open={showSalidaModal}
        onClose={() => setShowSalidaModal(false)}
        title="Seleccionar hora de salida"
      >
        <div className="space-y-4">
          <input
            type="time"
            className="input w-full"
            value={tempHora}
            onChange={(e) => setTempHora(e.target.value)}
          />

          <button
            className="btn-primary w-full"
            onClick={() => {
              const now = new Date();
              const [h, m] = tempHora.split(":");

              now.setHours(h);
              now.setMinutes(m);

              const horaISO = now.toISOString();

              if (selectedWorker) {
                setRows((r) => ({
                  ...r,
                  [selectedWorker]: {
                    ...r[selectedWorker],
                    horaSalida: horaISO,
                  },
                }));

                setSelectedWorker(null);
              } else {
                setHoraSalidaGeneral(horaISO);
              }

              setTempHora("");
              setShowSalidaModal(false);
            }}
          >
            Guardar hora
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuthStore();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsService.getById(id),
  });

  const { data: workers = [] } = useQuery({
    queryKey: ["project-workers", id],
    queryFn: () => projectWorkersService.getByProject(id),
  });

  const { data: todayAttendance = [] } = useQuery({
    queryKey: ["attendance-today", id],
    queryFn: () => attendanceService.getToday(id),
  });

  const { data: workersAvailable = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: () =>
      import("@/services").then((s) =>
        s.usersService.getAll({ role: "TRABAJADOR" }),
      ),
  });

  const assignWorkerMutation = useMutation({
    mutationFn: (trabajadorId) =>
      projectWorkersService.assign(id, { trabajadorId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-workers", id] });
      toast.success("Trabajador asignado");
    },

    onError: (e) => {
      toast.error(e.response?.data?.message || "Error asignando trabajador");
    },
  });

  const removeWorkerMutation = useMutation({
    mutationFn: (workerId) => projectWorkersService.remove(id, workerId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-workers", id] });
      toast.success("Trabajador removido del proyecto");
    },

    onError: (e) => {
      toast.error(e.response?.data?.message || "Error removiendo trabajador");
    },
  });
  const attendanceMutation = useMutation({
    mutationFn: (data) => attendanceService.create(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today", id] });
      toast.success("Asistencia guardada");
    },
    onError: (e) => {
      const data = e.response?.data;

      if (data?.errors?.length) {
        data.errors.forEach((err) => {
          toast.error(`${err.path}: ${err.msg}`);
        });
      } else {
        toast.error(data?.message || "Error");
      }
    },
  });

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
              onClick={() => navigate(`/subprojects/${sp.id}`)}
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

      <AttendanceTable
        workers={workers}
        workersAvailable={workersAvailable}
        encargadoId={user?.id}
        onSubmit={attendanceMutation.mutate}
        assignWorker={assignWorkerMutation.mutate}
        removeWorker={removeWorkerMutation.mutate}
      />
    </div>
  );
}
