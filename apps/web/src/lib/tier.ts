import { db, subscriptions, eq } from "@proofkit/db";
import { PLANS } from "./stripe";

export async function getUserTier(userId: string): Promise<keyof typeof PLANS> {
  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  if (!sub || sub.tier === "free" || sub.status === "canceled") return "free";
  return sub.tier as keyof typeof PLANS;
}

export async function canCreateCampaign(userId: string, workspaceId: string): Promise<boolean> {
  const { campaigns, workspaces, eq: eqFn, count } = await import("@proofkit/db");
  const tier = await getUserTier(userId);
  const limit = PLANS[tier].maxCampaigns;
  if (limit === Infinity) return true;
  const [ws] = await db.select().from(workspaces).where(eqFn(workspaces.ownerId, userId)).limit(1);
  if (!ws) return false;
  const [{ total }] = await db.select({ total: count() }).from(campaigns).where(eqFn(campaigns.workspaceId, workspaceId));
  return Number(total) < limit;
}

export async function isWithinEventLimit(userId: string, currentMonthCount: number): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limit = PLANS[tier].eventsPerMonth;
  if (limit === Infinity) return true;
  return currentMonthCount < limit;
}
