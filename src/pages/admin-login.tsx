import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { accountsService } from "@/services";
import { useAuthStore } from "@/stores/auth.store";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { hasHydrated, token, user, setSession } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  if (hasHydrated && token && user) {
    if (user.role === "super_admin") {
      return <Navigate to="/admin" replace />;
    }

    if (user.group_id) {
      return <Navigate to={`/group/${user.group_id}/overview`} replace />;
    }
  }

  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const response = await accountsService.login(payload);
      if (response.admin.role !== "super_admin") {
        throw new Error("This account does not have admin dashboard access.");
      }
      return response;
    },
    onSuccess: (response) => {
      setSession({
        token: response.access_token,
        user: response.admin,
        dashboard: "admin",
      });
      navigate("/admin", { replace: true });
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
          <div className="p-2.5 bg-blue-700 text-white rounded-lg">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">CoreLink</h1>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        </div>

        <Card className="text-cent">
          <CardHeader>
            <CardTitle className="text-base">Sign in to admin dashboard</CardTitle>
            <CardDescription>
              Use your super admin credentials to manage plans, subscriptions, and users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
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
                    : "Admin login failed"}
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
          Group owner?{" "}
          <a href="/login" className="underline hover:text-foreground">
            Go to group login
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
