import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import AddCandidate from "./AddCandidate";
import AnalyticsDashboard from "./AnalyticsDashboard";
import toast from "react-hot-toast";
export type Candidate = {
  id: string;
  full_name: string;
  applied_position: string;
  status: string;
  resume_url: string;
  created_at: string;
};

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCandidates() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setCandidates(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(candidateId: string, newStatus: string) {
    const toastId = toast.loading("Updating status...");

    try {
      const { error } = await supabase
        .from("candidates")
        .update({ status: newStatus })
        .eq("id", candidateId);

      if (error) throw error;

      toast.success("Status updated successfully!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  }

  useEffect(() => {
    fetchCandidates();
    const channel = supabase
      .channel("candidates_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        (payload) => {
          // console.log("Realtime event received!", payload);
          fetchCandidates();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="w-full space-y-8">
      <h2 className="text-3xl font-bold text-center">Candidate Dashboard</h2>
      <AddCandidate
        user={user}
        onCandidateAdded={() => {
          toast.success("Candidate added successfully!");
          fetchCandidates();
        }}
      />
      <AnalyticsDashboard />

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Candidate List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Full Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Applied Position
                </th>
                <th scope="col" className="px-6 py-3">
                  Date Applied
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Resume
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No candidates found. Add one to get started!
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="bg-gray-900 border-b border-gray-800 hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {candidate.full_name}
                    </td>
                    <td className="px-6 py-4">{candidate.applied_position}</td>
                    <td className="px-6 py-4">
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={candidate.status}
                        onChange={(e) =>
                          handleStatusChange(candidate.id, e.target.value)
                        }
                        className="bg-gray-800 text-white text-sm rounded-lg p-2 border border-gray-600 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="New">New</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-sky-500 hover:bg-sky-600 px-3 py-2 rounded text-sm font-bold text-white whitespace-nowrap"
                      >
                        View CV
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
