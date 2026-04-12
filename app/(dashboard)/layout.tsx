import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/user";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Diagnostika",
    default: "Dashboard | Diagnostika",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateUser();

  if (!user) {
    redirect("/sign-in");
  }

  const sidebarUser = {
    name: user.full_name ?? user.email,
    email: user.email,
    avatarUrl: user.avatar_url,
    plan: user.plan,
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={sidebarUser} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}