"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Skeleton, Button } from "@/components/ui/base";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    Promise.all([
      fetch(`${API_URL}/dashboard/student/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_URL}/sessions/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ]).then(([statsData, sessionsData]) => {
      setStats(statsData);
      const active = Array.isArray(sessionsData) ? sessionsData.filter((s: any) => 
        ["pending", "provisioning", "ready"].includes(s.status)
      ) : [];
      setActiveSessions(active);
    }).catch(err => {
      console.error("Dashboard data fetch error:", err);
    }).finally(() => {
      setIsInitialLoading(false);
    });
  }, []);

  if (isInitialLoading) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>

        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Welcome back, {user?.full_name.split(' ')[0]}! 👋</h2>
        <p className="text-gray-500 dark:text-gray-400">Here's an overview of your DevOps journey so far.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</span>
          <span className="text-4xl font-bold text-gray-900 dark:text-white leading-none">{stats?.enrolled_courses || 0}</span>
        </Card>
        
        <Card className="flex flex-col gap-2 border-l-4 border-l-blue-500">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress Labs</span>
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 leading-none">{stats?.in_progress_labs || 0}</span>
        </Card>

        <Card className="flex flex-col gap-2 border-l-4 border-l-green-500">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Labs</span>
          <span className="text-4xl font-bold text-green-600 dark:text-green-400 leading-none">{stats?.completed_labs || 0}</span>
        </Card>

        <Card className="flex flex-col gap-2 border-l-4 border-l-purple-500">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</span>
          <span className="text-4xl font-bold text-purple-600 dark:text-purple-400 leading-none">{stats?.recent_score || 0}%</span>
        </Card>
      </div>

      {activeSessions.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-indigo-500 animate-pulse"></span>
            Active Lab Sessions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((session) => (
              <Card key={session.id} className="relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Lab #{session.lab_id}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Started {new Date(session.started_at).toLocaleTimeString()}</p>
                  </div>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded font-bold uppercase tracking-wider">
                    {session.status}
                  </span>
                </div>
                
                <Link href={`/dashboard/student/labs/${session.lab_id}/session`} className="block">
                  <Button className="w-full">Resume Lab</Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Courses</h3>
        <div className="grid grid-cols-1 gap-6">
          <Link href="/dashboard/student/courses/1" className="group">
            <Card className="group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">DevOps Foundations</h4>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                  Master the core principles of DevOps, including Infrastructure as Code, CI/CD pipelines, and modern container orchestration.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">12 Labs</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">8 Hours</span>
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">Beginner</span>
                </div>
              </div>
              <Button variant="secondary" className="md:w-auto w-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
                Continue Learning
              </Button>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
