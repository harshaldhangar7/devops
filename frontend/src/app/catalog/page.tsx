"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Skeleton } from "@/components/ui/base";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export default function PublicCatalog() {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/labs/`)
      .then(res => res.json())
      .then(data => {
        setLabs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching labs:", err);
        setLoading(false);
      });
  }, []);

  const filteredLabs = labs.filter(lab => 
    lab.title.toLowerCase().includes(search.toLowerCase()) ||
    lab.description.toLowerCase().includes(search.toLowerCase()) ||
    (lab.tags && lab.tags.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-black tracking-tight uppercase italic mb-4">Lab Catalog</h1>
            <p className="text-gray-500 font-medium">Explore our collection of hands-on DevOps and Cloud infrastructure labs.</p>
          </div>
          <div className="w-full md:w-96 relative">
            <input 
              type="text" 
              placeholder="Search labs (e.g. Docker, Terraform)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)}
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No labs found</h3>
            <p className="text-gray-500">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLabs.map((lab) => (
              <Card key={lab.id} className="group hover:border-indigo-500/50 transition-all flex flex-col h-full overflow-hidden p-0 bg-white dark:bg-gray-900">
                <div className="h-32 bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-4xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                   <span>💻</span>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black uppercase italic tracking-tight group-hover:text-indigo-600 transition-colors">{lab.title}</h3>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      lab.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      lab.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {lab.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 leading-relaxed line-clamp-3">
                    {lab.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-gray-800">
                    <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                      ⏱️ {lab.estimated_minutes} Min
                    </span>
                    <Link href="/login">
                      <Button variant="secondary" className="text-xs font-black uppercase tracking-widest px-4">
                        Start Lab
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
