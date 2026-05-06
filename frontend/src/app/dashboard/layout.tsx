"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setUser(data))
    .catch(() => {
      localStorage.removeItem("token");
      router.push("/login");
    });
  }, [router]);

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">DevOps Lab Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">{user.full_name} ({user.role})</span>
            <button 
              onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
