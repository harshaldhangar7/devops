"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, Skeleton } from "@/components/ui/base";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function LabSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [session, setSession] = useState<any>(null);
  const [lab, setLab] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningChecks, setRunningChecks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingInterval = useRef<any>(null);

  // Terminal State
  const [terminalLogs, setTerminalLogs] = useState<any[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLogs]);

  const fetchSession = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/sessions/active/${params.labId}`, {
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
      const res = await fetch(`${API_URL}/labs/${params.labId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLab(data);
    } catch (err) {
      console.error("Error fetching lab:", err);
    }
  };

  const fetchSubmissions = async () => {
    const token = localStorage.getItem("token");
    if (!session?.id) return;
    try {
      const res = await fetch(`${API_URL}/submissions/session/${session.id}`, {
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
      await Promise.all([fetchLab(), fetchSession()]);
      setLoading(false);
    };
    init();
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [params.labId]);

  useEffect(() => {
    if (session?.id) {
      fetchSubmissions();
    }
  }, [session?.id]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommand.trim() || isExecuting || !session) return;

    const cmd = currentCommand;
    setCurrentCommand("");
    setIsExecuting(true);
    
    // Add user command to logs
    setTerminalLogs(prev => [...prev, { type: 'input', text: cmd }]);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/sessions/${session.id}/exec`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setTerminalLogs(prev => [...prev, { type: 'output', text: data.output }]);
    } catch (err) {
      setTerminalLogs(prev => [...prev, { type: 'error', text: "Failed to execute command." }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const runChecks = async () => {
    if (!session || runningChecks) return;
    setRunningChecks(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/submissions/session/${session.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to run checks");
      }
      const newSubmission = await res.json();
      setSubmissions([newSubmission, ...submissions]);
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
      const res = await fetch(`${API_URL}/sessions/${session.id}/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSession(data);
      setSubmissions([]);
      setTerminalLogs([]);
    } catch (err) {
      console.error("Error resetting session:", err);
    }
  };

  const stopSession = async () => {
    if (!session) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/sessions/${session.id}/stop`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push(`/dashboard/student/labs/${params.labId}`);
    } catch (err) {
      console.error("Error stopping session:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 h-screen flex flex-col p-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="flex-1 flex gap-6 overflow-hidden">
          <Skeleton className="w-1/3 h-full rounded-2xl" />
          <Skeleton className="flex-1 h-full rounded-2xl" />
          <Skeleton className="w-1/4 h-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!session) return <div className="p-8 text-center">No active session found.</div>;

  const isProvisioning = session.status === "pending" || session.status === "provisioning";
  const isReady = session.status === "ready";
  const isCompleted = session.status === "completed";

  // Get active version instructions
  const instructions = lab?.versions?.find((v: any) => v.is_active)?.instructions_markdown 
                    || lab?.versions?.[0]?.instructions_markdown 
                    || "No instructions available.";

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <Card className="flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200/50 dark:border-gray-800/50 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            LAB
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lab?.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                isReady ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                isProvisioning ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse" :
                isCompleted ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {isProvisioning && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-ping"></span>}
                {session.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={resetSession} disabled={isProvisioning || runningChecks}>
            Reset Lab
          </Button>
          <Button variant="danger" onClick={stopSession}>
            End Session
          </Button>
        </div>
      </Card>

      <div className="flex-1 flex gap-6 overflow-hidden pb-4">
        {/* Left Panel: Instructions */}
        <div className="w-1/3 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden border-gray-200/50 dark:border-gray-800/50">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Instructions</h3>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Lab Content</span>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="prose dark:prose-invert prose-sm max-w-none">
                {instructions.split('\n').map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Panel: Workspace & Terminal */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 bg-[#0d1117] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-800">
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-[#161b22] border-b border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-[#ff5f56] rounded-full shadow-lg"></div>
                  <div className="w-3 h-3 bg-[#ffbd2e] rounded-full shadow-lg"></div>
                  <div className="w-3 h-3 bg-[#27c93f] rounded-full shadow-lg"></div>
                </div>
                <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>
                <span className="text-[11px] text-gray-400 font-mono tracking-tight uppercase">Terminal — student@devops-guru</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isReady ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-600"}`}></div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm overflow-y-auto flex-1 custom-scrollbar bg-[#0d1117]">
              {isProvisioning ? (
                <div className="space-y-2 text-indigo-400/80">
                  <p className="flex items-center gap-2">
                    <span className="text-gray-600 font-bold">➜</span> 
                    <span>Initializing Docker Runtime Engine...</span>
                  </p>
                  <p className="pl-5 text-gray-500 animate-pulse">Pulling required images...</p>
                </div>
              ) : isReady ? (
                <div className="space-y-2">
                  <div className="text-green-500 opacity-80 mb-4 whitespace-pre-wrap font-bold">
{`***************************************************
* WELCOME TO DEVOPS GURU LABS v1.2.0           *
* Node: container-primary-01                   *
***************************************************`}
                  </div>
                  
                  {/* Previous Command History */}
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="space-y-1">
                      {log.type === 'input' && (
                        <div className="flex gap-2 text-gray-400">
                          <span className="text-indigo-500 font-bold">student@devops-guru:~$</span>
                          <span className="text-white">{log.text}</span>
                        </div>
                      )}
                      {log.type === 'output' && (
                        <div className="text-gray-300 whitespace-pre-wrap pl-2 border-l border-gray-800">{log.text || "(no output)"}</div>
                      )}
                      {log.type === 'error' && (
                        <div className="text-red-400 italic pl-2">{log.text}</div>
                      )}
                    </div>
                  ))}

                  {/* Current Prompt */}
                  {!isCompleted && (
                    <form onSubmit={handleCommandSubmit} className="flex gap-2 text-gray-400 items-center">
                      <span className="text-indigo-500 font-bold shrink-0">student@devops-guru:~$</span>
                      <input 
                        type="text"
                        autoFocus
                        value={currentCommand}
                        onChange={(e) => setCurrentCommand(e.target.value)}
                        disabled={isExecuting}
                        className="bg-transparent border-none outline-none text-white w-full p-0 font-mono focus:ring-0"
                        spellCheck={false}
                        autoComplete="off"
                      />
                      {isExecuting && <span className="w-2 h-4 bg-indigo-500 animate-pulse"></span>}
                    </form>
                  )}
                  
                  <div ref={terminalEndRef} />
                </div>
              ) : isCompleted ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <h4 className="text-xl font-bold text-purple-400 uppercase tracking-widest mb-2">Lab Completed</h4>
                  <p className="text-gray-500">You can now exit this session.</p>
                </div>
              ) : (
                <p className="text-red-400">Environment status: {session.status}</p>
              )}
            </div>
            
            {isReady && !isCompleted && (
              <div className="p-6 bg-[#161b22] border-t border-gray-800">
                <Button 
                  onClick={runChecks}
                  isLoading={runningChecks}
                  className="w-full py-4 text-base font-black tracking-widest uppercase shadow-xl"
                >
                  Run Automated Checks
                </Button>
                {error && <p className="mt-3 text-xs text-red-500 text-center font-bold">⚠️ {error}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Submissions */}
        <div className="w-1/4 flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 flex flex-col p-0 overflow-hidden border-gray-200/50 dark:border-gray-800/50">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Submissions</h3>
              <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {submissions.length} Attempts
              </span>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
              {submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-xs font-bold uppercase tracking-widest">No Submissions</p>
                </div>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Attempt #{sub.attempt_number}</span>
                      <span className={`text-xs font-black px-2 py-1 rounded-lg ${sub.passed ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                        {sub.score}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sub.results?.map((res: any) => (
                        <div key={res.id} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${res.status === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
                          <span className="text-[11px] text-gray-600 dark:text-gray-400 flex-1 truncate">{res.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
