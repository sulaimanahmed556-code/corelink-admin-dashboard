import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { Link } from "react-router";
import { accountsService, type AdminAccount, type AdminListResponse } from "@/services";
import { queryKeys } from "@/lib/query-keys";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const AdminAccounts = () => {
  const queryClient = useQueryClient();

  const {
    data,
    isPending,
    isFetching,
    error,
    refetch,
  } = useQuery<AdminListResponse>({
    queryKey: queryKeys.accounts.list(),
    queryFn: () => accountsService.listAccounts(),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => accountsService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });

  const admins = data?.admins ?? [];
  const total = data?.total ?? 0;

  const handleToggle = (admin: AdminAccount) => {
    const action = admin.is_active ? "deactivate" : "activate";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${admin.email}?`)) {
      return;
    }

    toggleMutation.mutate(admin.id);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isPending ? "Loading..." : `${total} account${total !== 1 ? "s" : ""}`}
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
            <Link to="/admin/create-account">
              <Plus className="size-4 mr-1" />
              Create Account
            </Link>
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" />
          Loading accounts...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5 mb-4">
          <AlertCircle className="size-4 shrink-0" />
          {error instanceof Error ? error.message : "Failed to load accounts"}
        </div>
      )}

      {toggleMutation.error && (
        <div className="flex items-center gap-2 text-sm text-destructive border border-destructive/20 rounded-lg p-3 bg-destructive/5 mb-4">
          <AlertCircle className="size-4 shrink-0" />
          {toggleMutation.error instanceof Error
            ? toggleMutation.error.message
            : "Failed to update account"}
        </div>
      )}

      {!isPending && !error && admins.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
          No admin accounts yet. {" "}
          <Link to="/admin/create-account" className="text-primary underline">
            Create one
          </Link>
          .
        </div>
      )}

      {!isPending && admins.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {["Name / Email", "Role", "Group", "Status", "Joined", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, i) => {
                const isToggling =
                  toggleMutation.isPending && toggleMutation.variables === admin.id;

                return (
                  <tr
                    key={admin.id}
                    className={`border-b last:border-0 ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{admin.full_name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{admin.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={admin.role === "super_admin" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {admin.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {admin.group_id ? (
                        <span className="font-mono text-xs">{admin.group_id.slice(0, 8)}...</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={admin.is_active ? "default" : "outline"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {fmtDate(admin.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isToggling}
                        onClick={() => handleToggle(admin)}
                      >
                        {isToggling ? (
                          <Loader2 className="size-3.5 mr-1 animate-spin" />
                        ) : admin.is_active ? (
                          <UserX className="size-3.5 mr-1" />
                        ) : (
                          <UserCheck className="size-3.5 mr-1" />
                        )}
                        {admin.is_active ? "Deactivate" : "Activate"}
                      </Button>
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

export default AdminAccounts;
