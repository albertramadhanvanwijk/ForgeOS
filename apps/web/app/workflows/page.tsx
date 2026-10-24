import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Workflow,
  Plus,
  RotateCcw,
} from 'lucide-react';

export default function WorkflowsPage() {
  const workflows = [
    {
      id: 'wf-greenfield-core',
      name: 'Greenfield Engineering Pipeline',
      intent: 'CREATE',
      tasks: 4,
      status: 'completed',
      leadRole: 'Lead Architect',
      duration: '42s',
      checkpoints: 4,
    },
    {
      id: 'wf-feature-mfa',
      name: 'Feature Enhancement & Gate Check',
      intent: 'MODIFY',
      tasks: 3,
      status: 'running',
      leadRole: 'Backend Engineer',
      duration: '18s',
      checkpoints: 2,
    },
    {
      id: 'wf-repair-telemetry',
      name: 'Incident Diagnostic & Repair DAG',
      intent: 'TROUBLESHOOT',
      tasks: 2,
      status: 'completed',
      leadRole: 'QA & Verification',
      duration: '12s',
      checkpoints: 2,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Workflows & DAG Engine</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Durable state machines, DAG topological sorting, and persistent checkpoints (FR-011, FR-016–FR-018).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-300 hover:bg-zinc-800">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            <span>Resume Checkpoint</span>
          </Button>
          <Button size="sm" className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>New Workflow</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="work-card card-specular p-4">
          <span className="text-[11px] font-medium text-zinc-400">Active Workflows</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-zinc-100">3 Total / 1 Executing</div>
          <span className="font-mono text-[10px] text-zinc-500">Zero orphaned checkpoints</span>
        </div>
        <div className="work-card card-specular p-4">
          <span className="text-[11px] font-medium text-zinc-400">DAG Execution Engine</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-emerald-400">Deterministic</div>
          <span className="font-mono text-[10px] text-zinc-500">Kahn topological sort algorithm</span>
        </div>
        <div className="work-card card-specular p-4">
          <span className="text-[11px] font-medium text-zinc-400">Recovery Integrity</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-zinc-100">100% Resumable</div>
          <span className="font-mono text-[10px] text-zinc-500">JSON snapshot state persistence</span>
        </div>
      </div>

      {/* Workflow Table */}
      <div className="work-card card-specular overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 font-mono text-[11px] text-zinc-400">
              <th className="px-4 py-3 font-medium">Workflow Run ID</th>
              <th className="px-4 py-3 font-medium">Pipeline Definition</th>
              <th className="px-4 py-3 font-medium">Intent</th>
              <th className="px-4 py-3 font-medium">DAG Nodes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Lead Agent</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {workflows.map((wf) => (
              <tr key={wf.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3.5 text-zinc-300 font-semibold">{wf.id}</td>
                <td className="px-4 py-3.5 font-sans font-medium text-zinc-200">{wf.name}</td>
                <td className="px-4 py-3.5">
                  <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-300">
                    {wf.intent}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-zinc-400">{wf.tasks} nodes</td>
                <td className="px-4 py-3.5">
                  {wf.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> running ({wf.duration})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 font-sans text-zinc-300">{wf.leadRole}</td>
                <td className="px-4 py-3.5 text-right font-sans">
                  <button className="text-zinc-400 hover:text-zinc-100 text-xs font-medium">
                    Inspect Graph →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
