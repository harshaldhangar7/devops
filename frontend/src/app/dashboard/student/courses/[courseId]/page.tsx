"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // In a real app we would fetch the specific course modules with labs,
    // For Phase 2 we use a mock combined fetch or just the catalog endpoint.
    fetch(`http://127.0.0.1:8000/api/v1/courses/${params.courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setCourse(data));
  }, [params.courseId]);

  if (!course) return <div>Loading course...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{course.description}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Modules</h3>
        
        {/* Mocking the modules for now since we didn't build the nested API endpoint yet */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white">1. Introduction to Linux</h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
              <div>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">Lab:</span> Linux File Permissions
              </div>
              <Link href="/dashboard/student/labs/1" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                Start Lab
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white">2. Docker Basics</h4>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800">
              <div>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">Lab:</span> Docker Hello World
              </div>
              <Link href="/dashboard/student/labs/2" className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                Start Lab
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
