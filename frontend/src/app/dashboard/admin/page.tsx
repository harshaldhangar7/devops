"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://127.0.0.1:8000/api/v1/courses/", { headers }).then(res => res.json()),
      fetch("http://127.0.0.1:8000/api/v1/labs/", { headers }).then(res => res.json()),
      fetch("http://127.0.0.1:8000/api/v1/cohorts/", { headers }).then(res => res.json())
    ]).then(([coursesData, labsData, cohortsData]) => {
      setCourses(coursesData);
      setLabs(labsData);
      setCohorts(cohortsData);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Courses Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Courses</h3>
            <button className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">+ New</button>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {courses.length === 0 ? <li className="p-4 text-sm text-gray-500 text-center">No courses found.</li> : courses.map(course => (
              <li key={course.id} className="p-4 flex justify-between">
                <span className="font-medium dark:text-white">{course.title}</span>
                <span className="text-sm text-gray-500">Active</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Labs Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Labs</h3>
            <button className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">+ New</button>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {labs.length === 0 ? <li className="p-4 text-sm text-gray-500 text-center">No labs found.</li> : labs.map(lab => (
              <li key={lab.id} className="p-4 flex justify-between">
                <span className="font-medium dark:text-white">{lab.title}</span>
                <span className="text-sm text-gray-500">{lab.difficulty}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cohorts Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cohorts</h3>
            <button className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">+ New</button>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cohorts.length === 0 ? <li className="p-4 text-sm text-gray-500 text-center">No cohorts found.</li> : cohorts.map(cohort => (
              <li key={cohort.id} className="p-4 flex justify-between">
                <span className="font-medium dark:text-white">{cohort.name}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
