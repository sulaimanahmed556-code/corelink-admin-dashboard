import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { groupDashboardService, type WeeklySummary } from "@/services/group-dashboard.service";
import { queryKeys } from "@/lib/query-keys";

const WeeklySummaryPage = () => {
  const { groupId } = useParams<{ groupId: string }>();

  const {
    data,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery<WeeklySummary>({
    queryKey: queryKeys.group.weeklySummary(groupId ?? ""),
    queryFn: () => groupDashboardService.getWeeklySummary(groupId!),
    enabled: Boolean(groupId),
  });

  if (!groupId) {
    return <div className="p-6 text-sm text-destructive">Missing group ID</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">AI Weekly Summary</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generated from the past 7 days of group activity
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </div>

      {isPending && (
        <div className="flex items-center gap-3 text-muted-foreground text-sm py-8">
          <Loader2 className="size-5 animate-spin" />
          <div>
            <p>Analysing group conversations...</p>
            <p className="text-xs mt-0.5">This may take a moment while AI processes messages</p>
          </div>
        </div>
      )}

      {error && (
        <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load weekly summary"}
        </div>
      )}

      {!isPending && data && (
        <>
          <div className="flex items-center gap-4 text-sm text-muted-foreground border rounded-lg px-4 py-3 bg-muted/30">
            <span>
              <strong className="text-foreground">{data.message_count}</strong> messages analysed
            </span>
            <span className="text-border">.</span>
            <span>
              Period:{" "}
              <strong className="text-foreground capitalize">{data.period.replace(/_/g, " ")}</strong>
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.message_count === 0 ? (
                <p className="text-sm text-muted-foreground">No messages found for this period.</p>
              ) : (
                <p className="text-sm leading-relaxed">{data.summary}</p>
              )}
            </CardContent>
          </Card>

          {data.topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Main Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.topics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {data.agenda && (
            <div className="grid md:grid-cols-2 gap-4">
              {data.agenda.highlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="size-4 text-amber-500" />
                      Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.agenda.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1 size-1.5 rounded-full bg-amber-400 shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {data.agenda.action_items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600" />
                      Action Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {data.agenda.action_items.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="mt-1 size-1.5 rounded-full bg-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {data.agenda?.engagement_notes && (
            <p className="text-xs text-muted-foreground border-t pt-4 italic">
              {data.agenda.engagement_notes}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default WeeklySummaryPage;
