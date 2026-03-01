import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return _stripe;
}

export const PLANS = {
  free: { name: "Free", price: 0, eventsPerMonth: 1000, maxCampaigns: 1 },
  pro: { name: "Pro", price: 500, eventsPerMonth: 50000, maxCampaigns: 10, priceId: process.env.STRIPE_PRO_PRICE_ID },
  business: {
    name: "Business",
    price: 1500,
    eventsPerMonth: Infinity,
    maxCampaigns: Infinity,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
  },
} as const;
