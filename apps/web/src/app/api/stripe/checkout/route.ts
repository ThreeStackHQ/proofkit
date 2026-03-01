export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStripe, PLANS } from "@/lib/stripe";
import { db, users, eq } from "@proofkit/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tier } = await req.json();
  if (!tier || !["pro", "business"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const plan = PLANS[tier as "pro" | "business"];
  if (!plan.priceId) {
    return NextResponse.json({ error: "Price ID not configured" }, { status: 500 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  const stripe = getStripe();

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: { userId: session.user.id, tier },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
