// ─── Plans ───────────────────────────────────────────────────────────────────

export interface Feature {
  key: string;
  label: string;
  description: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  interval: string;
  interval_count: number;
  features: string[];
  stripe_plan_id: string | null;
  paypal_plan_id: string | null;
  paystack_plan_code: string | null;
  is_active: boolean;
  provider_status: {
    stripe: boolean;
    paystack: boolean;
    paypal: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface PlanListResponse {
  total: number;
  plans: Plan[];
}

export interface CreatePlanPayload {
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: string;
  interval_count: number;
  features: string[];
  is_active?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  features?: string[];
  is_active?: boolean;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "inactive" | "canceled" | "past_due";
export type PaymentProvider = "stripe" | "paystack" | "paypal";

export interface Subscription {
  id: string;
  group_id: string;
  group_name: string | null;
  telegram_group_id: string | null;
  plan_id: string | null;
  plan_name: string | null;
  plan_price: string | null;
  plan_currency: string | null;
  provider: PaymentProvider;
  status: SubscriptionStatus;
  provider_subscription_id: string | null;
  subscriber_email: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionListResponse {
  total: number;
  limit: number;
  offset: number;
  subscriptions: Subscription[];
}

// ─── Admin Accounts ──────────────────────────────────────────────────────────

export type AdminRole = "super_admin" | "group_admin";

export interface AdminAccount {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  group_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminListResponse {
  total: number;
  admins: AdminAccount[];
}

export interface CreateAdminPayload {
  email: string;
  full_name?: string;
  password?: string;
  role: AdminRole;
}

export interface CreateAdminResponse {
  status: string;
  admin: AdminAccount;
  generated_password?: string;
  notice?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  admin: AdminAccount;
}

export interface ToggleActiveResponse {
  status: string;
  admin_id: string;
  is_active: boolean;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  total_plans: number;
  active_plans: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_groups: number;
  active_groups: number;
  total_admin_accounts: number;
}
