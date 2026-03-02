import { Building2, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";
import { SIDEBAR_DATA } from "./sidebar_data";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  
  const handleLogout = () => {
    clearSession();
    navigate("/admin/login", { replace: true });
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex gap-2 items-center mb-8">
          <div className="p-4 bg-blue-700 text-white rounded-lg">
            <Building2 />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-2xl leading-tight">CoreLink</h4>
            <p className="text-xs">Admin Dashboard</p>
          </div>
        </div>
        {user && (
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="font-medium text-foreground truncate">{user.full_name || user.email}</div>
            <div className="truncate">{user.email}</div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="">
        {SIDEBAR_DATA.map((section) => (
          <SidebarGroup key={section.sectionName}>
            <SidebarGroupLabel className="gap-2">
              <section.sectionIcon />
              {section.sectionName}
            </SidebarGroupLabel>

            <SidebarGroupContent className="pl-4 ml-4 border-l pt-4">
              <SidebarMenu className="gap-2">
                {section.routes.map((route) => (
                  <SidebarMenuItem key={route.path}>
                    <Link to={route.path} className="hover:underline">
                      {route.name}
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 w-full rounded-md hover:bg-muted"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
