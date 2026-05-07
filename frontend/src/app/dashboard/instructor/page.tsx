"use client";

import { useEffect, useState } from "react";
import { Card, Skeleton, Button } from "@/components/ui/base";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    Promise.all([
      fetch(`${API_URL}/dashboard/instructor/cohort-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_URL}/dashboard/instructor/recent-activity`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ]).then(([statsData, activityData]) => {
      setStats(statsData);
      setActivity(activityData);
    }).catch(err => {
      console.error("Dashboard fetch error:", err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-10">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Instructor Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Monitoring performance across all assigned cohorts.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cohorts</span>
          <span className="text-4xl font-bold text-gray-900 dark:text-white leading-none">{stats?.assigned_cohorts || 0}</span>
        </Card>
        
        <Card className="flex flex-col gap-2 border-l-4 border-l-blue-500">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</span>
          <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 leading-none">{stats?.total_students || 0}</span>
        </Card>

        <Card className="flex flex-col gap-2 border-l-4 border-l-purple-500">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Practice Score</span>
          <span className="text-4xl font-bold text-purple-600 dark:text-purple-400 leading-none">{stats?.average_score || 0}%</span>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Student Submissions</h3>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded font-bold uppercase tracking-widest">
            Live Activity
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-white dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Student</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Lab</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Score</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {activity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 italic">No recent activity found.</td>
                </tr>
              ) : (
                activity.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                          {item.student_name[0]}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.student_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{item.lab_title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                        item.passed 
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {item.passed ? "PASSED" : "FAILED"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{item.score}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
