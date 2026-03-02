import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Activity, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { dashboardService, type DashboardStats } from "@/services";
import { queryKeys } from "@/lib/query-keys";

interface StatCard {
  label: string;
  value: number | string;
  subLabel: string;
  description: string;
  icon: React.ElementType;
}

const Dashboard = () => {
  const {
    data: stats,
    isPending,
    isFetching,
    error,
  } = useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardService.getStats(),
  });

  const statCards: StatCard[] = [
    {
      label: "Plans",
      value: isPending ? "-" : stats?.total_plans ?? 0,
      subLabel: isPending ? "" : `${stats?.active_plans ?? 0} active`,
      description: "Billing plans configured",
      icon: CreditCard,
    },
    {
      label: "Subscriptions",
      value: isPending ? "-" : stats?.total_subscriptions ?? 0,
      subLabel: isPending ? "" : `${stats?.active_subscriptions ?? 0} active`,
      description: "Group subscriptions",
      icon: CheckCircle,
    },
    {
      label: "Groups",
      value: isPending ? "-" : stats?.total_groups ?? 0,
      subLabel: isPending ? "" : `${stats?.active_groups ?? 0} monitored`,
      description: "Telegram groups registered",
      icon: Activity,
    },
    {
      label: "Admin Accounts",
      value: isPending ? "-" : stats?.total_admin_accounts ?? 0,
      subLabel: "",
      description: "Dashboard users",
      icon: Users,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">CoreLink platform overview</p>
        </div>
        {(isPending || isFetching) && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5">
          <AlertCircle className="size-4 shrink-0" />
          {error instanceof Error ? error.message : "Failed to load dashboard stats"}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subLabel ? (
                  <span className="text-foreground font-medium">{card.subLabel}</span>
                ) : null}
                {card.subLabel ? " . " : ""}
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
