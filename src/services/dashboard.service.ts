import apiClient from "@/lib/axios";
import type { DashboardStats } from "./types";

export const dashboardService = {
  /** Fetch platform-wide stats for the dashboard overview */
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>("/admin/stats");
    return data;
  },
};
