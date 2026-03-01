export default function EventsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Events</h1>
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800 flex gap-2">
          {["All", "signup", "purchase", "pageview", "custom"].map((type) => (
            <button
              key={type}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-800 text-gray-300 hover:text-white transition capitalize"
            >
              {type}
            </button>
          ))}
        </div>
        <div className="p-6 text-center text-gray-400">
          <div className="text-4xl mb-3">⚡</div>
          <p className="text-sm">No events yet. Start ingesting events via the API.</p>
          <code className="mt-3 block text-xs bg-gray-800 rounded-lg p-3 text-left text-green-400">
            {`curl -X POST https://proofkit.threestack.io/api/ingest \\
  -H "X-API-Key: pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"type":"signup","personName":"Alice","personLocation":"NYC"}'`}
          </code>
        </div>
      </div>
    </div>
  );
}
