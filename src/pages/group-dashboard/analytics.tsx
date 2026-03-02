import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { groupDashboardService, type GroupAnalytics } from "@/services/group-dashboard.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/lib/query-keys";

const AnalyticsPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [days, setDays] = useState("30");

  const parsedDays = parseInt(days, 10);

  const {
    data,
    isPending,
    error,
  } = useQuery<GroupAnalytics>({
    queryKey: queryKeys.group.analytics(groupId ?? "", parsedDays),
    queryFn: () => groupDashboardService.getAnalytics(groupId!, parsedDays),
    enabled: Boolean(groupId),
  });

  if (!groupId) {
    return <div className="p-6 text-sm text-destructive">Missing group ID</div>;
  }

  const maxMsgs = Math.max(...(data?.daily_activity.map((d) => d.messages) ?? [1]), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Activity Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Message volume and sentiment over time</p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading analytics...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error instanceof Error ? error.message : "Failed to load analytics"}
        </div>
      )}

      {!isPending && data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Daily Message Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {data.daily_activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity in this period.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-end gap-0.5 h-40">
                    {data.daily_activity.map((d) => (
                      <div
                        key={d.date}
                        className="flex flex-col items-center gap-1 flex-1 min-w-0"
                        title={`${d.date}: ${d.messages} messages`}
                      >
                        <div
                          className="w-full bg-primary/70 rounded-t-sm"
                          style={{ height: `${(d.messages / maxMsgs) * 130}px` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-0.5">
                    {data.daily_activity.map((d) => (
                      <div key={d.date} className="flex-1 min-w-0 text-center">
                        <span className="text-[9px] text-muted-foreground">{d.date.slice(8)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Daily Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.daily_activity
                  .filter((d) => d.avg_sentiment !== null)
                  .map((d) => {
                    const sentiment = d.avg_sentiment!;
                    const pct = Math.round(((sentiment + 1) / 2) * 100);
                    const color =
                      sentiment > 0.2
                        ? "bg-green-500"
                        : sentiment < -0.2
                          ? "bg-red-500"
                          : "bg-yellow-400";

                    return (
                      <div key={d.date} className="flex items-center gap-3 text-xs">
                        <span className="w-16 text-muted-foreground shrink-0">{d.date.slice(5)}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right tabular-nums text-muted-foreground">
                          {sentiment.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Most Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.top_members.map((m, i) => (
                  <div key={m.username} className="flex items-center gap-3 text-sm">
                    <span className="w-5 text-xs text-muted-foreground">{i + 1}</span>
                    <span className="flex-1 font-medium">
                      {m.username.startsWith("@") ? m.username : `@${m.username}`}
                    </span>
                    <span className="text-muted-foreground tabular-nums">{m.message_count} msgs</span>
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full"
                        style={{
                          width: `${(m.message_count / (data.top_members[0]?.message_count || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
