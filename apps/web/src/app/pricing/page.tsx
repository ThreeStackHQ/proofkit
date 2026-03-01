"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  badge?: string;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Perfect for side projects and testing",
    features: [
      "1 campaign",
      "1,000 events / month",
      "Basic analytics",
      "All widget positions",
      "Community support",
    ],
    cta: "Start for free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: 5,
    annualPrice: 4,
    description: "For growing indie products",
    features: [
      "Unlimited campaigns",
      "50,000 events / month",
      "Full analytics dashboard",
      "All widget positions & themes",
      "API access",
      "Email support",
    ],
    cta: "Start Pro →",
    href: "/signup?plan=pro",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Business",
    monthlyPrice: 19,
    annualPrice: 15,
    description: "For teams with higher volume",
    features: [
      "Everything in Pro",
      "500,000 events / month",
      "Priority support",
      "Custom domain widget",
      "SLA guarantee",
      "Team members (3 seats)",
    ],
    cta: "Start Business",
    href: "/signup?plan=business",
    highlighted: false,
  },
];

const FAQ = [
  {
    q: "What counts as an event?",
    a: "An event is any action you track via the ProofKit API — signups, purchases, pageviews, or custom events. Each API call that ingests a new event counts toward your monthly limit.",
  },
  {
    q: "How do I install the widget?",
    a: "It's one script tag. After signing up, copy your site's script snippet from the Campaigns page and paste it into your website's <head> or before </body>. Works on any website or framework.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, absolutely. Cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period.",
  },
  {
    q: "What happens if I hit my event limit?",
    a: "We'll notify you when you're approaching 80% of your limit. Once you hit the limit, new events won't be ingested until the next billing cycle (or you upgrade). Existing campaigns will continue to display historical events.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14-day money-back guarantee on paid plans. If ProofKit doesn't work for you, just email us and we'll refund you in full — no questions asked.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0f1117]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="text-lg font-bold text-green-400">ProofKit</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Start Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 px-6 text-center bg-[#0f1117]">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
          Simple, indie-friendly pricing
        </h1>
        <p className="text-gray-400 text-lg mb-10">Start free. Upgrade when you grow. No surprises.</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setAnnual(false)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition",
              !annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition",
              annual ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white"
            )}
          >
            Annual
            <span className="ml-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">-20%</span>
          </button>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16 px-6 bg-[#0f1117]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "bg-gray-900 rounded-2xl p-8 border flex flex-col",
                tier.highlighted
                  ? "border-green-500 ring-2 ring-green-500 ring-offset-2 ring-offset-[#0f1117]"
                  : "border-gray-800"
              )}
            >
              {tier.badge && (
                <div className="inline-block bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-4 self-start">
                  {tier.badge}
                </div>
              )}
              <h2 className="text-xl font-bold text-white mb-1">{tier.name}</h2>
              <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">
                    ${annual ? tier.annualPrice : tier.monthlyPrice}
                  </span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>
                {annual && tier.monthlyPrice > 0 && (
                  <p className="text-xs text-green-400 mt-1">Billed ${tier.annualPrice * 12}/yr</p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={cn(
                  "w-full text-center py-3 rounded-xl text-sm font-semibold transition",
                  tier.highlighted
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                )}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-medium text-gray-800">{item.q}</span>
                  <span className="text-gray-400 flex-shrink-0 text-lg leading-none">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#0f1117] py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start converting?</h2>
          <p className="text-gray-400 mb-8 text-sm">No credit card needed. Start with the free plan.</p>
          <Link
            href="/signup"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-xl transition"
          >
            Get started for free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1117] border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span className="text-sm font-semibold text-green-400">ProofKit</span>
            <span className="text-xs text-gray-600">— by ThreeStack</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition">Home</Link>
            <Link href="/pricing" className="hover:text-gray-300 transition">Pricing</Link>
            <Link href="/login" className="hover:text-gray-300 transition">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
