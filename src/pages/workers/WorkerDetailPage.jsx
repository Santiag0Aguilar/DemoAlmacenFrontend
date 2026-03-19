// src/pages/workers/WorkerDetailPage.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { Loader2, Pencil, X, Save } from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import clsx from "clsx";

// ─── Validation helpers (mirror del backend) ────────────────────────────────
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
const NSS_REGEX = /^\d{11}$/;

function validate(form) {
  const errors = {};
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Correo inválido";
  if (form.telefono && !/^\d{10}$/.test(form.telefono))
    errors.telefono = "Debe ser exactamente 10 dígitos";
  if (form.curp && !CURP_REGEX.test(form.curp.toUpperCase()))
    errors.curp = "CURP inválida";
  if (form.rfc && !RFC_REGEX.test(form.rfc.toUpperCase()))
    errors.rfc = "RFC inválido";
  if (
    form.social_security_number &&
    !NSS_REGEX.test(form.social_security_number)
  )
    errors.social_security_number = "NSS inválido, deben ser 11 dígitos";
  return errors;
}

// ─── Edit Form ───────────────────────────────────────────────────────────────
function EditUserForm({ user, onSubmit, isLoading, onClose }) {
  const [form, setForm] = useState({
    nombre: user.nombre ?? "",
    email: user.email ?? "",
    role: user.role === "ADMIN" ? "TRABAJADOR" : (user.role ?? "TRABAJADOR"),
    telefono: user.telefono ?? "",
    curp: user.curp ?? "",
    rfc: user.rfc ?? "",
    social_security_number: user.social_security_number ?? "",
    sueldoBase: user.sueldoBase ?? "",
    horaExtra: user.horaExtra ?? "",
  });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    // Only send non-empty fields
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== "" && v !== null),
    );
    onSubmit(payload);
  };

  const Field = ({ label, name, type = "text", placeholder, hint, upper }) => (
    <div>
      <label className="input-label">{label}</label>
      <input
        className={clsx(
          "input",
          errors[name] && "border-red-500/60 focus:border-red-500",
        )}
        type={type}
        value={form[name]}
        placeholder={placeholder}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [name]: upper ? e.target.value.toUpperCase() : e.target.value,
          }))
        }
      />
      {errors[name] ? (
        <p className="mt-1 text-xs text-red-400">{errors[name]}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-600">{hint}</p>
      ) : null}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Datos generales ─────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Datos generales
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field
              label="Nombre completo"
              name="nombre"
              placeholder={user.nombre}
            />
          </div>
          <Field
            label="Correo"
            name="email"
            type="email"
            placeholder={user.email}
          />
          <Field
            label="Teléfono"
            name="telefono"
            placeholder="10 dígitos"
            hint="10 dígitos, número mexicano"
          />
          {user.role !== "ADMIN" && (
            <div className="col-span-2">
              <label className="input-label">Rol</label>
              <select
                className="input"
                value={form.role}
                onChange={set("role")}
              >
                <option value="TRABAJADOR">Trabajador</option>
                <option value="ENCARGADO">Encargado</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Datos fiscales / IMSS ────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Datos fiscales / IMSS
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="CURP"
            name="curp"
            placeholder="ABCD123456HXXXXXX0"
            upper
            hint="18 caracteres"
          />
          <Field
            label="RFC"
            name="rfc"
            placeholder="ABCD123456XXX"
            upper
            hint="12 o 13 caracteres"
          />
          <div className="col-span-2">
            <Field
              label="Número de Seguro Social (NSS)"
              name="social_security_number"
              placeholder="11 dígitos"
              hint="11 dígitos"
            />
          </div>
        </div>
      </div>

      {/* ── Sueldo ──────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Sueldo
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">Sueldo base semanal ($)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.sueldoBase}
              onChange={set("sueldoBase")}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="input-label">Pago por hora extra ($)</label>
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={form.horaExtra}
              onChange={set("horaExtra")}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────── */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          className="btn-ghost flex-1 justify-center"
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={14} />
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary flex-1 justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Guardar cambios
        </button>
      </div>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function WorkerDetailPage() {
  const { id } = useParams();
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersService.getById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowEdit(false);
      toast.success("Usuario actualizado correctamente");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Error al actualizar usuario"),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="animate-spin mr-2" />
        Cargando...
      </div>
    );

  if (!user)
    return (
      <div className="text-center py-16 text-slate-600">
        Usuario no encontrado
      </div>
    );

  const canEdit = hasRole("ADMIN") || hasRole("ENCARGADO");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{user.nombre}</h1>
          <p className="page-subtitle">
            {user.email} · {user.identificador}
          </p>
        </div>
        {canEdit && (
          <button className="btn-secondary" onClick={() => setShowEdit(true)}>
            <Pencil size={14} />
            Editar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Información general */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Información del trabajador
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              ["Rol", user.role],
              ["Teléfono", user.telefono],
              ["Estado", user.activo ? "Activo" : "Inactivo"],
              [
                "Fecha contratación",
                user.fechaContratacion
                  ? new Date(user.fechaContratacion).toLocaleDateString("es-MX")
                  : "—",
              ],
            ].map(
              ([k, v]) =>
                v && (
                  <div key={k} className="flex justify-between">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-slate-300">{v}</dd>
                  </div>
                ),
            )}
          </dl>
        </div>

        {/* Herramientas asignadas */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Herramientas asignadas ({user.assignmentsAsWorker?.length || 0})
          </h2>
          <div className="space-y-2">
            {user.assignmentsAsWorker?.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-xs py-2 border-b border-white/5"
              >
                <span className="text-slate-300">{a.herramienta?.nombre}</span>
                <span className="badge-orange">Activa</span>
              </div>
            ))}
            {!user.assignmentsAsWorker?.length && (
              <p className="text-slate-600 text-sm">
                Sin herramientas asignadas
              </p>
            )}
          </div>
        </div>

        {/* Información extra / fiscal */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Información extra del trabajador
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              ["CURP", user.curp ?? "—"],
              ["RFC", user.rfc ?? "—"],
              ["NSS", user.social_security_number ?? "—"],
              [
                "Sueldo base semanal",
                user.sueldoBase ? `$ ${user.sueldoBase}` : "—",
              ],
              ["Pago hora extra", user.horaExtra ? `$ ${user.horaExtra}` : "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-500 text-xs mb-0.5">{k}</dt>
                <dd className="text-slate-300 font-mono">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Editar usuario"
      >
        <EditUserForm
          user={user}
          onSubmit={updateMutation.mutate}
          isLoading={updateMutation.isPending}
          onClose={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  );
}
