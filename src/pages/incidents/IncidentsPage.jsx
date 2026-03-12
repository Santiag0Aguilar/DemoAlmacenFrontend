// src/pages/incidents/IncidentsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsService, toolsService, usersService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Plus, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

const TIPO_BADGE = { DANO: 'badge-orange', PERDIDA: 'badge-red', ROBO: 'badge-red', MANTENIMIENTO: 'badge-yellow' };

function IncidentForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({ herramientaId: '', tipo: 'DANO', descripcion: '', responsableId: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const { data: tools = [] } = useQuery({ queryKey: ['tools-all'], queryFn: () => toolsService.getAll() });
  const { data: workers = [] } = useQuery({ queryKey: ['workers'], queryFn: () => usersService.getAll({ role: 'TRABAJADOR' }) });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="input-label">Herramienta *</label>
        <select className="input" value={form.herramientaId} onChange={set('herramientaId')} required>
          <option value="">Seleccionar herramienta...</option>
          {tools.map((t) => <option key={t.id} value={t.id}>{t.nombre} {t.numeroSerie ? `· ${t.numeroSerie}` : ''}</option>)}
        </select>
      </div>
      <div>
        <label className="input-label">Tipo de incidencia *</label>
        <select className="input" value={form.tipo} onChange={set('tipo')}>
          <option value="DANO">Daño</option>
          <option value="PERDIDA">Pérdida</option>
          <option value="ROBO">Robo</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
        </select>
      </div>
      <div>
        <label className="input-label">Responsable</label>
        <select className="input" value={form.responsableId} onChange={set('responsableId')}>
          <option value="">Sin responsable asignado</option>
          {workers.map((w) => <option key={w.id} value={w.id}>{w.nombre} · {w.identificador}</option>)}
        </select>
      </div>
      <div>
        <label className="input-label">Descripción *</label>
        <textarea className="input resize-none" rows={3} value={form.descripcion} onChange={set('descripcion')} required />
      </div>
      <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        Registrar incidencia
      </button>
    </form>
  );
}

export default function IncidentsPage() {
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('');

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', filter],
    queryFn: () => incidentsService.getAll({ resuelta: filter !== '' ? filter : undefined }),
  });

  const createMutation = useMutation({
    mutationFn: incidentsService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['incidents'] }); setShowCreate(false); toast.success('Incidencia registrada'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolucion }) => incidentsService.resolve(id, { resolucion }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Incidencia resuelta'); },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incidencias</h1>
          <p className="page-subtitle">Registro de daños, pérdidas y robos</p>
        </div>
        {hasRole('ADMIN', 'ENCARGADO') && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Nueva incidencia
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {[{ v: '', l: 'Todas' }, { v: 'false', l: 'Abiertas' }, { v: 'true', l: 'Resueltas' }].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={clsx('btn-secondary text-xs px-3 py-1.5', filter === v && '!bg-brand-500/20 !border-brand-500/30 !text-brand-400')}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="animate-spin mr-2" size={18} />Cargando...
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Herramienta</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Responsable</th>
                  <th>Reportada por</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  {hasRole('ADMIN', 'ENCARGADO') && <th></th>}
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td className="font-medium text-white">{inc.herramienta?.nombre}</td>
                    <td><span className={TIPO_BADGE[inc.tipo] || 'badge-gray'}>{inc.tipo}</span></td>
                    <td className="text-slate-400 text-xs max-w-48 truncate">{inc.descripcion}</td>
                    <td className="text-slate-400">{inc.responsable?.nombre || <span className="text-slate-700">—</span>}</td>
                    <td className="text-slate-500 text-xs">{inc.reportadoPor?.nombre}</td>
                    <td className="text-slate-500 text-xs">
                      {formatDistanceToNow(new Date(inc.fecha), { addSuffix: true, locale: es })}
                    </td>
                    <td>
                      {inc.resuelta
                        ? <span className="badge-green">Resuelta</span>
                        : <span className="badge-yellow">Abierta</span>}
                    </td>
                    {hasRole('ADMIN', 'ENCARGADO') && (
                      <td>
                        {!inc.resuelta && (
                          <button
                            className="btn-secondary text-xs py-1 px-2"
                            onClick={() => {
                              const res = prompt('Describe la resolución:');
                              if (res) resolveMutation.mutate({ id: inc.id, resolucion: res });
                            }}
                          >
                            <CheckCircle size={12} />
                            Resolver
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Incidencia">
        <IncidentForm onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
      </Modal>
    </div>
  );
}
