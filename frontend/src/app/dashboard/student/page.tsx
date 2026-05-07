"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    fetch("http://127.0.0.1:8000/api/v1/dashboard/student/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setStats(data));

    fetch("http://127.0.0.1:8000/api/v1/sessions/", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      const active = data.filter((s: any) => 
        ["pending", "provisioning", "ready"].includes(s.status)
      );
      setActiveSessions(active);
    });
  }, []);

  if (!stats) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Enrolled Courses</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.enrolled_courses}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress Labs</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">{stats.in_progress_labs}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Labs</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600 dark:text-green-400">{stats.completed_labs}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</h3>
          <p className="mt-2 text-3xl font-semibold text-purple-600 dark:text-purple-400">{stats.recent_score}%</p>
        </div>
      </div>

      {activeSessions.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
            <span className="flex h-3 w-3 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
            Active Lab Sessions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-indigo-100 dark:border-indigo-900">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Lab #{session.lab_id}</h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase">{session.status}</span>
                </div>
                <div className="mt-4">
                  <Link 
                    href={`/dashboard/student/labs/${session.lab_id}/session`}
                    className="block w-full text-center py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
                  >
                    Resume Lab
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Courses</h3>
        </div>
        <div className="p-6">
          <Link href="/dashboard/student/courses/1" className="block w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border rounded-md transition-colors">
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">DevOps Foundations</h4>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Learn the basics of DevOps, CI/CD, and Containers.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
