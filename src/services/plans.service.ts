import apiClient from "@/lib/axios";
import type {
  Feature,
  Plan,
  PlanListResponse,
  CreatePlanPayload,
  UpdatePlanPayload,
} from "./types";

const BASE = "/plans";

export const plansService = {
  /** Fetch all available feature definitions */
  async getFeatures(): Promise<Feature[]> {
    const { data } = await apiClient.get<{ features: Feature[] }>(`${BASE}/features`);
    return data.features;
  },

  /** List all plans (admin view — includes inactive) */
  async listPlans(params?: { active_only?: boolean; limit?: number; offset?: number }): Promise<PlanListResponse> {
    const { data } = await apiClient.get<PlanListResponse>(`${BASE}/`, { params });
    return data;
  },

  /** Get a single plan by ID */
  async getPlan(id: string): Promise<Plan> {
    const { data } = await apiClient.get<Plan>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new plan.
   * The backend auto-provisions it on Stripe, Paystack & PayPal.
   */
  async createPlan(payload: CreatePlanPayload): Promise<Plan> {
    const { data } = await apiClient.post<Plan>(`${BASE}/`, payload);
    return data;
  },

  /** Update plan metadata (name, description, features, active status) */
  async updatePlan(id: string, payload: UpdatePlanPayload): Promise<Plan> {
    const { data } = await apiClient.put<Plan>(`${BASE}/${id}`, payload);
    return data;
  },

  /** Soft-delete (deactivate) a plan */
  async deactivatePlan(id: string): Promise<{ status: string; plan_id: string }> {
    const { data } = await apiClient.delete<{ status: string; plan_id: string }>(`${BASE}/${id}`);
    return data;
  },
};
