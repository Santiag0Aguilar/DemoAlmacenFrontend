// src/components/layout/MainLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  AlertTriangle,
  FolderKanban,
  Users,
  DollarSign,
  Building2,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Settings,
  Bell,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  {
    group: "General",
    items: [
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    group: "Herramientas",
    items: [
      { to: "/tools", icon: Wrench, label: "Catálogo" },
      { to: "/assignments", icon: ClipboardList, label: "Asignaciones" },
      {
        to: "/incidents",
        icon: AlertTriangle,
        label: "Incidencias",
        roles: ["ADMIN", "ENCARGADO"],
      },
    ],
  },
  {
    group: "Proyectos",
    items: [
      {
        to: "/clients",
        icon: Building2,
        label: "Clientes",
        roles: ["ADMIN"],
      },
      {
        to: "/projects",
        icon: FolderKanban,
        label: "Proyectos",
        roles: ["ADMIN", "ENCARGADO"],
      },
    ],
  },
  {
    group: "Gestión",
    items: [
      {
        to: "/workers",
        icon: Users,
        label: "Trabajadores",
        roles: ["ADMIN"],
      },
      {
        to: "/finance",
        icon: DollarSign,
        label: "Finanzas",
        roles: ["ADMIN"],
      },
    ],
  },
];

function RoleBadge({ role }) {
  const colors = {
    ADMIN: "bg-brand-500/20 text-brand-400 border-brand-500/30",
    ENCARGADO: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    TRABAJADOR: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return (
    <span
      className={clsx(
        "text-xs px-2 py-0.5 rounded-full border font-medium",
        colors[role] || colors.TRABAJADOR,
      )}
    >
      {role}
    </span>
  );
}

export default function MainLayout() {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8  rounded-lg flex items-center justify-center shadow-glow-sm">
            <span className="font-display font-bold text-white text-sm">H</span>
          </div>
          <div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              Humer
            </span>
            <div className="text-[10px] text-slate-600 uppercase tracking-widest">
              Sistema Gestión Empresarial
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navItems.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.some((r) => hasRole(r)),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.group}>
              <div className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-slate-600">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      clsx("nav-link", isActive && "active")
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 font-bold text-xs">
              {user?.nombre?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.nombre}
            </div>
            <RoleBadge role={user?.role} />
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-56 flex-col bg-[#0d1117] border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 z-50 bg-[#0d1117] border-r border-white/5 flex flex-col transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 relative">
            <Bell size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
