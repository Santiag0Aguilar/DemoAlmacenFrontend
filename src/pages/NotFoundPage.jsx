// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-center p-4">
      <div>
        <div className="font-display text-8xl font-bold text-brand-500/20 mb-4">404</div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Página no encontrada</h1>
        <p className="text-slate-500 mb-6">Esta ruta no existe en la plataforma.</p>
        <Link to="/dashboard" className="btn-primary inline-flex">Volver al dashboard</Link>
      </div>
    </div>
  );
}
