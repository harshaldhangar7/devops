"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function LabDetailPage() {
  const params = useParams();
  const [lab, setLab] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://127.0.0.1:8000/api/v1/labs/${params.labId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setLab(data));
  }, [params.labId]);

  if (!lab) return <div>Loading lab...</div>;

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
            </div>
          </div>
          <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-not-allowed opacity-80" disabled title="Coming in Phase 3">
            Launch Mock Workspace
          </button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
          <p className="text-gray-600 dark:text-gray-300">{lab.description || "No description provided."}</p>
        </div>

        {lab.tags && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
            <p className="text-gray-600 dark:text-gray-300">{lab.tags}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Instructions</h3>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-500 italic">Instructions will be displayed here from the active lab version metadata in Phase 3.</p>
        </div>
      </div>
    </div>
  );
}
