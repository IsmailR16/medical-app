"use server";

import { auth } from "@clerk/nextjs/server";
import { getSessionsPage, type SessionsPage } from "@/lib/db/dashboard";

/**
 * Server action invoked by the "Load more" button on the sessions list.
 * Returns the next page of sessions for the authenticated user.
 */
export async function loadMoreSessions(cursor: string | null): Promise<SessionsPage> {
  const { userId } = await auth();
  if (!userId) {
    return { sessions: [], nextCursor: null };
  }
  return getSessionsPage(userId, cursor);
}
