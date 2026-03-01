import Link from "next/link";

const FEATURES = [
  {
    icon: "⚡",
    title: "2-minute setup",
    description: "Copy one script tag, paste it in your site's <head>. Works on any website — no framework required.",
  },
  {
    icon: "🎯",
    title: "Smart display rules",
    description: "Control timing, position, and which event types trigger each widget. Full customization per campaign.",
  },
  {
    icon: "📊",
    title: "Conversion analytics",
    description: "Track impressions and sessions influenced. Know exactly which widgets are working.",
  },
];

const COMPARISON = [
  { feature: "Price", proofkit: "$5/mo", fomo: "$19/mo", proofkitWin: true },
  { feature: "Unlimited campaigns", proofkit: "✓", fomo: "Paid only", proofkitWin: true },
  { feature: "Custom positions", proofkit: "✓", fomo: "Limited", proofkitWin: true },
  { feature: "Full analytics", proofkit: "✓", fomo: "Paid only", proofkitWin: true },
  { feature: "API access", proofkit: "✓", fomo: "Paid only", proofkitWin: true },
  { feature: "Indie-friendly pricing", proofkit: "✓", fomo: "✗", proofkitWin: true },
];

const TESTIMONIALS = [
  {
    quote: "Added ProofKit to my SaaS in 5 minutes. First week I saw a 23% bump in trial signups.",
    name: "Alex M.",
    role: "Indie hacker, 3 SaaS products",
    avatar: "A",
  },
  {
    quote: "Fomo was $19/mo and I barely used it. ProofKit does everything I need for a fraction of the price.",
    name: "Sarah K.",
    role: "Founder at Pixelify",
    avatar: "S",
  },
  {
    quote: "The widget looks clean and my visitors love seeing real activity. Worth every penny.",
    name: "Tom R.",
    role: "Solo founder",
    avatar: "T",
  },
];

export default function LandingPage() {
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
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition">
              Pricing
            </Link>
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

      {/* Hero */}
      <section className="bg-[#0f1117] py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            🚀 Trusted by 500+ indie hackers
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Turn every signup into{" "}
            <span className="text-green-400">social proof</span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Real-time notification widgets that show your visitors what&apos;s happening — purchases, signups, reviews. Install in 2 minutes, start converting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-xl transition text-base"
            >
              Start Free →
            </Link>
            <Link
              href="/pricing"
              className="border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white font-medium px-8 py-3.5 rounded-xl transition text-base"
            >
              View Pricing
            </Link>
          </div>

          {/* Widget preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 w-72 h-44 flex items-end justify-start p-4">
                <div className="text-xs text-gray-600 absolute top-3 left-4">yoursite.com</div>
                {/* Floating notification */}
                <div className="bg-white rounded-xl shadow-xl p-3 flex items-start gap-3 max-w-[240px] animate-bounce-slow border border-gray-100">
                  <div className="text-xl flex-shrink-0">🎉</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Sarah from Austin</p>
                    <p className="text-xs text-gray-500">just upgraded to Pro · 1 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need, nothing you don&apos;t</h2>
            <p className="text-gray-500">Simple tools that actually convert your visitors.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why ProofKit over Fomo?</h2>
            <p className="text-gray-500">Same result, 74% less cost.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Feature</th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-base">⚡</span>
                      <span className="text-sm font-bold text-gray-900">ProofKit</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Fomo</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-3.5 text-sm text-gray-700">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={row.proofkitWin ? "text-green-600 font-semibold text-sm" : "text-gray-500 text-sm"}>
                        {row.proofkit}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center text-sm text-gray-400">{row.fomo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Loved by indie hackers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#0f1117] py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">Start free today</h2>
          <p className="text-gray-400 mb-8">No credit card needed. Upgrade when you grow.</p>
          <Link
            href="/signup"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-10 py-4 rounded-xl transition text-base"
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
            <Link href="/pricing" className="hover:text-gray-300 transition">Pricing</Link>
            <Link href="/login" className="hover:text-gray-300 transition">Login</Link>
            <Link href="/signup" className="hover:text-gray-300 transition">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
