import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getSessionWithMessages } from "@/lib/db/dashboard";
import { TopBar } from "@/components/dashboard/TopBar";
import { ChatComposer } from "@/components/dashboard/ChatComposer";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-1 flex-col">
        {/* Session info bar */}
        <div className="flex items-center gap-3 border-b px-4 py-2 lg:px-6">
          <Badge variant="outline" className="capitalize">
            {session.status === "active"
              ? "Pågående"
              : session.status === "submitted"
                ? "Inskickad"
                : "Utvärderad"}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {session.case_description}
          </p>
        </div>

        {/* Chat */}
        <ChatComposer
          sessionId={session.id}
          initialMessages={messages}
          sessionStatus={session.status}
        />
      </div>
    </>
  );
}
