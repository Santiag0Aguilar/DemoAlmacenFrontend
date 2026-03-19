// src/pages/workers/WorkerDetailPage.jsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services";
import { Loader2 } from "lucide-react";
import { data } from "autoprefixer";

export default function WorkerDetailPage() {
  const { id } = useParams();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => usersService.getById(id),
  });

  console.log({ user });
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{user.nombre}</h1>
          <p className="page-subtitle">
            {user.email} · {user.identificador}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Información extra del trabajador
          </h2>
          <dl className="space-y-3 text-sm">
            {[
              ["Curp", user.curp ? user.curp : "—"],
              ["Rfc", user.rfc ? user.rfc : "—"],
              [
                "social_security_number",
                user.social_security_number ? user.social_security_number : "—",
              ],
              [
                "Sueldo base semanal",
                `$ ${user.sueldoBase ? user.sueldoBase : "—"}`,
              ],
              [
                "Sueldo por hora extra",
                `$ ${user.horaExtra ? user.horaExtra : "—"}`,
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
      </div>
    </div>
  );
}
