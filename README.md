# ConStruck Frontend 🏗️

Interfaz web para el sistema de gestión ConStruck.

**Stack**: React 18 + Vite + Tailwind CSS + React Query + Zustand

## Setup rápido

```bash
npm install
cp .env.example .env
# Edita VITE_API_URL si el backend no está en localhost:3000
npm run dev
```

## Estructura

```
src/
├── App.jsx               # Router principal + guards de rol
├── pages/
│   ├── auth/             # LoginPage
│   ├── dashboard/        # Dashboard ejecutivo con KPIs
│   ├── tools/            # Catálogo, asignaciones
│   ├── incidents/        # Registro de incidencias
│   ├── projects/         # Clientes, proyectos, subproyectos
│   ├── workers/          # Gestión de trabajadores
│   └── finance/          # Control de gastos
├── components/
│   ├── layout/           # MainLayout con sidebar responsivo
│   └── ui/               # Modal (reutilizable)
├── services/             # Funciones de llamadas a la API
├── store/                # Zustand store (auth)
└── index.css             # Design system Tailwind
```

## Paleta de colores

| Variable | Hex | Uso |
|----------|-----|-----|
| `--color-bg` | #0d1117 | Fondo principal |
| `--color-surface` | #161b27 | Cards |
| `brand-500` | #f97316 | Naranja principal (acciones) |
| `emerald-400` | #34d399 | Estados positivos |
| `red-400` | #f87171 | Alertas/errores |

## Dependencias clave

- **React Query**: caché de datos del servidor, loading/error states automáticos
- **Zustand**: estado global (auth) sin boilerplate
- **Axios**: cliente HTTP con interceptors para JWT refresh automático
- **react-hot-toast**: notificaciones
- **Recharts**: gráficas del dashboard
- **date-fns**: formateo de fechas en español

## Notas de desarrollo

- El sidebar es completamente responsivo (drawer en mobile)
- Las rutas están protegidas por rol: `<PrivateRoute roles={['ADMIN']}>` 
- Los access tokens se refrescan automáticamente via interceptor de Axios
- El archivo `services/index.js` centraliza todas las llamadas a la API
