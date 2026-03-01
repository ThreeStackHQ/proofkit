export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      <div className="space-y-6 max-w-2xl">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">API Key</h2>
          <p className="text-sm text-gray-400 mb-3">
            Use this key to ingest events via the API. Keep it secret.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value="pk_live_••••••••••••••••"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono"
            />
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition">
              Show
            </button>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition">
              Regenerate
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Widget Snippet</h2>
          <p className="text-sm text-gray-400 mb-3">
            Add this snippet to your website to show social proof notifications.
          </p>
          <pre className="bg-gray-800 rounded-lg p-4 text-xs text-green-400 overflow-x-auto">
{`<script src="https://proofkit.threestack.io/api/widget.js"></script>
<script>
  ProofKit.init({ siteId: "your-site-id" });
</script>`}
          </pre>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Billing</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Free Plan</div>
              <div className="text-sm text-gray-400">1,000 events/month · 1 campaign</div>
            </div>
            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition">
              Upgrade to Pro — $5/mo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
