import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { accountsService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";

const SessionSync = () => {
  const { hasHydrated, token, dashboard, setSession, clearSession } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ["auth", "me", token],
    queryFn: () => accountsService.getCurrentAccount(),
    enabled: hasHydrated && Boolean(token),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!meQuery.data || !token) return;

    const resolvedDashboard =
      dashboard ?? (meQuery.data.role === "super_admin" ? "admin" : "group");

    setSession({
      token,
      user: meQuery.data,
      dashboard: resolvedDashboard,
    });
  }, [dashboard, meQuery.data, setSession, token]);

  useEffect(() => {
    if (meQuery.error) {
      clearSession();
    }
  }, [clearSession, meQuery.error]);

  return null;
};

export default SessionSync;
