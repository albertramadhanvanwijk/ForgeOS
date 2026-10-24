'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Workflow,
  Plus,
  RotateCcw,
  RefreshCw,
  Play,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface WorkflowRunItem {
  id: string;
  projectId: string;
  name: string;
  state: 'pending' | 'running' | 'completed' | 'paused' | 'failed';
  definitionId: string;
  tasksCount: number;
  tasks: Array<{ id: string; name: string; status: string }>;
  checkpointsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function WorkflowsPage() {
  const [runs, setRuns] = useState<WorkflowRunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflows/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch workflow runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleCreateSampleRun = async () => {
    setCreating(true);
    try {
      const runId = `wf-run-${Date.now()}`;
      const payload = {
        projectId: 'proj-live-01',
        definition: {
          id: `def-${Date.now()}`,
          name: 'Live Automated CI/CD & Build Pipeline',
          tasks: [
            { id: 'task-1', name: 'Lint & Typecheck', dependencies: [] },
            { id: 'task-2', name: 'Sandboxed Runner Execution', dependencies: ['task-1'] },
            { id: 'task-3', name: 'Policy Deployment Gate Check', dependencies: ['task-2'] },
          ],
        },
      };

      const res = await fetch('/api/workflows/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchRuns();
      }
    } catch (err) {
      console.error('Failed to trigger workflow run:', err);
    } finally {
      setCreating(false);
    }
  };

  const completedCount = runs.filter((r) => r.state === 'completed').length;
  const runningCount = runs.filter((r) => r.state === 'running').length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Live Workflows & DAG Engine</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Durable state machines, DAG topological sorting, and persistent checkpoints (FR-011, FR-016–FR-018).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchRuns}
            disabled={loading}
            className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={handleCreateSampleRun}
            disabled={creating}
            className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>{creating ? 'Spawning DAG...' : 'Trigger Workflow Run'}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="work-card card-specular p-4">
          <span className="text-[11px] font-medium text-zinc-400">Active Workflow Runs</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-zinc-100">
            {runs.length} Total / {runningCount} Running
          </div>
          <span className="font-mono text-[10px] text-zinc-500">Live database state</span>
        </div>
        <div className="work-card card-specular p-4">
          <span className="text-[11px] font-medium text-zinc-400">DAG Execution Engine</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-emerald-400">Deterministic</div>
          <span className="font-mono text-[10px] text-zinc-500">Kahn topological sort algorithm</span>
        </div>
        <div className="work-card card-specular p-4">
          <span className="text-[11px] font-medium text-zinc-400">Completed Success Rate</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-zinc-100">
            {runs.length > 0 ? `${Math.round((completedCount / runs.length) * 100)}%` : '100%'} Resumable
          </div>
          <span className="font-mono text-[10px] text-zinc-500">JSON snapshot state persistence</span>
        </div>
      </div>

      {/* Workflow Table */}
      <div className="work-card card-specular overflow-hidden shadow-sm">
        {loading && runs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading live workflow runs...</div>
        ) : runs.length === 0 ? (
          <div className="p-12 text-center">
            <Workflow className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400">Belum ada workflow run yang aktif.</p>
            <Button
              size="sm"
              onClick={handleCreateSampleRun}
              className="mt-3 bg-zinc-100 font-mono text-xs text-zinc-900"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Jalankan Workflow Baru
            </Button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 font-mono text-[11px] text-zinc-400">
                <th className="px-4 py-3 font-medium">Workflow Run ID</th>
                <th className="px-4 py-3 font-medium">Pipeline Definition</th>
                <th className="px-4 py-3 font-medium">Project ID</th>
                <th className="px-4 py-3 font-medium">DAG Tasks</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Checkpoints</th>
                <th className="px-4 py-3 font-medium text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {runs.map((wf) => (
                <tr key={wf.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3.5 text-zinc-300 font-semibold">{wf.id.substring(0, 12)}...</td>
                  <td className="px-4 py-3.5 font-sans font-medium text-zinc-200">{wf.name || 'Custom Pipeline'}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {wf.projectId}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-400">{wf.tasksCount} tasks</td>
                  <td className="px-4 py-3.5">
                    {wf.state === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> {wf.state}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-sans text-zinc-400">{wf.checkpointsCount} saved</td>
                  <td className="px-4 py-3.5 text-right font-sans text-zinc-500 text-[11px]">
                    {new Date(wf.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
