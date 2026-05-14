"use server";

import { auth } from "@clerk/nextjs/server";
import { getEvaluationsPage, type EvaluationsPage } from "@/lib/db/dashboard";

/**
 * Server action invoked by the "Visa fler" button on the evaluations list.
 * Returns the next page of evaluations for the authenticated user.
 */
export async function loadMoreEvaluations(cursor: string | null): Promise<EvaluationsPage> {
  const { userId } = await auth();
  if (!userId) {
    return { evaluations: [], nextCursor: null };
  }
  return getEvaluationsPage(userId, cursor);
}
