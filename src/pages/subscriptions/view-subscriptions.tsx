import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  subscriptionsService,
  type SubscriptionStatus,
  type PaymentProvider,
  type SubscriptionListResponse,
} from "@/services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/lib/query-keys";

const STATUS_BADGE: Record<
  SubscriptionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  canceled: "destructive",
  past_due: "outline",
};

const fmtDate = (iso: string | null) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ViewSubscriptions = () => {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [providerFilter, setProviderFilter] = useState<PaymentProvider | "all">("all");

  const normalizedStatus = statusFilter === "all" ? undefined : statusFilter;
  const normalizedProvider = providerFilter === "all" ? undefined : providerFilter;

  const {
    data,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery<SubscriptionListResponse>({
    queryKey: queryKeys.subscriptions.list({
      statusFilter: normalizedStatus,
      providerFilter: normalizedProvider,
    }),
    queryFn: () =>
      subscriptionsService.listSubscriptions({
        status_filter: normalizedStatus,
        provider_filter: normalizedProvider,
        limit: 100,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => subscriptionsService.cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
    },
  });

  const subs = data?.subscriptions ?? [];
  const total = data?.total ?? 0;

  const handleCancel = (id: string) => {
    if (!confirm("Cancel this subscription? This action cannot be undone.")) {
      return;
    }

    cancelMutation.mutate(id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isPending ? "Loading..." : `${total} subscription${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SubscriptionStatus | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="past_due">Past due</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={providerFilter}
          onValueChange={(v) => setProviderFilter(v as PaymentProvider | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="paystack">Paystack</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading subscriptions...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5 mb-4">
          <AlertCircle className="size-4 shrink-0" />
          {error instanceof Error ? error.message : "Failed to load subscriptions"}
        </div>
      )}

      {cancelMutation.error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5 mb-4">
          <AlertCircle className="size-4 shrink-0" />
          {cancelMutation.error instanceof Error
            ? cancelMutation.error.message
            : "Failed to cancel subscription"}
        </div>
      )}

      {!isPending && !error && subs.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
          No subscriptions found.
        </div>
      )}

      {!isPending && subs.length > 0 && (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Group", "Plan", "Provider", "Status", "Subscriber", "Renewal", "Joined", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {subs.map((sub, i) => {
                const isCanceling =
                  cancelMutation.isPending && cancelMutation.variables === sub.id;

                return (
                  <tr
                    key={sub.id}
                    className={`border-b last:border-0 ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{sub.group_name || "-"}</div>
                      {sub.telegram_group_id && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {sub.telegram_group_id}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{sub.plan_name || "-"}</div>
                      {sub.plan_price && (
                        <div className="text-xs text-muted-foreground">
                          {sub.plan_currency} {parseFloat(sub.plan_price).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">{sub.provider}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={STATUS_BADGE[sub.status] ?? "secondary"}
                        className="capitalize"
                      >
                        {sub.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sub.subscriber_email || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {fmtDate(sub.current_period_end)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {fmtDate(sub.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {sub.status === "active" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isCanceling}
                          onClick={() => handleCancel(sub.id)}
                        >
                          {isCanceling && <Loader2 className="size-3.5 mr-1 animate-spin" />}
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewSubscriptions;
