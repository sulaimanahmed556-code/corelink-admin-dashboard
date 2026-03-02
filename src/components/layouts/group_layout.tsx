import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Loader2 } from "lucide-react";
import GroupSidebar from "./group_sidebar";
import { useAuthStore } from "@/stores/auth.store";

const GroupLayout = () => {
  const location = useLocation();
  const { groupId } = useParams<{ groupId: string }>();

  const { hasHydrated, token, user } = useAuthStore();

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm gap-2">
        <Loader2 className="size-4 animate-spin" />
        Loading session...
      </div>
    );
  }

  if (!token || !user || user.role !== "group_admin") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user.group_id) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (groupId && groupId !== user.group_id) {
    return <Navigate to={`/group/${user.group_id}/overview`} replace />;
  }

  return (
    <SidebarProvider>
      <GroupSidebar />
      <main className="w-full">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-xs text-muted-foreground">Group Dashboard</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default GroupLayout;
