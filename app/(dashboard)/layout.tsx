import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/auth/user";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardShell, MainContent } from "@/components/dashboard/SidebarContext";

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
    <ClerkProvider>
      <DashboardShell>
        <AppSidebar user={sidebarUser} />
        <MainContent>
          {children}
        </MainContent>
      </DashboardShell>
    </ClerkProvider>
  );
}