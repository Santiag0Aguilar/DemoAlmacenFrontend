// src/pages/tools/AssignmentsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService, toolsService, usersService, projectsService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Plus, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_BADGE = {
  ACTIVA: 'badge-orange',
  DEVUELTA: 'badge-green',
  VENCIDA: 'badge-red',
  INCIDENCIA: 'badge-red',
  PENDIENTE: 'badge-gray',
};

function AssignmentForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({ herramientaId: '', trabajadorId: '', proyectoId: '', fechaLimite: '', notas: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { data: tools = [] } = useQuery({ queryKey: ['tools', 'ACTIVA'], queryFn: () => toolsService.getAll({ estado: 'ACTIVA' }) });
  const { data: users = [] } = useQuery({ queryKey: ['users', 'TRABAJADOR'], queryFn: () => usersService.getAll({ role: 'TRABAJADOR' }) });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => projectsService.getAll() });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="input-label">Herramienta * (disponibles)</label>
        <select className="input" value={form.herramientaId} onChange={set('herramientaId')} required>
          <option value="">Seleccionar herramienta...</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre} {t.numeroSerie ? `· ${t.numeroSerie}` : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">Trabajador *</label>
        <select className="input" value={form.trabajadorId} onChange={set('trabajadorId')} required>
          <option value="">Seleccionar trabajador...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.nombre} · {u.identificador}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">Proyecto (opcional)</label>
        <select className="input" value={form.proyectoId} onChange={set('proyectoId')}>
          <option value="">Sin proyecto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="input-label">Fecha límite de devolución</label>
        <input className="input" type="datetime-local" value={form.fechaLimite} onChange={set('fechaLimite')} />
      </div>
      <div>
        <label className="input-label">Notas</label>
        <textarea className="input resize-none" rows={2} value={form.notas} onChange={set('notas')} />
      </div>
      <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        Asignar herramienta
      </button>
    </form>
  );
}

export default function AssignmentsPage() {
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ACTIVA');
  const [showCreate, setShowCreate] = useState(false);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments', filter],
    queryFn: () => assignmentsService.getAll({ estado: filter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: assignmentsService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assignments'] }); setShowCreate(false); toast.success('Herramienta asignada'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const returnMutation = useMutation({
    mutationFn: ({ id }) => assignmentsService.returnTool(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assignments'] }); toast.success('Herramienta devuelta'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asignaciones</h1>
          <p className="page-subtitle">Control de herramientas prestadas</p>
        </div>
        {hasRole('ADMIN', 'ENCARGADO') && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Nueva asignación
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['ACTIVA', 'DEVUELTA', 'VENCIDA', ''].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn-secondary text-xs px-3 py-1.5 ${filter === s ? '!bg-brand-500/20 !border-brand-500/30 !text-brand-400' : ''}`}
          >
            {s || 'Todos'}
          </button>
        ))}
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500"><Loader2 className="animate-spin mr-2" size={18} />Cargando...</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Herramienta</th>
                  <th>Trabajador</th>
                  <th>Proyecto</th>
                  <th>Entregada</th>
                  <th>Límite</th>
                  <th>Estado</th>
                  {hasRole('ADMIN', 'ENCARGADO') && <th></th>}
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const isOverdue = a.estado === 'ACTIVA' && a.fechaLimite && new Date(a.fechaLimite) < new Date();
                  return (
                    <tr key={a.id}>
                      <td className="font-medium text-white">{a.herramienta?.nombre}</td>
                      <td>{a.trabajador?.nombre}</td>
                      <td className="text-slate-400 text-xs">{a.proyecto?.nombre || '—'}</td>
                      <td className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(a.fechaEntrega), { addSuffix: true, locale: es })}
                      </td>
                      <td className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                        {a.fechaLimite ? new Date(a.fechaLimite).toLocaleDateString('es-MX') : '—'}
                        {isOverdue && <AlertCircle size={12} className="inline ml-1" />}
                      </td>
                      <td><span className={STATUS_BADGE[a.estado] || 'badge-gray'}>{a.estado}</span></td>
                      {hasRole('ADMIN', 'ENCARGADO') && (
                        <td>
                          {a.estado === 'ACTIVA' && (
                            <button
                              className="btn-secondary text-xs py-1 px-2"
                              onClick={() => returnMutation.mutate({ id: a.id })}
                            >
                              <CheckCircle size={12} /> Devolver
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva Asignación">
        <AssignmentForm onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
      </Modal>
    </div>
  );
}
