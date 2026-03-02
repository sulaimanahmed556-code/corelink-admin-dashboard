import { Navigate, Route, Routes } from "react-router";

import AdminLayout from "./components/layouts/admin_layout";
import GroupLayout from "./components/layouts/group_layout";

import Dashboard from "./pages/dashboard";
import AddAPlan from "./pages/plans/add-a-plan";
import ViewPlans from "./pages/plans/view-plans";
import ViewSubscriptions from "./pages/subscriptions/view-subscriptions";
import AdminAccounts from "./pages/users/admin-accounts";
import CreateAccount from "./pages/users/create-account";

import GroupOverviewPage from "./pages/group-dashboard/overview";
import MembersPage from "./pages/group-dashboard/members";
import MemberDetailPage from "./pages/group-dashboard/member-detail";
import AnalyticsPage from "./pages/group-dashboard/analytics";
import WeeklySummaryPage from "./pages/group-dashboard/weekly-summary";
import AgendaPage from "./pages/group-dashboard/agenda";
import TranscriptionPage from "./pages/group-dashboard/transcription";

import GroupLogin from "./pages/group-login";
import AdminLogin from "./pages/admin-login";
import SessionSync from "./components/auth/session-sync";

export function App() {
  return (
    <>
      <SessionSync />
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<GroupLogin />} />

        <Route path="/admin" Component={AdminLayout}>
          <Route index element={<Dashboard />} />
          <Route path="add-a-plan" element={<AddAPlan />} />
          <Route path="view-plans" element={<ViewPlans />} />
          <Route path="view-subscriptions" element={<ViewSubscriptions />} />
          <Route path="admin-accounts" element={<AdminAccounts />} />
          <Route path="create-account" element={<CreateAccount />} />
        </Route>

        <Route path="/group/:groupId" Component={GroupLayout}>
          <Route path="overview" element={<GroupOverviewPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="member/:userId" element={<MemberDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="weekly-summary" element={<WeeklySummaryPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="transcription" element={<TranscriptionPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </>
  );
}

export default App;
