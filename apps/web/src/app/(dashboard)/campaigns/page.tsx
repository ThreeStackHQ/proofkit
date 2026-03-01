export default function CampaignsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Campaigns</h1>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition text-sm">
          + New Campaign
        </button>
      </div>
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="p-6 text-center text-gray-400">
          <div className="text-4xl mb-3">📢</div>
          <p className="text-sm">No campaigns yet. Create your first campaign to start showing social proof.</p>
        </div>
      </div>
    </div>
  );
}
