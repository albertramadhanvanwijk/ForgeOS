import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  Search,
  Lock,
  History,
  ShieldAlert,
  Database,
  Plus,
} from 'lucide-react';

export default function MemoryPage() {
  const items = [
    {
      id: 'mem-001',
      title: 'Monorepo Stack & Fastify Integration Architecture',
      type: 'decision',
      state: 'active',
      scope: 'project:forgeos-core',
      provenance: 'Task 1.3: Fastify Orchestrator Backend Scaffold',
      version: 1,
      sanitized: true,
    },
    {
      id: 'mem-002',
      title: 'Command Runner Allowlist & Security Sandbox Rules',
      type: 'policy',
      state: 'active',
      scope: 'system:global',
      provenance: 'Task 2.3: Sandboxed Execution & Runner Policy',
      version: 1,
      sanitized: true,
    },
    {
      id: 'mem-003',
      title: 'Adaptive Intent Workflow DAG Synthesis Pattern',
      type: 'pattern',
      state: 'active',
      scope: 'project:forgeos-core',
      provenance: 'Task 2.1: Orchestrator Intent Classification',
      version: 2,
      sanitized: true,
    },
    {
      id: 'mem-004',
      title: 'Prisma SQLite Development Schema Migration Map',
      type: 'artifact_ref',
      state: 'active',
      scope: 'project:forgeos-core',
      provenance: 'Task 1.2: Database Persistence Layer',
      version: 1,
      sanitized: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Persistent Memory Subsystem</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Contextual memory items, strict project-level isolation, automated secret scrubbing, and deduplication (MEM-001–MEM-018).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-zinc-100 font-mono text-xs text-zinc-900 hover:bg-white">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>Store Context</span>
          </Button>
        </div>
      </div>

      {/* Governance Banner */}
      <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/40 px-4 py-2.5 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Project Isolation Enforced: Context items cannot leak across project boundaries.</span>
        </div>
        <span className="font-mono text-[11px] text-zinc-500">Secret Scrubbing: ACTIVE</span>
      </div>

      {/* Memory Item Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((m) => (
          <div
            key={m.id}
            className="flex flex-col justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-zinc-700"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] text-zinc-500">{m.id}</span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="border-zinc-800 bg-zinc-900 font-mono text-[10px] text-zinc-300">
                    {m.type}
                  </Badge>
                  <span className="rounded border border-zinc-800 bg-zinc-900 px-1 font-mono text-[10px] text-zinc-400">
                    v{m.version}
                  </span>
                </div>
              </div>

              <h3 className="mt-2 text-sm font-semibold text-zinc-100">{m.title}</h3>
              <div className="mt-1 font-mono text-[11px] text-zinc-500">Scope: {m.scope}</div>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Provenance: {m.provenance}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Zero Secrets Detected
              </span>
              <span className="text-zinc-400 hover:text-zinc-200 cursor-pointer font-sans">
                Inspect Memory →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
