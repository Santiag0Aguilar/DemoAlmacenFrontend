// src/pages/projects/ClientsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { clientsService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Plus, Building2, ChevronRight, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

function ClientForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', empresa: '', notas: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div><label className="input-label">Nombre *</label><input className="input" value={form.nombre} onChange={set('nombre')} required /></div>
      <div><label className="input-label">Empresa</label><input className="input" value={form.empresa} onChange={set('empresa')} /></div>
      <div><label className="input-label">Correo</label><input className="input" type="email" value={form.correo} onChange={set('correo')} /></div>
      <div><label className="input-label">Teléfono</label><input className="input" value={form.telefono} onChange={set('telefono')} /></div>
      <div><label className="input-label">Notas</label><textarea className="input resize-none" rows={2} value={form.notas} onChange={set('notas')} /></div>
      <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>{isLoading && <Loader2 size={14} className="animate-spin" />}Crear cliente</button>
    </form>
  );
}

export default function ClientsPage() {
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: clients = [], isLoading } = useQuery({ queryKey: ['clients'], queryFn: clientsService.getAll });

  const createMutation = useMutation({
    mutationFn: clientsService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); setShowCreate(false); toast.success('Cliente creado'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div><h1 className="page-title">Clientes</h1><p className="page-subtitle">{clients.length} clientes</p></div>
        {hasRole('ADMIN', 'ENCARGADO') && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} />Nuevo cliente</button>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500"><Loader2 className="animate-spin mr-2" />Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="card-hover p-5 cursor-pointer group" onClick={() => navigate(`/projects?clienteId=${c.id}`)}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{c.nombre}</div>
                  {c.empresa && <div className="text-xs text-slate-500">{c.empresa}</div>}
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                {c.correo && <div>{c.correo}</div>}
                {c.telefono && <div>{c.telefono}</div>}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-600">{c.projects?.length || 0} proyectos</span>
                <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Cliente">
        <ClientForm onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
      </Modal>
    </div>
  );
}
