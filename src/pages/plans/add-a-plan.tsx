import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { plansService, type Feature, type Plan } from "@/services";
import { queryKeys } from "@/lib/query-keys";

const CURRENCIES = ["USD", "NGN", "EUR", "GBP"];
const INTERVALS = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
  { value: "week", label: "Weekly" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
  interval: "month",
  interval_count: "1",
  features: [] as string[],
};

const AddAPlan = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [createdPlan, setCreatedPlan] = useState<Plan | null>(null);

  const {
    data: features = [],
    isPending: isLoadingFeatures,
    error: featuresError,
  } = useQuery<Feature[]>({
    queryKey: queryKeys.plans.features,
    queryFn: () => plansService.getFeatures(),
  });

  const createPlanMutation = useMutation({
    mutationFn: plansService.createPlan,
    onSuccess: (plan) => {
      setCreatedPlan(plan);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });

  const toggleFeature = (key: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(key)
        ? prev.features.filter((f) => f !== key)
        : [...prev.features, key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedPlan(null);

    createPlanMutation.mutate({
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      currency: form.currency,
      interval: form.interval,
      interval_count: parseInt(form.interval_count, 10),
      features: form.features,
      is_active: true,
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Plans are automatically provisioned on Stripe, Paystack, and PayPal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g. Standard Plan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this plan offers..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="19.99"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm({ ...form, currency: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Billing Interval</Label>
                <Select
                  value={form.interval}
                  onValueChange={(v) => setForm({ ...form, interval: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Features</CardTitle>
            <CardDescription>
              Select which app features this plan unlocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isLoadingFeatures && (
                <p className="text-sm text-muted-foreground col-span-2">
                  Loading features...
                </p>
              )}

              {featuresError && (
                <p className="text-sm text-destructive col-span-2">
                  {featuresError instanceof Error
                    ? featuresError.message
                    : "Failed to load features"}
                </p>
              )}

              {features.map((feat) => {
                const selected = form.features.includes(feat.key);
                return (
                  <button
                    key={feat.key}
                    type="button"
                    onClick={() => toggleFeature(feat.key)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{feat.label}</span>
                      {selected && (
                        <CheckCircle className="size-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feat.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {form.features.map((k) => (
                  <Badge key={k} variant="secondary">
                    {k.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {createPlanMutation.error && (
          <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5">
            <AlertCircle className="size-4 shrink-0" />
            {createPlanMutation.error instanceof Error
              ? createPlanMutation.error.message
              : "Failed to create plan"}
          </div>
        )}

        {createdPlan && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50 space-y-2">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <CheckCircle className="size-4" />
              Plan "{createdPlan.name}" created successfully
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle
                  className={`size-3 ${createdPlan.provider_status.stripe ? "text-green-600" : "text-muted-foreground/40"}`}
                />
                Stripe {createdPlan.provider_status.stripe ? "OK" : "--"}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle
                  className={`size-3 ${createdPlan.provider_status.paystack ? "text-green-600" : "text-muted-foreground/40"}`}
                />
                Paystack {createdPlan.provider_status.paystack ? "OK" : "--"}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle
                  className={`size-3 ${createdPlan.provider_status.paypal ? "text-green-600" : "text-muted-foreground/40"}`}
                />
                PayPal {createdPlan.provider_status.paypal ? "OK" : "--"}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={createPlanMutation.isPending}>
            {createPlanMutation.isPending && (
              <Loader2 className="size-4 mr-2 animate-spin" />
            )}
            {createPlanMutation.isPending ? "Creating Plan..." : "Create Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddAPlan;
