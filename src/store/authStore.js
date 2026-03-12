// src/store/authStore.js
// Estado global de autenticación con Zustand
// Zustand es más simple que Redux: define estado + acciones juntos

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await authService.login(email, password);
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Error al iniciar sesión';
          return { success: false, message };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await authService.logout(refreshToken);
        } catch (_) {
          // Continuar aunque falle el logout en el servidor
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      // Obtener perfil actualizado del servidor
      refreshUser: async () => {
        try {
          const user = await authService.me();
          set({ user });
        } catch (_) {
          get().logout();
        }
      },

      hasRole: (...roles) => {
        const { user } = get();
        return user && roles.includes(user.role);
      },
    }),
    {
      name: 'construck-auth',
      // Solo persistir lo necesario (no el loading state)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
