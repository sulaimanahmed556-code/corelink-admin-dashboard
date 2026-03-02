import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Sparkles,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";
import {
  groupDashboardService,
  type CustomAgenda,
  type WeeklySummary,
} from "@/services/group-dashboard.service";
import { queryKeys } from "@/lib/query-keys";

const getWeekMonday = (offset = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 + offset * 7);
  return d.toISOString().slice(0, 10);
};

const AgendaPage = () => {
  const queryClient = useQueryClient();
  const { groupId } = useParams<{ groupId: string }>();
  const [weekStart] = useState(getWeekMonday());

  const [items, setItems] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const customAgendaQuery = useQuery<{ agenda: CustomAgenda | null }>({
    queryKey: queryKeys.group.customAgenda(groupId ?? "", weekStart),
    queryFn: () => groupDashboardService.getCustomAgenda(groupId!, weekStart),
    enabled: Boolean(groupId),
  });

  const aiSummaryQuery = useQuery<WeeklySummary>({
    queryKey: queryKeys.group.weeklySummary(groupId ?? ""),
    queryFn: () => groupDashboardService.getWeeklySummary(groupId!),
    enabled: Boolean(groupId),
  });

  useEffect(() => {
    const agenda = customAgendaQuery.data?.agenda;
    if (!agenda) return;

    setItems(agenda.items.length > 0 ? agenda.items : [""]);
    setNotes(agenda.notes ?? "");
  }, [customAgendaQuery.data?.agenda]);

  const saveAgendaMutation = useMutation({
    mutationFn: (payload: { week_start: string; items: string[]; notes?: string }) =>
      groupDashboardService.upsertCustomAgenda(groupId!, payload),
    onSuccess: (agenda) => {
      if (!groupId) return;

      queryClient.setQueryData(queryKeys.group.customAgenda(groupId, weekStart), {
        agenda,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (!groupId) {
    return <div className="p-6 text-sm text-destructive">Missing group ID</div>;
  }

  const addItem = () => setItems((prev) => [...prev, ""]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const updateItem = (index: number, value: string) =>
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));

  const handleSave = () => {
    setSaved(false);

    const filteredItems = items.filter((value) => value.trim());
    saveAgendaMutation.mutate({
      week_start: weekStart,
      items: filteredItems,
      notes: notes || undefined,
    });
  };

  const myAgenda = customAgendaQuery.data?.agenda ?? null;
  const aiSummary = aiSummaryQuery.data;

  const friendlyWeek = new Date(weekStart).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">My Weekly Agenda</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Week of {friendlyWeek} - set your goals and compare against what actually happened
          </p>
        </div>
      </div>

      {saveAgendaMutation.error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5">
          <AlertCircle className="size-4 shrink-0" />
          {saveAgendaMutation.error instanceof Error
            ? saveAgendaMutation.error.message
            : "Failed to save agenda"}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Planned Agenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Agenda Items</Label>
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateItem(i, e.target.value)}
                      placeholder={`Item ${i + 1}...`}
                      className="flex-1"
                    />
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(i)}
                        className="shrink-0"
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                  <Plus className="size-4 mr-1" /> Add item
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional context or goals for this week..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {customAgendaQuery.isPending ? (
                  <p className="text-xs text-muted-foreground">Loading existing agenda...</p>
                ) : myAgenda?.updated_at ? (
                  <p className="text-xs text-muted-foreground">
                    Last saved {new Date(myAgenda.updated_at).toLocaleDateString()}
                  </p>
                ) : (
                  <span />
                )}

                <Button
                  onClick={handleSave}
                  disabled={saveAgendaMutation.isPending}
                  className="ml-auto"
                >
                  {saveAgendaMutation.isPending ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="size-4 mr-2 text-green-500" />
                  ) : null}
                  {saved ? "Saved!" : saveAgendaMutation.isPending ? "Saving..." : "Save Agenda"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="size-4 text-muted-foreground" />
                What Actually Happened
                <Badge variant="outline" className="text-xs ml-auto">
                  AI Generated
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSummaryQuery.isPending ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                  <Loader2 className="size-4 animate-spin" /> Generating AI analysis...
                </div>
              ) : aiSummaryQuery.error ? (
                <p className="text-sm text-destructive py-4">
                  {aiSummaryQuery.error instanceof Error
                    ? aiSummaryQuery.error.message
                    : "Failed to load AI analysis"}
                </p>
              ) : !aiSummary || aiSummary.message_count === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No messages found for this week yet.
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{aiSummary.summary}</p>

                  {aiSummary.agenda?.action_items.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        AI Suggested Actions
                      </p>
                      <ul className="space-y-1.5">
                        {aiSummary.agenda.action_items.map((action, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSummary.topics.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        Topics Discussed
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiSummary.topics.map((topic, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {myAgenda && aiSummary && aiSummary.message_count > 0 && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowLeftRight className="size-4 text-muted-foreground" />
                  Agenda vs Reality
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Your Plan ({myAgenda.items.length} items)
                  </p>
                  <ul className="space-y-1">
                    {myAgenda.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                        <span className="mt-1.5 size-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    What Happened ({aiSummary.topics.length} topics)
                  </p>
                  <ul className="space-y-1">
                    {aiSummary.topics.slice(0, myAgenda.items.length).map((topic, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                        <span className="mt-1.5 size-1.5 rounded-full bg-primary/60 shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;
