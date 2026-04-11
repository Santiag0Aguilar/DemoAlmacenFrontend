// src/store/authStore.js
// Estado global de autenticación con Zustand
// Zustand es más simple que Redux: define estado + acciones juntos
// src/store/authStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      // 🔐 LOGIN
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await authService.login(email, password);

          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message =
            error.response?.data?.message || "Error al iniciar sesión";
          return { success: false, message };
        }
      },

      // 🚪 LOGOUT
      logout: async () => {
        const { refreshToken } = get();

        try {
          if (refreshToken) {
            await authService.logout(refreshToken);
          }
        } catch (_) {
          // ignorar error
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      // 🔁 VALIDAR SESIÓN AL INICIAR APP (CLAVE)
      initAuth: async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          set({ user: null });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authService.me();

          set({
            user,
          });
        } catch (error) {
          // Token inválido / backend dormido / error
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // 👤 Refrescar usuario manualmente
      refreshUser: async () => {
        try {
          const user = await authService.me();
          set({ user });
        } catch (_) {
          get().logout();
        }
      },

      // 🛡️ Roles
      hasRole: (...roles) => {
        const { user } = get();
        return user && roles.includes(user.role);
      },
    }),
    {
      name: "construck-auth",

      // 🔥 SOLO persistir lo necesario
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
