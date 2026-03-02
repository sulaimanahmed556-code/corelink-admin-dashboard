import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  groupDashboardService,
  type MemberInteractions,
} from "@/services/group-dashboard.service";
import { queryKeys } from "@/lib/query-keys";

const SentimentIcon = ({ score }: { score: number | null }) => {
  if (score === null) return <Minus className="size-3 text-muted-foreground" />;
  if (score > 0.15) return <TrendingUp className="size-3 text-green-500" />;
  if (score < -0.15) return <TrendingDown className="size-3 text-red-500" />;
  return <Minus className="size-3 text-yellow-500" />;
};

const MemberDetailPage = () => {
  const { groupId, userId } = useParams<{ groupId: string; userId: string }>();

  const {
    data,
    isPending,
    error,
  } = useQuery<MemberInteractions>({
    queryKey: queryKeys.group.memberInteractions(groupId ?? "", userId ?? "", 14),
    queryFn: () => groupDashboardService.getMemberInteractions(groupId!, userId!, 14),
    enabled: Boolean(groupId && userId),
  });

  if (!groupId || !userId) {
    return <div className="p-6 text-sm text-destructive">Missing group or user ID</div>;
  }

  if (isPending) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="size-4 animate-spin" /> Loading interactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive text-sm">
        {error instanceof Error ? error.message : "Failed to load interactions"}
      </div>
    );
  }

  if (!data) return null;

  const days = Object.entries(data.daily_counts).sort(([a], [b]) => a.localeCompare(b));
  const maxDay = Math.max(...days.map(([, v]) => v), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Member Interactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.message_count} messages in the last {data.period_days} days
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Daily Message Volume</CardTitle>
        </CardHeader>
        <CardContent>
          {days.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity in this period.</p>
          ) : (
            <div className="flex items-end gap-1 h-24">
              {days.map(([day, count]) => (
                <div key={day} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div
                    className="w-full bg-primary/80 rounded-sm"
                    style={{ height: `${(count / maxDay) * 80}px` }}
                    title={`${day}: ${count} msgs`}
                  />
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                    {day.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Messages and Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.sentiment_timeline.length === 0 && (
              <p className="text-sm text-muted-foreground">No messages found.</p>
            )}
            {data.sentiment_timeline.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm border-b last:border-0 pb-2">
                <div className="flex items-center gap-1 shrink-0 w-24 text-xs text-muted-foreground pt-0.5">
                  <SentimentIcon score={item.score} />
                  {item.date.slice(11, 16)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-muted-foreground">{item.text_preview}</p>
                </div>
                {item.score !== null && (
                  <Badge
                    variant={
                      item.score > 0.15
                        ? "default"
                        : item.score < -0.15
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs shrink-0"
                  >
                    {item.score.toFixed(2)}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberDetailPage;
