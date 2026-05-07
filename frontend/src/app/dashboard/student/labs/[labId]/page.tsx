"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lab, setLab] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Fetch lab details
    fetch(`http://127.0.0.1:8000/api/v1/labs/${params.labId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setLab(data));

    // Fetch active session
    fetch(`http://127.0.0.1:8000/api/v1/sessions/active/${params.labId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.ok) return res.json();
      return null;
    })
    .then(data => setActiveSession(data));

    // Fetch previous submissions
    fetch(`http://127.0.0.1:8000/api/v1/submissions/lab/${params.labId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setSubmissions(data || []));
  }, [params.labId]);

  const startLab = async () => {
    setStarting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/sessions/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ lab_id: parseInt(params.labId as string) })
      });
      const data = await res.json();
      router.push(`/dashboard/student/labs/${params.labId}/session`);
    } catch (err) {
      console.error("Error starting lab:", err);
      setStarting(false);
    }
  };

  if (!lab) return <div className="p-8 text-center">Loading lab details...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{lab.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-300">Difficulty: {lab.difficulty}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded dark:bg-green-900 dark:text-green-300">{lab.estimated_minutes} min</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded dark:bg-gray-700 dark:text-gray-300">Passing Score: {lab.passing_score}%</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded dark:bg-yellow-900 dark:text-yellow-300">Max Attempts: {lab.max_attempts}</span>
            </div>
          </div>
          
          {activeSession ? (
            <Link 
              href={`/dashboard/student/labs/${params.labId}/session`}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 focus:outline-none flex items-center"
            >
              Resume Lab Session
              <span className="ml-2 flex h-2 w-2 rounded-full bg-green-200 animate-ping"></span>
            </Link>
          ) : (
            <button 
              onClick={startLab}
              disabled={starting}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {starting ? "Starting..." : "Start Lab"}
            </button>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
          <p className="text-gray-600 dark:text-gray-300">{lab.description || "No description provided."}</p>
        </div>

        {lab.tags && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {lab.tags.split(',').map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-400">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Instructions Preview</h3>
          <div className="prose dark:prose-invert max-w-none text-sm">
            {lab.versions?.[0]?.instructions_markdown || "Full instructions will be available inside the workspace."}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Submissions</h3>
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No submissions yet. Start the lab to practice!</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Attempt #{sub.attempt_number}</span>
                    <p className="text-xs text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${sub.passed ? "text-green-600" : "text-red-600"}`}>
                      {sub.score}%
                    </span>
                    <p className="text-[10px] uppercase font-bold text-gray-400">{sub.passed ? "Passed" : "Failed"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
