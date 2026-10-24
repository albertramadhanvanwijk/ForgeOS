import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';

export default function GitWorktreesPage() {
  const worktrees = [
    {
      path: 'D:\\abeng\\WORK\\proyek\\ForgeOS',
      branch: 'main',
      head: '9232152',
      isClean: true,
      isPrimary: true,
      lastModified: 'Just now',
    },
    {
      path: 'D:\\abeng\\WORK\\proyek\\ForgeOS\\runtime-data\\worktrees\\agent-lead-architect-task-88',
      branch: 'agent/lead-architect-task-88',
      head: '9232152',
      isClean: true,
      isPrimary: false,
      lastModified: '18 min ago',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Git & Isolated Worktrees</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Worktree isolation manager, atomic branch merges, and sandboxed parallel workspace lifecycle (FR-040, FR-041).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-300 hover:bg-zinc-800">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            <span>Scan Worktrees</span>
          </Button>
          <Button size="sm" className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>Create Isolated Worktree</span>
          </Button>
        </div>
      </div>

      {/* Primary Worktree Status */}
      <div className="work-card card-specular p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-zinc-100">Primary Git Repository Root</span>
              <span className="rounded border border-emerald-800 bg-emerald-950 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
                ACTIVE
              </span>
            </div>
            <div className="font-mono text-xs text-zinc-400">
              Remote: <span className="text-zinc-300">origin (https://github.com/albertramadhanvanwijk/ForgeOS.git)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span>Branch: <span className="text-zinc-200 font-semibold">main</span></span>
            <span>•</span>
            <span>HEAD: <span className="text-zinc-200">9232152</span></span>
          </div>
        </div>
      </div>

      {/* Worktrees Table */}
      <div className="work-card card-specular divide-y divide-zinc-800/80 overflow-hidden shadow-sm">
        <div className="bg-zinc-950 px-4 py-3 font-mono text-[11px] font-medium text-zinc-400">
          REGISTERED ACTIVE WORKTREES
        </div>
        {worktrees.map((wt) => (
          <div key={wt.path} className="flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <GitBranch className="h-4 w-4 text-zinc-400" />
                <span className="font-mono text-xs font-semibold text-zinc-200">{wt.branch}</span>
                {wt.isPrimary && (
                  <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    root
                  </span>
                )}
                {wt.isClean ? (
                  <span className="font-mono text-[10px] text-emerald-400">clean</span>
                ) : (
                  <span className="font-mono text-[10px] text-amber-400">uncommitted</span>
                )}
              </div>
              <div className="font-mono text-[11px] text-zinc-500">{wt.path}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right font-mono text-[11px]">
                <div className="text-zinc-300">commit {wt.head}</div>
                <div className="text-zinc-500">{wt.lastModified}</div>
              </div>
              {!wt.isPrimary && (
                <button className="text-zinc-500 hover:text-red-400 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
