import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Loader2 } from "lucide-react";
import AdminSidebar from "./admin_sidebar";
import { useAuthStore } from "@/stores/auth.store";

const AdminLayout = () => {
  const location = useLocation();
  const { hasHydrated, token, user } = useAuthStore();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm gap-2">
        <Loader2 className="size-4 animate-spin" />
        Loading session...
      </div>
    );
  }

  if (!token || !user || user.role !== "super_admin") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="w-full">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2 flex items-center justify-between gap-2">
          <SidebarTrigger />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
