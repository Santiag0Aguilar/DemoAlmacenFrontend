// src/pages/workers/WorkersPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usersService } from '@/services';
import { useAuthStore } from '@/store/authStore';
import { Plus, Search, Users, ChevronRight, Loader2, UserCheck, UserX } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ROLE_BADGE = {
  ADMIN:      'badge-red',
  ENCARGADO:  'badge-blue',
  TRABAJADOR: 'badge-gray',
};

function CreateUserForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', role: 'TRABAJADOR',
    identificador: '', telefono: '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="input-label">Nombre completo *</label>
          <input className="input" value={form.nombre} onChange={set('nombre')} required />
        </div>
        <div>
          <label className="input-label">Correo *</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="input-label">Contraseña *</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder="Mínimo 8 caracteres" />
        </div>
        <div>
          <label className="input-label">Identificador *</label>
          <input className="input" value={form.identificador} onChange={set('identificador')} required placeholder="EMP-001" />
        </div>
        <div>
          <label className="input-label">Teléfono</label>
          <input className="input" value={form.telefono} onChange={set('telefono')} placeholder="+52 55..." />
        </div>
        <div className="col-span-2">
          <label className="input-label">Rol *</label>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="TRABAJADOR">Trabajador</option>
            <option value="ENCARGADO">Encargado</option>
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary w-full justify-center" disabled={isLoading}>
        {isLoading && <Loader2 size={14} className="animate-spin" />}
        Crear usuario
      </button>
    </form>
  );
}

export default function WorkersPage() {
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => usersService.getAll({ role: roleFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreate(false);
      toast.success('Usuario creado correctamente');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al crear usuario'),
  });

  const deactivateMutation = useMutation({
    mutationFn: usersService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario desactivado');
    },
  });

  const filtered = users.filter((u) =>
    !search || u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trabajadores</h1>
          <p className="page-subtitle">{users.length} usuarios registrados</p>
        </div>
        {hasRole('ADMIN') && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Nuevo usuario
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="ENCARGADO">Encargado</option>
          <option value="TRABAJADOR">Trabajador</option>
        </select>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="animate-spin mr-2" size={20} /> Cargando...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="card-hover p-4 cursor-pointer group"
              onClick={() => navigate(`/workers/${user.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm',
                    user.activo
                      ? 'bg-brand-500/10 border border-brand-500/20 text-brand-400'
                      : 'bg-slate-800 border border-white/5 text-slate-600'
                  )}>
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{user.nombre}</div>
                    <div className="text-xs text-slate-500 font-mono">{user.identificador}</div>
                  </div>
                </div>
                <span className={clsx('badge', ROLE_BADGE[user.role])}>
                  {user.role}
                </span>
              </div>

              <div className="text-xs text-slate-600 mb-3">{user.email}</div>

              <div className="flex items-center justify-between">
                <span className={clsx(
                  'flex items-center gap-1 text-xs',
                  user.activo ? 'text-emerald-400' : 'text-slate-600'
                )}>
                  {user.activo ? <UserCheck size={12} /> : <UserX size={12} />}
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
                <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
              </div>

              {/* Deactivate button - admin only */}
              {hasRole('ADMIN') && user.activo && user.role !== 'ADMIN' && (
                <button
                  className="mt-3 w-full btn-danger text-xs py-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Desactivar a ${user.nombre}?`)) {
                      deactivateMutation.mutate(user.id);
                    }
                  }}
                >
                  Desactivar usuario
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Usuario">
        <CreateUserForm onSubmit={createMutation.mutate} isLoading={createMutation.isPending} />
      </Modal>
    </div>
  );
}
