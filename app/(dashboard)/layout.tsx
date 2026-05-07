import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import NextTopLoader from "nextjs-toploader";
import { getOrCreateUser } from "@/lib/auth/user";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardShell, MainContent } from "@/components/dashboard/SidebarContext";
import ToastProvider from "@/components/ToastProvider";
import {
  TERMS_VERSION,
  PRIVACY_POLICY_VERSION,
} from "@/lib/legal/versions";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

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

  // Gate: must have accepted current versions of Terms + Privacy +
  // "no real patient data" before accessing the dashboard.
  const hasAcceptedAll =
    user.terms_accepted_at &&
    user.terms_version === TERMS_VERSION &&
    user.privacy_policy_accepted_at &&
    user.privacy_policy_version === PRIVACY_POLICY_VERSION &&
    user.no_real_patient_data_acknowledged_at;

  if (!hasAcceptedAll) {
    redirect("/accept-terms");
  }

  const sidebarUser = {
    name: user.full_name ?? user.email,
    email: user.email,
    avatarUrl: user.avatar_url,
    plan: user.plan,
  };

  return (
    <ClerkProvider>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
        }}
      />
      <NextTopLoader
        color="#457b9d"
        height={2.5}
        showSpinner={false}
        easing="ease"
        speed={250}
        shadow="0 0 10px #457b9d, 0 0 5px #457b9d"
      />
      <ToastProvider />
      <div className={jetbrains.variable}>
        <DashboardShell>
          <AppSidebar user={sidebarUser} />
          <MainContent>
            {children}
          </MainContent>
        </DashboardShell>
      </div>
    </ClerkProvider>
  );
}