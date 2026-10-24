import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, FolderGit2 } from 'lucide-react';

export default function ProjectsPage() {
  const projects = [
    {
      id: 'proj-001',
      name: 'ForgeOS Core Engine',
      goal: 'Develop the control plane orchestrator, workflow engine, and persistent memory.',
      status: 'active',
      rolesCount: 4,
      artifactsCount: 6,
    },
    {
      id: 'proj-002',
      name: 'Notification Dispatcher',
      goal: 'High-throughput Redis event queue and multi-channel email/SMS delivery.',
      status: 'active',
      rolesCount: 3,
      artifactsCount: 4,
    },
    {
      id: 'proj-003',
      name: 'Security Audit & RBAC Gate',
      goal: 'Centralized policy authorization and immutable audit logger.',
      status: 'completed',
      rolesCount: 2,
      artifactsCount: 5,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Projects Workspace</h1>
          <p className="mt-0.5 text-xs text-zinc-400">Manage and oversee active AI engineering project environments</p>
        </div>
        <Button size="sm" className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm transition-all hover:bg-white">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span>New Project</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="work-card card-specular flex flex-col justify-between p-5"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <FolderGit2 className="h-4 w-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-100">{proj.name}</h3>
                    <span className="font-mono text-[10px] text-zinc-500">{proj.id}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`font-mono text-[10px] ${
                    proj.status === 'active'
                      ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {proj.status}
                </Badge>
              </div>

              <p className="mt-3.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">
                {proj.goal}
              </p>
            </div>

            <div className="mt-5 space-y-3 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <span>{proj.rolesCount} Active Roles</span>
                <span>{proj.artifactsCount} Artifacts</span>
              </div>
              <a
                href={`/projects/${proj.id}`}
                className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <span>Open Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
