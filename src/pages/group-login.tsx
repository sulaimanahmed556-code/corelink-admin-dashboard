import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, AlertCircle } from "lucide-react";
import { accountsService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";

const GroupLogin = () => {
  const navigate = useNavigate();
  const { hasHydrated, token, user, setSession } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  if (hasHydrated && token && user) {
    if (user.role === "group_admin" && user.group_id) {
      return <Navigate to={`/group/${user.group_id}/overview`} replace />;
    }

    if (user.role === "super_admin") {
      return <Navigate to="/admin" replace />;
    }
  }

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const response = await accountsService.login(payload);

      if (response.admin.role !== "group_admin") {
        throw new Error("This account does not have group dashboard access.");
      }

      if (!response.admin.group_id) {
        throw new Error("No group is linked to this account.");
      }

      return response;
    },
    onSuccess: (response) => {
      setSession({
        token: response.access_token,
        user: response.admin,
        dashboard: "group",
      });

      navigate(`/group/${response.admin.group_id}/overview`, { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="p-2.5 bg-foreground text-background rounded-lg">
            <Bot className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">CoreLink</h1>
            <p className="text-xs text-muted-foreground">Group Dashboard</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in to your dashboard</CardTitle>
            <CardDescription>
              Use the credentials sent to you after your payment was confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              {loginMutation.error && (
                <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5">
                  <AlertCircle className="size-4 shrink-0" />
                  {loginMutation.error instanceof Error
                    ? loginMutation.error.message
                    : "Login failed"}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Admin?{" "}
          <a href="/admin/login" className="underline hover:text-foreground">
            Go to admin dashboard
          </a>
        </p>
      </div>
    </div>
  );
};

export default GroupLogin;
