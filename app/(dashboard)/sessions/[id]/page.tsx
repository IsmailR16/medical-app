import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSessionWithMessages } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { ChatComposer } from "@/components/dashboard/ChatComposer";
import { SessionHeader } from "@/components/dashboard/SessionHeader";
import { ClinicalDataSidebar } from "@/components/dashboard/ClinicalDataSidebar";

export const metadata: Metadata = {
  title: "Session",
};

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id: sessionId } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const result = await getSessionWithMessages(sessionId, userId);
  if (!result) notFound();

  const { session, messages } = result;

  return (
    <>
      <TopBar title={session.case_title} />
      <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10">
        {/* Header with title, badges, and submit button */}
        <SessionHeader
          sessionId={session.id}
          title={session.case_title}
          specialty={session.case_specialty}
          status={session.status}
          description={session.case_description}
        />

        {/* 2-column layout: Chat (2/3) + Clinical Data (1/3) */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 min-w-0">
            <ChatComposer
              sessionId={session.id}
              initialMessages={messages}
              sessionStatus={session.status}
            />
          </div>

          {/* Clinical Data Sidebar */}
          <div className="space-y-4">
            <ClinicalDataSidebar sections={session.clinical_data} />
          </div>
        </div>
      </div>
    </>
  );
}
