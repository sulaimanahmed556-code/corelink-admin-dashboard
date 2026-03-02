import apiClient from "@/lib/axios";
import type {
  Subscription,
  SubscriptionListResponse,
  SubscriptionStatus,
  PaymentProvider,
} from "./types";

const BASE = "/subscriptions";

export const subscriptionsService = {
  /** List all subscriptions with optional filters */
  async listSubscriptions(params?: {
    status_filter?: SubscriptionStatus;
    provider_filter?: PaymentProvider;
    limit?: number;
    offset?: number;
  }): Promise<SubscriptionListResponse> {
    const { data } = await apiClient.get<SubscriptionListResponse>(`${BASE}/`, { params });
    return data;
  },

  /** Get a single subscription by ID */
  async getSubscription(id: string): Promise<Subscription> {
    const { data } = await apiClient.get<Subscription>(`${BASE}/${id}`);
    return data;
  },

  /** Cancel a subscription */
  async cancelSubscription(id: string): Promise<{ status: string; subscription_id: string }> {
    const { data } = await apiClient.post<{ status: string; subscription_id: string }>(
      `${BASE}/${id}/cancel`
    );
    return data;
  },
};
