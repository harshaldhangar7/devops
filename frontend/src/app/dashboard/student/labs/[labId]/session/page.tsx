"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LabSessionPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [lab, setLab] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingInterval = useRef<any>(null);

  const fetchSession = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/sessions/active/${params.labId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 404) {
        router.push(`/dashboard/student/labs/${params.labId}`);
        return;
      }
      const data = await res.json();
      setSession(data);
      
      if (data && (data.status === "pending" || data.status === "provisioning")) {
        if (!pollingInterval.current) {
          pollingInterval.current = setInterval(fetchSession, 3000);
        }
      } else {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      }
    } catch (err) {
      console.error("Error fetching session:", err);
    }
  };

  const fetchLab = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/labs/${params.labId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLab(data);
    } catch (err) {
      console.error("Error fetching lab:", err);
    }
  };

  const fetchSubmissions = async () => {
    if (!session) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/submissions/session/${session.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLab();
      await fetchSession();
      setLoading(false);
    };
    init();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [params.labId]);

  useEffect(() => {
    if (session) {
      fetchSubmissions();
    }
  }, [session?.id]);

  const runChecks = async () => {
    if (!session || runningChecks) return;
    setRunningChecks(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/submissions/session/${session.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to run checks");
      }
      const newSubmission = await res.json();
      setSubmissions([newSubmission, ...submissions]);
      // Refresh session state as it might have moved to 'completed'
      fetchSession();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunningChecks(false);
    }
  };

  const resetSession = async () => {
    if (!session) return;
    if (!confirm("Are you sure you want to reset the lab? All progress will be lost.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/sessions/${session.id}/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSession(data);
      setSubmissions([]);
    } catch (err) {
      console.error("Error resetting session:", err);
    }
  };

  const stopSession = async () => {
    if (!session) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/sessions/${session.id}/stop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/dashboard/student/labs/${params.labId}`);
    } catch (err) {
      console.error("Error stopping session:", err);
    }
  };

  if (loading) return <div className="p-8 text-center">Initializing lab environment...</div>;
  if (!session) return <div className="p-8 text-center">No active session found.</div>;

  const isProvisioning = session.status === "pending" || session.status === "provisioning";
  const isReady = session.status === "ready";
  const isCompleted = session.status === "completed";

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lab?.title}</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              isReady ? "bg-green-100 text-green-800" : 
              isProvisioning ? "bg-blue-100 text-blue-800 animate-pulse" :
              isCompleted ? "bg-purple-100 text-purple-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {session.status.toUpperCase()}
            </span>
            {session.expires_at && isReady && (
              <span className="text-xs text-gray-500">
                Expires at: {new Date(session.expires_at).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={resetSession}
            disabled={isProvisioning || runningChecks}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button 
            onClick={stopSession}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Stop Lab
          </button>
        </div>
      </div>

      <div className="flex-1 flex space-x-4 overflow-hidden">
        {/* Left Panel: Instructions */}
        <div className="w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Instructions</h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1 prose dark:prose-invert max-w-none">
            {lab?.versions?.[0]?.instructions_markdown || "No instructions available."}
          </div>
        </div>

        {/* Middle Panel: Workspace & Terminal */}
        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Mock Workspace Panel */}
          <div className="flex-1 bg-gray-900 rounded-lg shadow-inner flex flex-col overflow-hidden border border-gray-700">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-400 font-mono ml-2">student@devops-lab:~$</span>
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {session.workspace_url || "Provisioning environment..."}
              </div>
            </div>
            <div className="p-4 font-mono text-sm text-green-400 overflow-y-auto flex-1">
              {isProvisioning ? (
                <div className="space-y-1">
                  <p>Starting container runtime...</p>
                  <p className="opacity-70">Pulling images...</p>
                  <p className="opacity-50">Configuring networking...</p>
                </div>
              ) : isReady ? (
                <div className="space-y-2">
                  <p>Welcome to the DevOps Lab Platform!</p>
                  <p>Your environment is ready. Follow the instructions on the left to complete the lab.</p>
                  <p className="text-gray-500 mt-4">$ _</p>
                  <div className="mt-8 p-3 bg-gray-800 border border-gray-700 rounded text-gray-300">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Mock Command Hints</p>
                    <ul className="text-xs list-disc list-inside space-y-1">
                      <li>Use 'run checks' button below to submit your work.</li>
                      <li>Environment: Ubuntu 22.04 LTS</li>
                      <li>Installed: git, docker, kubectl, terraform</li>
                    </ul>
                  </div>
                </div>
              ) : isCompleted ? (
                <div className="text-purple-400">
                  <p>Lab completed successfully!</p>
                  <p>You can view your results in the submissions panel.</p>
                </div>
              ) : (
                <p className="text-red-400">Environment status: {session.status}</p>
              )}
            </div>
            
            {isReady && (
              <div className="p-4 bg-gray-800 border-t border-gray-700">
                <button 
                  onClick={runChecks}
                  disabled={runningChecks}
                  className="w-full py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
                >
                  {runningChecks ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running Checker...
                    </>
                  ) : "RUN CHECKS"}
                </button>
                {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Submissions */}
        <div className="w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Submissions</h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {submissions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-4">No submissions yet.</p>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">ATTEMPT #{sub.attempt_number}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${sub.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {sub.score}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sub.results?.map((res: any) => (
                      <div key={res.id} className="flex items-center text-xs">
                        {res.status === "success" ? (
                          <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        ) : (
                          <svg className="w-3 h-3 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                        )}
                        <span className="flex-1 truncate">{res.title}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-gray-500">{new Date(sub.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
