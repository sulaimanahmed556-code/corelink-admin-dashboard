import apiClient from "@/lib/axios";
import type {
  AdminAccount,
  AdminListResponse,
  AdminRole,
  CreateAdminPayload,
  CreateAdminResponse,
  LoginPayload,
  LoginResponse,
  ToggleActiveResponse,
} from "./types";

const BASE = "/accounts";

export const accountsService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(`${BASE}/login`, payload);
    return data;
  },

  async getCurrentAccount(): Promise<AdminAccount> {
    const { data } = await apiClient.get<AdminAccount>(`${BASE}/me`);
    return data;
  },

  async createAccount(payload: CreateAdminPayload): Promise<CreateAdminResponse> {
    const { data } = await apiClient.post<CreateAdminResponse>(`${BASE}/create`, payload);
    return data;
  },

  async listAccounts(params?: {
    role?: AdminRole;
    limit?: number;
    offset?: number;
  }): Promise<AdminListResponse> {
    const { data } = await apiClient.get<AdminListResponse>(`${BASE}/`, { params });
    return data;
  },

  async getAccount(id: string): Promise<AdminAccount> {
    const { data } = await apiClient.get<AdminAccount>(`${BASE}/${id}`);
    return data;
  },

  async toggleActive(id: string): Promise<ToggleActiveResponse> {
    const { data } = await apiClient.patch<ToggleActiveResponse>(`${BASE}/${id}/toggle-active`);
    return data;
  },
};
