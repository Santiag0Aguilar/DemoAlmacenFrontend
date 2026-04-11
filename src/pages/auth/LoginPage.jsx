// src/pages/auth/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Loader2, HardHat } from "lucide-react";
import LogoDicast from "@/assets/Humer_Logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 bg-grid-pattern relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={LogoDicast}
            alt="Dicast Logo"
            className="h-20 mx-auto mb-4 object-contain"
          />
          <p className="text-slate-600 text-sm mt-1">
            Sistema de gestión de almacén
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@empresa.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="input-label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          Plataforma exclusiva · Acceso restringido
        </p>
      </div>
    </div>
  );
}
