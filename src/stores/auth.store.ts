import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminAccount } from "@/services";

export type DashboardSession = "admin" | "group";

interface AuthSession {
  token: string;
  user: AdminAccount;
  dashboard: DashboardSession;
}

interface AuthState {
  token: string | null;
  user: AdminAccount | null;
  dashboard: DashboardSession | null;
  hasHydrated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      dashboard: null,
      hasHydrated: false,
      setSession: ({ token, user, dashboard }) =>
        set({
          token,
          user,
          dashboard,
        }),
      clearSession: () =>
        set({
          token: null,
          user: null,
          dashboard: null,
        }),
      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),
    }),
    {
      name: "corelink-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        dashboard: state.dashboard,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
