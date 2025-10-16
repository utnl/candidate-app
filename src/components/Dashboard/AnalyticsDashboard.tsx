import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

interface AnalyticsData {
  totalCandidates: number;
  statusDistribution: { status: string; count: number; percentage: number }[];
  topPositions: { applied_position: string; count: number }[];
  newCandidatesInLast7Days: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const { data: functionData, error: functionError } =
          await supabase.functions.invoke("analytics");
        if (functionError) throw functionError;
        setData(functionData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading)
    return <div className="text-center p-4">Loading analytics...</div>;
  if (error)
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Analytics Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-3xl font-bold text-sky-400">
            {data.totalCandidates}
          </p>
          <p className="text-sm text-gray-400">Total Candidates</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-3xl font-bold text-green-400">
            {data.newCandidatesInLast7Days}
          </p>
          <p className="text-sm text-gray-400">New in Last 7 Days</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg col-span-2 md:col-span-1">
          <h4 className="font-bold mb-2 text-left">Top Positions</h4>
          <ul className="text-left text-sm space-y-1">
            {data.topPositions.map((p) => (
              <li key={p.applied_position} className="flex justify-between">
                <span>{p.applied_position}</span>
                <span className="font-bold">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg col-span-2 md:col-span-1">
          <h4 className="font-bold mb-2 text-left">Status Distribution</h4>
          <ul className="text-left text-sm space-y-1">
            {data.statusDistribution.map((s) => (
              <li key={s.status} className="flex justify-between">
                <span>{s.status}</span>
                <span className="font-bold">{s.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
