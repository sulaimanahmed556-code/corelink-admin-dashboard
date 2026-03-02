import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ChevronRight } from "lucide-react";
import {
  groupDashboardService,
  type MembersResponse,
} from "@/services/group-dashboard.service";
import { queryKeys } from "@/lib/query-keys";

const RiskBar = ({ score }: { score: number }) => {
  const pct = Math.round(score * 100);
  const color =
    score >= 0.65 ? "bg-red-500" : score >= 0.35 ? "bg-amber-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums w-8 text-right text-muted-foreground">{pct}%</span>
    </div>
  );
};

const LEVEL_BADGE: Record<string, "default" | "outline" | "destructive" | "secondary"> = {
  "High Risk": "destructive",
  "Medium Risk": "outline",
  "Low Risk": "secondary",
};

const MembersPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const {
    data,
    isPending,
    error,
  } = useQuery<MembersResponse>({
    queryKey: queryKeys.group.members(groupId ?? ""),
    queryFn: () => groupDashboardService.getMembers(groupId!),
    enabled: Boolean(groupId),
  });

  if (!groupId) {
    return <div className="p-6 text-sm text-destructive">Missing group ID</div>;
  }

  const members = data?.members ?? [];
  const total = data?.total_members ?? 0;
  const highRisk = members.filter((m) => m.risk_level === "High Risk").length;
  const medRisk = members.filter((m) => m.risk_level === "Medium Risk").length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total} member{total !== 1 ? "s" : ""} analysed
          {highRisk > 0 && (
            <span className="ml-2 text-red-500 font-medium">. {highRisk} high risk</span>
          )}
          {medRisk > 0 && (
            <span className="ml-2 text-amber-500 font-medium">. {medRisk} medium risk</span>
          )}
        </p>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" /> Analysing members...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {error instanceof Error ? error.message : "Failed to load members"}
        </div>
      )}

      {!isPending && !error && members.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
          No member analysis found for this group.
        </div>
      )}

      {!isPending && members.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Member", "Risk Level", "Risk Score", "Inactive (days)", "Msg/day", "Flags", ""].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr
                  key={m.user_id}
                  className={`border-b last:border-0 ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">
                    {m.username.startsWith("@") ? m.username : `@${m.username}`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={LEVEL_BADGE[m.risk_level] ?? "secondary"}>{m.risk_level}</Badge>
                  </td>
                  <td className="px-4 py-3 w-40">
                    <RiskBar score={m.risk_score} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{m.days_inactive}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">{m.frequency.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {m.behaviour_flags.map((f) => (
                        <Badge key={f} variant="outline" className="text-xs capitalize">
                          {f.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {m.behaviour_flags.length === 0 && (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/group/${groupId}/member/${m.user_id}`)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
