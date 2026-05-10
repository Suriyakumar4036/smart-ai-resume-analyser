"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, BarChart3, Lightbulb, Search } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NexusDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsAnalyzing(true);
      
      const formData = new FormData();
      formData.append("file", uploadedFile);
      
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Analysis failed", error);
        setResults({ error: "Could not connect to the analysis engine." });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <main className="min-h-screen p-8 relative overflow-hidden">
      <div className="mesh-bg" />
      
      {/* Header */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Search className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">NEXUS AI</h1>
        </div>
        <div className="hidden md:flex items-center gap-8 text-zinc-400 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Analyzer</a>
          <a href="#" className="hover:text-white transition-colors">Templates</a>
          <a href="#" className="hover:text-white transition-colors">Resources</a>
          <button className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-all">
            Get Pro
          </button>
        </div>
      </nav>

      {/* Hero & Upload Section */}
      {!results && !isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mt-20"
        >
          <h2 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            Perfect Your Resume <br/> with Intelligence.
          </h2>
          <p className="text-zinc-400 text-xl mb-12 max-w-xl mx-auto">
            Upload your resume and get instant, AI-driven insights on how to land your dream job.
          </p>

          <label className="group relative block w-full max-w-xl mx-auto cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass rounded-2xl p-12 border-dashed border-2 border-zinc-700 group-hover:border-indigo-500/50 transition-all">
              <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-indigo-400 w-8 h-8" />
                </div>
                <p className="text-lg font-medium text-white mb-2">Drop your resume here</p>
                <p className="text-zinc-500 text-sm">Supports PDF only (Max 10MB)</p>
              </div>
            </div>
          </label>
        </motion.div>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-12 rounded-3xl text-center max-w-sm"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-t-indigo-500 rounded-full"
              ></motion.div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Analyzing Intelligence</h3>
            <p className="text-zinc-400">Our AI is parsing your professional impact...</p>
          </motion.div>
        </div>
      )}

      {/* Results Dashboard */}
      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20"
          >
            {results.error ? (
              <div className="lg:col-span-3 glass p-12 rounded-3xl text-center">
                <AlertCircle className="text-rose-500 w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Analysis Failed</h3>
                <p className="text-zinc-400 mb-6">{results.error}</p>
                <button 
                  onClick={() => setResults(null)}
                  className="px-6 py-2 bg-white text-black font-bold rounded-full"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Left Col: Overview */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                  <div className="glass p-8 rounded-3xl text-center">
                    <h3 className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-6">Nexus Score</h3>
                    <div className="relative w-48 h-48 mx-auto mb-6">
                      <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" viewBox="0 0 100 100">
                        <circle className="text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                        <motion.circle 
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * (results.score || 0)) / 100 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          className="text-indigo-500" 
                          strokeWidth="6" 
                          strokeDasharray="264" 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                          r="42" 
                          cx="50" 
                          cy="50" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black">{results.score || 0}</span>
                        <span className="text-zinc-500 text-xs font-bold">OPTIMIZED</span>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">Your resume is better than {results.percentile || 0}% of applicants in your field.</p>
                  </div>

                  <div className="glass p-8 rounded-3xl">
                    <h3 className="flex items-center gap-2 text-white font-bold mb-6">
                      <BarChart3 className="text-cyan-400 w-5 h-5" />
                      Key Metrics
                    </h3>
                    <div className="space-y-6">
                      {results.metrics?.map((m: any) => (
                        <div key={m.label}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-zinc-400">{m.label}</span>
                            <span className="text-white font-bold">{m.value}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${m.value}%` }}
                              className={cn("h-full rounded-full", m.color)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Col: Details */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                  <div className="glass p-8 rounded-3xl min-h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Lightbulb className="text-amber-400 w-6 h-6" />
                        Smart Suggestions
                      </h3>
                      <button 
                        onClick={() => setResults(null)}
                        className="text-zinc-500 hover:text-white transition-colors text-sm"
                      >
                        Analyze New Resume
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.suggestions?.map((s: any, i: number) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            {s.type === "positive" ? (
                              <CheckCircle2 className="text-green-500 w-6 h-6 mt-1 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="text-indigo-400 w-6 h-6 mt-1 flex-shrink-0" />
                            )}
                            <div>
                              <h4 className="font-bold text-white mb-1">{s.title}</h4>
                              <p className="text-zinc-400 text-sm">{s.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Cloud */}
                  <div className="glass p-8 rounded-3xl">
                    <h3 className="text-xl font-bold mb-6">Detected Industry Keywords</h3>
                    <div className="flex flex-wrap gap-3">
                      {results.skills?.map((skill: string) => (
                        <span 
                          key={skill}
                          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto py-12 flex justify-between items-center text-zinc-500 text-xs border-t border-zinc-900 mt-20">
        <p>© 2024 NEXUS AI INTELLIGENCE. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8 uppercase font-bold tracking-tighter">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">API Documentation</a>
        </div>
      </footer>
    </main>
  );
}
