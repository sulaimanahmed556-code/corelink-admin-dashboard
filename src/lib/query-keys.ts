import type { AdminRole, PaymentProvider, SubscriptionStatus } from "@/services";

export const queryKeys = {
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  plans: {
    all: ["plans"] as const,
    list: (activeOnly = false) => ["plans", "list", { activeOnly }] as const,
    features: ["plans", "features"] as const,
  },
  subscriptions: {
    all: ["subscriptions"] as const,
    list: ({
      statusFilter,
      providerFilter,
    }: {
      statusFilter?: SubscriptionStatus;
      providerFilter?: PaymentProvider;
    }) => ["subscriptions", "list", { statusFilter, providerFilter }] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    list: (role?: AdminRole) => ["accounts", "list", { role }] as const,
  },
  group: {
    overview: (groupId: string) => ["group", groupId, "overview"] as const,
    members: (groupId: string, days = 30) => ["group", groupId, "members", days] as const,
    memberInteractions: (groupId: string, userId: string, days = 14) =>
      ["group", groupId, "member", userId, "interactions", days] as const,
    weeklySummary: (groupId: string) => ["group", groupId, "weekly-summary"] as const,
    customAgenda: (groupId: string, weekStart: string) =>
      ["group", groupId, "custom-agenda", weekStart] as const,
    analytics: (groupId: string, days = 30) => ["group", groupId, "analytics", days] as const,
  },
} as const;
