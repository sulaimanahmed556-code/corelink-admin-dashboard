import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Users, TrendingUp, Activity } from "lucide-react";
import { groupDashboardService } from "@/services/group-dashboard.service";
import { queryKeys } from "@/lib/query-keys";

const sentimentLabel = (s: number | null) => {
  if (s === null) return { label: "-", color: "text-muted-foreground" };
  if (s > 0.2) return { label: "Positive", color: "text-green-600" };
  if (s < -0.2) return { label: "Negative", color: "text-red-500" };
  return { label: "Neutral", color: "text-yellow-600" };
};

const GroupOverviewPage = () => {
  const { groupId } = useParams<{ groupId: string }>();

  const {
    data,
    isPending,
    error,
  } = useQuery({
    queryKey: queryKeys.group.overview(groupId ?? ""),
    queryFn: () => groupDashboardService.getOverview(groupId!),
    enabled: Boolean(groupId),
  });

  if (!groupId) {
    return <div className="p-6 text-sm text-destructive">Missing group ID</div>;
  }

  if (isPending) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="size-4 animate-spin" /> Loading overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load overview"}
      </div>
    );
  }

  if (!data) return null;

  const sent = sentimentLabel(data.avg_sentiment_7d);

  const stats = [
    {
      label: "Members",
      value: data.member_count,
      icon: Users,
      sub: "active in group",
    },
    {
      label: "Messages This Week",
      value: data.weekly_messages,
      icon: MessageSquare,
      sub: `${data.total_messages} total`,
    },
    {
      label: "Avg Sentiment",
      value: data.avg_sentiment_7d !== null ? data.avg_sentiment_7d.toFixed(2) : "-",
      icon: TrendingUp,
      sub: sent.label,
      subColor: sent.color,
    },
    {
      label: "Status",
      value: data.is_active ? "Active" : "Inactive",
      icon: Activity,
      sub: data.subscription?.status ?? "no subscription",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Telegram ID: {data.telegram_group_id}
          {data.subscription?.current_period_end && (
            <>
              {" "}
              . Renews{" "}
              {new Date(data.subscription.current_period_end).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className={`text-xs mt-0.5 ${s.subColor ?? "text-muted-foreground"}`}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 text-sm">
            <Badge
              variant={data.subscription.status === "active" ? "default" : "outline"}
              className="capitalize"
            >
              {data.subscription.status}
            </Badge>
            {data.subscription.provider && (
              <span className="capitalize text-muted-foreground">{data.subscription.provider}</span>
            )}
            {data.subscription.current_period_end && (
              <span className="text-muted-foreground">
                Renews {new Date(data.subscription.current_period_end).toLocaleDateString()}
              </span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupOverviewPage;
