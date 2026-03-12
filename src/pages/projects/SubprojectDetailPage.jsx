// src/pages/projects/SubprojectDetailPage.jsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { subprojectsService } from "@/services";
import { Loader2 } from "lucide-react";

export default function SubprojectDetailPage() {
  const { id } = useParams();
  console.log(id);
  const { data: sp, isLoading } = useQuery({
    queryKey: ["contracts", id],
    queryFn: () => subprojectsService.getById(id),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  if (!sp)
    return (
      <div className="text-center py-16 text-slate-600">
        Subproyecto no encontrado
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{sp.nombre}</h1>
          <p className="page-subtitle">
            {sp.proyecto?.nombre} {sp.ubicacion ? `· ${sp.ubicacion}` : ""}
          </p>
        </div>
      </div>
      <div className="card">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-semibold text-slate-300 text-sm">
            Tareas ({sp.tasks?.length || 0})
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {sp.tasks?.map((t) => (
            <div
              key={t.id}
              className="px-5 py-3.5 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-white">{t.nombre}</div>
                <div className="text-xs text-slate-500">
                  {t.asignado?.nombre || "Sin asignar"}
                </div>
              </div>
              <span
                className={`badge ${t.estado === "COMPLETADA" ? "badge-green" : t.prioridad === 3 ? "badge-red" : "badge-yellow"}`}
              >
                {t.estado}
              </span>
            </div>
          ))}
          {!sp.tasks?.length && (
            <p className="px-5 py-8 text-center text-slate-600 text-sm">
              Sin tareas aún
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
