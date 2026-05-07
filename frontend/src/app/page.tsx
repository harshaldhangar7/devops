"use client";

import Link from "next/link";
import { Button } from "@/components/ui/base";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              D
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">DevOps Guru</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <Link href="/catalog" className="hover:text-indigo-600 transition-colors">Labs</Link>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="secondary" className="hidden sm:inline-flex border-none font-bold">Login</Button>
            </Link>
            <Link href="/login">
              <Button className="px-6 shadow-xl shadow-indigo-500/20 font-black tracking-widest">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-40 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></span>
            New Phase 3 Labs Now Live
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Master DevOps <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">By Doing.</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The ultimate browser-based lab platform for cloud engineers. Deploy real infrastructure, automate pipelines, and get instant feedback from AI-driven checkers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-48 py-4 text-base font-black tracking-widest shadow-2xl shadow-indigo-500/40">
                Launch My Lab
              </Button>
            </Link>
            <Link href="/catalog" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-48 py-4 text-base font-black tracking-widest group">
                View Catalog 
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </div>

          {/* Hero Mockup Preview */}
          <div className="mt-20 relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-transparent to-transparent z-10 h-full"></div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto">
              <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                <div className="ml-4 h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded text-[8px] flex items-center px-2 text-gray-400">
                  devops-guru.com/dashboard/student/labs/1
                </div>
              </div>
              <div className="p-8 grid grid-cols-3 gap-6 opacity-60">
                <div className="col-span-1 space-y-4">
                  <div className="h-6 w-32 bg-gray-100 dark:bg-gray-800 rounded"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded w-full"></div>)}
                  </div>
                </div>
                <div className="col-span-2 bg-[#0d1117] rounded-xl h-64 border border-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-gray-900/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight mb-4 uppercase italic">Built for the Modern Engineer</h2>
            <p className="text-gray-500 font-medium">Everything you need to go from Junior to Senior DevOps Specialist.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Interactive Terminals",
                desc: "Real-time access to Linux environments with pre-installed toolsets like Docker, K8s, and Terraform.",
                icon: "⚡"
              },
              {
                title: "Automated Checkers",
                desc: "Get instant validation on your work. Our engine checks your configurations and provides direct feedback.",
                icon: "🤖"
              },
              {
                title: "Role-Based Paths",
                desc: "Dedicated experiences for Students, Instructors, and Admins to manage the entire learning lifecycle.",
                icon: "👥"
              }
            ].map((f, i) => (
              <div key={i} className="p-10 rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 hover:border-indigo-500/50 transition-all group">
                <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-8 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black mb-4 uppercase italic tracking-tight">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-gray-100 dark:border-gray-800 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125">
          <span className="text-2xl font-black tracking-tighter">AWS</span>
          <span className="text-2xl font-black tracking-tighter">AZURE</span>
          <span className="text-2xl font-black tracking-tighter">GCP</span>
          <span className="text-2xl font-black tracking-tighter">DOCKER</span>
          <span className="text-2xl font-black tracking-tighter">KUBERNETES</span>
          <span className="text-2xl font-black tracking-tighter">TERRAFORM</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
                D
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic">DevOps Guru</span>
            </div>
            <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
              Empowering the next generation of cloud engineers through practical, hands-on learning experiences that bridge the gap between theory and production.
            </p>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-gray-400">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Lab Catalog</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Instructor Tools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6 text-gray-400">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© 2026 DEVOPS GURU PLATFORM. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
