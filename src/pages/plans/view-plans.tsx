import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router";
import { plansService, type PlanListResponse } from "@/services";
import { queryKeys } from "@/lib/query-keys";

const ProviderStatus = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className="flex items-center gap-1 text-xs text-muted-foreground">
    {ok ? (
      <CheckCircle className="size-3 text-green-600" />
    ) : (
      <XCircle className="size-3 text-muted-foreground/40" />
    )}
    {label}
  </span>
);

const ViewPlans = () => {
  const queryClient = useQueryClient();

  const {
    data,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery<PlanListResponse>({
    queryKey: queryKeys.plans.list(false),
    queryFn: () => plansService.listPlans({ active_only: false }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => plansService.deactivatePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });

  const plans = data?.plans ?? [];
  const total = data?.total ?? 0;

  const handleDeactivate = (id: string) => {
    if (!confirm("Deactivate this plan? Existing subscriptions will not be affected.")) {
      return;
    }

    deactivateMutation.mutate(id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isPending ? "Loading..." : `${total} plan${total !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`size-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/add-a-plan">
              <Plus className="size-4 mr-1" />
              New Plan
            </Link>
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading plans...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5 mb-4">
          <AlertCircle className="size-4 shrink-0" />
          {error instanceof Error ? error.message : "Failed to load plans"}
        </div>
      )}

      {deactivateMutation.error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5 mb-4">
          <AlertCircle className="size-4 shrink-0" />
          {deactivateMutation.error instanceof Error
            ? deactivateMutation.error.message
            : "Failed to deactivate plan"}
        </div>
      )}

      {!isPending && !error && plans.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
          No plans yet. {" "}
          <Link to="/admin/add-a-plan" className="text-primary underline">
            Create your first plan
          </Link>
          .
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isDeactivating =
            deactivateMutation.isPending && deactivateMutation.variables === plan.id;

          return (
            <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{plan.name}</CardTitle>
                  <Badge variant={plan.is_active ? "default" : "outline"} className="shrink-0">
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {plan.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {plan.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {plan.currency} {parseFloat(plan.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">/{plan.interval}</span>
                </div>

                {plan.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs capitalize">
                        {f.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-2 border-t">
                  <ProviderStatus ok={plan.provider_status.stripe} label="Stripe" />
                  <ProviderStatus ok={plan.provider_status.paystack} label="Paystack" />
                  <ProviderStatus ok={plan.provider_status.paypal} label="PayPal" />
                </div>

                {plan.is_active && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={isDeactivating}
                    onClick={() => handleDeactivate(plan.id)}
                  >
                    {isDeactivating && <Loader2 className="size-3.5 mr-1 animate-spin" />}
                    Deactivate
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ViewPlans;
