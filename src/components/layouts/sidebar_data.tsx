import { CreditCard, Users, LayoutDashboard } from "lucide-react";

export const SIDEBAR_DATA = [
  {
    sectionName: "Overview",
    sectionIcon: LayoutDashboard,
    routes: [
      { name: "Dashboard", path: "/admin" },
    ],
  },
  {
    sectionName: "Plans & Subscriptions",
    sectionIcon: CreditCard,
    routes: [
      { name: "Create Plan", path: "/admin/add-a-plan" },
      { name: "View Plans", path: "/admin/view-plans" },
      { name: "Subscriptions", path: "/admin/view-subscriptions" },
    ],
  },
  {
    sectionName: "User Management",
    sectionIcon: Users,
    routes: [
      { name: "Admin Accounts", path: "/admin/admin-accounts" },
      { name: "Create Account", path: "/admin/create-account" },
    ],
  },
];
