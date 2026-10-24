'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  RefreshCw,
  GitCommit,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface GitStatusData {
  currentBranch: string;
  isClean: boolean;
  modifiedFiles: string[];
  untrackedFiles: string[];
  stagedFiles: string[];
}

interface CommitItem {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export default function GitWorktreesPage() {
  const [status, setStatus] = useState<GitStatusData | null>(null);
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGitData = async () => {
    setLoading(true);
    try {
      const [statusRes, historyRes] = await Promise.all([
        fetch('/api/git/status'),
        fetch('/api/git/history?limit=10'),
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setStatus(sData);
      }

      if (historyRes.ok) {
        const hData = await historyRes.json();
        setCommits(hData.commits || []);
      }
    } catch (err) {
      console.error('Failed to fetch live git data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Live Git Status & Audit History</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Real-time git status, branch tracking, and cryptographic commit audit history from repository root (FR-040, FR-041).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchGitData}
            disabled={loading}
            className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Scan Git</span>
          </Button>
        </div>
      </div>

      {/* Primary Worktree Status */}
      <div className="work-card card-specular p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-zinc-100">Repository Root Status</span>
              {status?.isClean ? (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-800 bg-emerald-950 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> CLEAN TREE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-amber-800 bg-amber-950 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                  <AlertCircle className="h-3 w-3" /> UNCOMMITTED CHANGES
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-zinc-400">
              Remote: <span className="text-zinc-300">origin/main (https://github.com/albertramadhanvanwijk/ForgeOS.git)</span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span>Branch: <span className="text-zinc-100 font-bold">{status?.currentBranch || 'main'}</span></span>
            <span>•</span>
            <span>Latest HEAD: <span className="text-zinc-100 font-semibold">{commits[0]?.hash || 'HEAD'}</span></span>
          </div>
        </div>
      </div>

      {/* Real Git Commits Table */}
      <div className="work-card card-specular divide-y divide-zinc-800/80 overflow-hidden shadow-sm">
        <div className="bg-zinc-950 px-4 py-3 font-mono text-[11px] font-medium text-zinc-400 flex items-center justify-between">
          <span>LIVE COMMIT HISTORY (LAST 10 AUDITED COMMITS)</span>
          <span className="text-zinc-500 font-sans text-xs">Automated Git Logs</span>
        </div>

        {loading && commits.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">Reading live git commits...</div>
        ) : (
          commits.map((c) => (
            <div key={c.hash} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-zinc-900/40 transition-colors gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <GitCommit className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="rounded border border-blue-900/60 bg-blue-950/40 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-blue-300">
                    {c.hash}
                  </span>
                  <span className="text-xs font-medium text-zinc-200">{c.message}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400 shrink-0">
                <span className="text-zinc-300">{c.author}</span>
                <span>•</span>
                <span className="text-zinc-500">{c.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
