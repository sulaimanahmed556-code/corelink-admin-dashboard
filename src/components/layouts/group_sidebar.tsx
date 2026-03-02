import {
  Bot,
  LayoutDashboard,
  Users,
  BarChart2,
  CalendarDays,
  MessageSquare,
  LogOut,
} from "lucide-react";
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
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface NavSection {
  sectionName: string;
  icon: React.ElementType;
  routes: { name: string; path: string }[];
}

const GroupSidebar = () => {
  const { pathname } = useLocation();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { user, clearSession } = useAuthStore((state) => ({
    user: state.user,
    clearSession: state.clearSession,
  }));

  const gid = groupId ?? user?.group_id ?? "demo";

  const sections: NavSection[] = [
    {
      sectionName: "Overview",
      icon: LayoutDashboard,
      routes: [{ name: "Dashboard", path: `/group/${gid}/overview` }],
    },
    {
      sectionName: "Members",
      icon: Users,
      routes: [{ name: "All Members", path: `/group/${gid}/members` }],
    },
    {
      sectionName: "Analytics",
      icon: BarChart2,
      routes: [{ name: "Activity", path: `/group/${gid}/analytics` }],
    },
    {
      sectionName: "Weekly Report",
      icon: CalendarDays,
      routes: [
        { name: "AI Summary", path: `/group/${gid}/weekly-summary` },
        { name: "My Agenda", path: `/group/${gid}/agenda` },
      ],
    },
    {
      sectionName: "Conversations",
      icon: MessageSquare,
      routes: [{ name: "Transcription", path: `/group/${gid}/transcription` }],
    },
  ];

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex gap-2 items-center">
          <div className="p-2.5 bg-foreground text-background rounded-lg">
            <Bot className="size-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-bold text-base leading-tight truncate">CoreLink</h4>
            <p className="text-xs text-muted-foreground">Group Dashboard</p>
          </div>
        </div>
        {user && (
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="font-medium text-foreground truncate">{user.full_name || user.email}</div>
            <div className="truncate">{user.email}</div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.sectionName}>
            <SidebarGroupLabel className="gap-2 text-xs">
              <section.icon className="size-3.5" />
              {section.sectionName}
            </SidebarGroupLabel>
            <SidebarGroupContent className="pl-4 ml-4 border-l pt-1">
              <SidebarMenu className="gap-1">
                {section.routes.map((route) => {
                  const active = pathname === route.path;
                  return (
                    <SidebarMenuItem key={route.path}>
                      <Link
                        to={route.path}
                        className={cn(
                          "block text-sm py-0.5 transition-colors hover:text-foreground",
                          active ? "text-foreground font-medium" : "text-muted-foreground"
                        )}
                      >
                        {route.name}
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
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

export default GroupSidebar;
