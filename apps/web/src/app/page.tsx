"use client";
import { useEffect, useState } from "react";

interface HealthData {
  service: string;
  status: string;
  timestamp: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reach API server");
        return res.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold tracking-tight text-blue-400">Backbench</h1>
        <p className="text-xl text-slate-400">Practice backend engineering.</p>
        
        <div className="mt-8 p-4 rounded-lg border border-slate-700 bg-slate-800/50 inline-block min-w-[300px]">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">API Gateway Status</p>
          
          {loading && <p className="text-yellow-400 mt-2 font-mono animate-pulse">🔄 Fetching system status...</p>}
          
          {error && <p className="text-red-400 mt-2 font-mono">❌ API: Unhealthy ({error})</p>}
          
          {health && (
            <div className="mt-2 text-left space-y-1 font-mono text-sm">
              <p className="text-green-400 font-bold">✅ API: Healthy</p>
              <p className="text-slate-400 text-xs">Service: {health.service}</p>
              <p className="text-slate-400 text-xs">Status: {health.status}</p>
              <p className="text-slate-500 text-[10px]">{health.timestamp}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}