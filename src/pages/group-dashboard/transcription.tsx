import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import { groupDashboardService, type WeeklySummary } from "@/services/group-dashboard.service";
import { queryKeys } from "@/lib/query-keys";

const TranscriptionPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    if (!data) return;
    const text = buildTranscriptText(data);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Conversation Transcription</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated narrative of your group's conversations this week
          </p>
        </div>
        <div className="flex gap-2">
          {data && (
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="size-4 mr-1.5 text-green-500" />
              ) : (
                <Copy className="size-4 mr-1.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-3 text-muted-foreground text-sm py-8">
          <Loader2 className="size-5 animate-spin" />
          <div>
            <p>Generating conversation transcript...</p>
            <p className="text-xs mt-0.5 opacity-70">AI is reading this week's messages</p>
          </div>
        </div>
      )}

      {error && (
        <div className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load transcript"}
        </div>
      )}

      {!isPending && data && data.message_count === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            No messages found for this week. Check back after your group has been active.
          </CardContent>
        </Card>
      )}

      {!isPending && data && data.message_count > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border rounded-lg px-4 py-3 bg-muted/30">
            <span>
              <strong className="text-foreground">{data.message_count}</strong> messages
            </span>
            <span className="text-border">.</span>
            <span>
              Group: <strong className="text-foreground">{data.group_name}</strong>
            </span>
            <span className="text-border">.</span>
            <span className="capitalize">{data.period.replace(/_/g, " ")}</span>
            <Badge variant="outline" className="ml-auto text-xs">
              AI Transcription
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Narrative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line">{data.summary}</p>
            </CardContent>
          </Card>

          {data.topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversation Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-3 border-b last:border-0 pb-3">
                      <span className="text-xs font-mono text-muted-foreground w-6 pt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{topic}</p>
                        {data.agenda?.highlights?.[i] && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {data.agenda.highlights[i]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(data.agenda?.action_items?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Outcomes and Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.agenda!.action_items.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2.5">
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
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

function buildTranscriptText(data: WeeklySummary): string {
  const lines: string[] = [
    "CORELINK - Weekly Transcript",
    `Group: ${data.group_name}`,
    `Period: ${data.period.replace(/_/g, " ")}`,
    `Messages analysed: ${data.message_count}`,
    "",
    "=== SUMMARY ===",
    data.summary,
    "",
  ];

  if (data.topics.length) {
    lines.push("=== TOPICS ===");
    data.topics.forEach((topic, i) => lines.push(`${i + 1}. ${topic}`));
    lines.push("");
  }

  if (data.agenda?.action_items?.length) {
    lines.push("=== NEXT STEPS ===");
    data.agenda.action_items.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join("\n");
}

export default TranscriptionPage;
