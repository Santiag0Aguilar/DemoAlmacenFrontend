// src/pages/finance/FinancePage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService, projectsService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Plus, DollarSign, CheckCircle, XCircle, Loader2, Paperclip } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_BADGE = {
  PENDIENTE: 'badge-yellow',
  APROBADO:  'badge-green',
  RECHAZADO: 'badge-red',
};

function ExpenseForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({ concepto: '', monto: '', proyectoId: '', categoria: '', fechaGasto: '', notas: '', comprobanteUrl: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectsService.getAll });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="input-label">Concepto *</label>
          <input className="input" value={form.concepto} onChange={set('concepto')} required placeholder="Materiales, herramienta, transporte..." />
        </div>
        <div>
          <label className="input-label">Monto (MXN) *</label>
          <input className="input" type="number" min="0" step="0.01" value={form.monto} onChange={set('monto')} required />
        </div>
        <div>
          <label className="input-label">Categoría</label>
          <select className="input" value={form.categoria} onChange={set('categoria')}>
            <option value="">Sin categoría</option>
            <option value="materiales">Materiales</option>
            <option value="herramientas">Herramientas</option>
            <option value="transporte">Transporte</option>
            <option value="mano_obra">Mano de obra</option>
            <option value="viáticos">Viáticos</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        <div>
          <label className="input-label">Proyecto</label>
          <select className="input" value={form.proyectoId} onChange={set('proyectoId')}>
            <option value="">Sin proyecto</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Fecha del gasto</label>
          <input className="input" type="date" value={form.fechaGasto} onChange={set('fechaGasto')} />
        </div>
        <div className="col-span-2">
          <label className="input-label">URL del comprobante</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={form.comprobanteUrl}
              onChange={set('comprobanteUrl')}
              placeholder="https://... o sube el archivo"
            />
            <button type="button" className="btn-secondary px-3 flex-shrink-0">
              <Paperclip size={14} />
              Subir
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            💡 Integración de subida de archivos pendiente (AWS S3 / Cloudinary)
          </p>
        </div>
        <div className="col-span-2">
          <label className="input-label">Notas</label>
          <textarea className="input resize-none" rows={2} value={form.notas} onChange={set('notas')} />
        </div>
      </div>
      <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        Registrar gasto
      </button>
    </form>
  );
}

export default function FinancePage() {
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', statusFilter],
    queryFn: () => financeService.getAll({ estado: statusFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: financeService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); setShowCreate(false); toast.success('Gasto registrado'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }) => financeService.approve(id, approved),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success(vars.approved ? 'Gasto aprobado' : 'Gasto rechazado');
    },
  });

  const totalPending = expenses.filter((e) => e.estado === 'PENDIENTE').reduce((sum, e) => sum + Number(e.monto), 0);
  const totalApproved = expenses.filter((e) => e.estado === 'APROBADO').reduce((sum, e) => sum + Number(e.monto), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Control Financiero</h1>
          <p className="page-subtitle">Gastos y comprobantes de encargados</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Registrar gasto
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="kpi-card">
          <div className="text-yellow-400 text-xs uppercase tracking-wider mb-1">Pendiente de aprobación</div>
          <div className="kpi-value text-yellow-400">${totalPending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="kpi-card">
          <div className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Total aprobado</div>
          <div className="kpi-value text-emerald-400">${totalApproved.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'PENDIENTE', 'APROBADO', 'RECHAZADO'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={clsx('btn-secondary text-xs px-3 py-1.5', statusFilter === s && '!bg-brand-500/20 !border-brand-500/30 !text-brand-400')}
          >
            {s || 'Todos'}
          </button>
        ))}
      </div>

      {/* Table */}
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
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Proyecto</th>
                  <th>Categoría</th>
                  <th>Enviado por</th>
                  <th>Fecha</th>
                  <th>Comprobante</th>
                  <th>Estado</th>
                  {hasRole('ADMIN') && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="font-medium text-white">{e.concepto}</td>
                    <td className="font-mono font-medium text-brand-400">
                      ${Number(e.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-slate-400 text-xs">{e.proyecto?.nombre || '—'}</td>
                    <td className="text-slate-500 text-xs">{e.categoria || '—'}</td>
                    <td className="text-slate-400">{e.enviadoPor?.nombre}</td>
                    <td className="text-slate-500 text-xs">{new Date(e.fechaGasto).toLocaleDateString('es-MX')}</td>
                    <td>
                      {e.comprobanteUrl ? (
                        <a href={e.comprobanteUrl} target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-xs flex items-center gap-1">
                          <Paperclip size={11} />Ver
                        </a>
                      ) : <span className="text-slate-700 text-xs">—</span>}
                    </td>
                    <td><span className={STATUS_BADGE[e.estado] || 'badge-gray'}>{e.estado}</span></td>
                    {hasRole('ADMIN') && (
                      <td>
                        {e.estado === 'PENDIENTE' && (
                          <div className="flex gap-1.5">
                            <button
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              onClick={() => approveMutation.mutate({ id: e.id, approved: true })}
                              title="Aprobar"
                            >
                              <CheckCircle size={13} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              onClick={() => approveMutation.mutate({ id: e.id, approved: false })}
                              title="Rechazar"
                            >
                              <XCircle size={13} />
                            </button>
                          </div>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Registrar Gasto" size="lg">
        <ExpenseForm onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
      </Modal>
    </div>
  );
}
