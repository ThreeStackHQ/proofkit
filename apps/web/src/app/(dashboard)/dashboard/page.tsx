export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Events", value: "—", sub: "All time" },
          { label: "Events (30d)", value: "—", sub: "Last 30 days" },
          { label: "Events (7d)", value: "—", sub: "Last 7 days" },
          { label: "Impressions (30d)", value: "—", sub: "Widget views" },
        ].map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">{card.label}</div>
            <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-xs text-gray-500">{card.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Start</h2>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <span>Go to <strong>Settings</strong> to find your API key and Site ID</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <span>Create a <strong>Campaign</strong> to configure how your widget looks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <span>Ingest <strong>Events</strong> via the API using your API key</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <span>Add the <strong>Widget</strong> snippet to your site</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
