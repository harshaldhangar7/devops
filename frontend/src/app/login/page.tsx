"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);

      // Fetch user profile
      const userRes = await fetch("http://127.0.0.1:8000/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      const userData = await userRes.json();
      
      // Redirect based on role
      if (userData.role === "admin") router.push("/dashboard/admin");
      else if (userData.role === "instructor") router.push("/dashboard/instructor");
      else router.push("/dashboard/student");
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">DevOps Lab Platform</h2>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm p-2 border" 
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
        </form>
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Demo accounts (pw: password123):</p>
          <p>admin@example.com | instructor@example.com | student1@example.com</p>
        </div>
      </div>
    </div>
  );
}
