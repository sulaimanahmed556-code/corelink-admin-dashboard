import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import {
  accountsService,
  type CreateAdminPayload,
  type CreateAdminResponse,
  type AdminRole,
} from "@/services";
import { queryKeys } from "@/lib/query-keys";

const EMPTY_FORM = {
  email: "",
  full_name: "",
  password: "",
  role: "super_admin" as AdminRole,
};

const CreateAccount = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState<CreateAdminResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const createAccountMutation = useMutation({
    mutationFn: (payload: CreateAdminPayload) => accountsService.createAccount(payload),
    onSuccess: (data) => {
      setResult(data);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    createAccountMutation.mutate({
      email: form.email,
      full_name: form.full_name || undefined,
      password: form.password || undefined,
      role: form.role,
    });
  };

  const copyPassword = (pw: string) => {
    navigator.clipboard.writeText(pw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Create Admin Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Super admin accounts are for full platform access. Group admin accounts
          are auto-created after a group completes payment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
            <CardDescription>Email is required. All other fields are optional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to auto-generate"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                If left blank, a secure password is generated and shown once.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as AdminRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">
                    Super Admin - full platform access
                  </SelectItem>
                  <SelectItem value="group_admin">
                    Group Admin - limited to one group
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {createAccountMutation.error && (
          <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5">
            <AlertCircle className="size-4 shrink-0" />
            {createAccountMutation.error instanceof Error
              ? createAccountMutation.error.message
              : "Failed to create account"}
          </div>
        )}

        {result && (
          <div className="border border-green-200 rounded-lg p-4 bg-green-50 space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <CheckCircle className="size-4" />
              Account created successfully
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono">{result.admin.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary" className="capitalize">
                  {result.admin.role.replace("_", " ")}
                </Badge>
              </div>
            </div>

            {result.generated_password && (
              <div className="rounded border bg-white p-3 space-y-1.5">
                <p className="text-xs font-medium text-amber-700">{result.notice}</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-sm break-all">
                    {result.generated_password}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => copyPassword(result.generated_password!)}
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={createAccountMutation.isPending}>
            {createAccountMutation.isPending && (
              <Loader2 className="size-4 mr-2 animate-spin" />
            )}
            {createAccountMutation.isPending ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccount;
