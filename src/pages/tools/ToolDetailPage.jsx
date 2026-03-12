// src/pages/tools/ToolDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toolsService } from '@/services';
import { Loader2, Wrench } from 'lucide-react';

export default function ToolDetailPage() {
  const { id } = useParams();
  const { data: tool, isLoading } = useQuery({ queryKey: ['tool', id], queryFn: () => toolsService.getById(id) });

  if (isLoading) return <div className="flex items-center justify-center py-16 text-slate-500"><Loader2 className="animate-spin mr-2" />Cargando...</div>;
  if (!tool) return <div className="text-center py-16 text-slate-600">Herramienta no encontrada</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{tool.nombre}</h1>
          <p className="page-subtitle">{tool.tipo} {tool.marca ? `· ${tool.marca}` : ''} {tool.modelo ? tool.modelo : ''}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Información</h2>
          <dl className="space-y-3 text-sm">
            {[['N° Serie', tool.numeroSerie], ['Estado', tool.estado], ['Descripción', tool.descripcion]].map(([k, v]) => v && (
              <div key={k} className="flex justify-between">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-300 text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Historial de asignaciones ({tool.assignments?.length || 0})</h2>
          <div className="space-y-2">
            {tool.assignments?.slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-xs py-2 border-b border-white/5">
                <div>
                  <span className="text-slate-300">{a.trabajador?.nombre}</span>
                  <span className="text-slate-600 ml-2">{new Date(a.fechaEntrega).toLocaleDateString('es-MX')}</span>
                </div>
                <span className={a.estado === 'DEVUELTA' ? 'badge-green' : 'badge-orange'}>{a.estado}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
