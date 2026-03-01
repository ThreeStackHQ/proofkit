export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db, subscriptions, eq } from "@proofkit/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as "pro" | "business";
    if (userId && tier) {
      await db
        .insert(subscriptions)
        .values({
          userId,
          tier,
          status: "active",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            tier,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: new Date(),
          },
        });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    await db
      .update(subscriptions)
      .set({
        status: sub.status as "active" | "canceled" | "past_due" | "trialing",
        stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, sub.id));
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await db
      .update(subscriptions)
      .set({ tier: "free", status: "canceled", updatedAt: new Date() })
      .where(eq(subscriptions.stripeSubscriptionId, sub.id));
  }

  return NextResponse.json({ received: true });
}
