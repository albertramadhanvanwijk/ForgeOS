import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects Workspace</h1>
          <p className="text-sm text-muted-foreground">Manage and oversee active AI engineering projects</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => (
          <Card key={proj.id} className="flex flex-col justify-between transition-colors hover:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-sky-400" />
                  <CardTitle className="text-base font-semibold">{proj.name}</CardTitle>
                </div>
                <Badge variant={proj.status === 'active' ? 'success' : 'secondary'}>
                  {proj.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                {proj.goal}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{proj.rolesCount} Active Roles</span>
                <span>{proj.artifactsCount} Artifacts</span>
              </div>
              <Button variant="outline" size="sm" className="w-full justify-between text-xs" asChild>
                <a href={`/projects/${proj.id}`}>
                  Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
