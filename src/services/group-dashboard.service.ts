import apiClient from "@/lib/axios";

export interface GroupOverview {
  group_id: string;
  name: string;
  telegram_group_id: string;
  is_active: boolean;
  member_count: number;
  total_messages: number;
  weekly_messages: number;
  avg_sentiment_7d: number | null;
  subscription: {
    status: string;
    provider: string | null;
    plan_id: string | null;
    current_period_end: string | null;
  } | null;
}

export interface ChurnFactor {
  behaviour: number;
  inactivity: number;
  engagement: number;
  sentiment: number;
}

export interface MemberChurn {
  user_id: string;
  username: string;
  telegram_user_id: number;
  risk_score: number;
  risk_level: string;
  factors: ChurnFactor;
  behaviour_flags: string[];
  days_inactive: number;
  sentiment: number;
  frequency: number;
  explanation: string;
}

export interface MembersResponse {
  group_id: string;
  total_members: number;
  analysis_period_days: number;
  members: MemberChurn[];
}

export interface MemberInteractions {
  user_id: string;
  group_id: string;
  period_days: number;
  message_count: number;
  daily_counts: Record<string, number>;
  sentiment_timeline: Array<{
    date: string;
    score: number | null;
    text_preview: string;
  }>;
}

export interface WeeklySummary {
  group_id: string;
  group_name: string;
  period: string;
  message_count: number;
  summary: string;
  topics: string[];
  agenda: {
    summary: string;
    topics: string[];
    highlights: string[];
    action_items: string[];
    engagement_notes: string;
  };
}

export interface CustomAgenda {
  week_start: string;
  items: string[];
  notes: string | null;
  updated_at?: string;
}

export interface GroupAnalytics {
  group_id: string;
  period_days: number;
  daily_activity: Array<{
    date: string;
    messages: number;
    avg_sentiment: number | null;
  }>;
  top_members: Array<{
    username: string;
    message_count: number;
  }>;
}

const BASE = "/group";

export const groupDashboardService = {
  async getOverview(groupId: string): Promise<GroupOverview> {
    const { data } = await apiClient.get<GroupOverview>(`${BASE}/${groupId}/overview`);
    return data;
  },

  async getMembers(groupId: string, days = 30): Promise<MembersResponse> {
    const { data } = await apiClient.get<MembersResponse>(`${BASE}/${groupId}/members`, {
      params: { days },
    });
    return data;
  },

  async getMemberInteractions(groupId: string, userId: string, days = 7): Promise<MemberInteractions> {
    const { data } = await apiClient.get<MemberInteractions>(
      `${BASE}/${groupId}/member/${userId}/interactions`,
      { params: { days } }
    );
    return data;
  },

  async getWeeklySummary(groupId: string): Promise<WeeklySummary> {
    const { data } = await apiClient.get<WeeklySummary>(`${BASE}/${groupId}/weekly-summary`);
    return data;
  },

  async getCustomAgenda(groupId: string, weekStart?: string): Promise<{ agenda: CustomAgenda | null }> {
    const { data } = await apiClient.get(`${BASE}/${groupId}/custom-agenda`, {
      params: weekStart ? { week_start: weekStart } : {},
    });
    return data;
  },

  async upsertCustomAgenda(
    groupId: string,
    payload: { week_start: string; items: string[]; notes?: string }
  ): Promise<CustomAgenda> {
    const { data } = await apiClient.put<CustomAgenda>(`${BASE}/${groupId}/custom-agenda`, payload);
    return data;
  },

  async getAnalytics(groupId: string, days = 30): Promise<GroupAnalytics> {
    const { data } = await apiClient.get<GroupAnalytics>(`${BASE}/${groupId}/analytics`, {
      params: { days },
    });
    return data;
  },
};
