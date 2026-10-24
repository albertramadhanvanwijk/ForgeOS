import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Code2,
  ShieldCheck,
  GitFork,
  Cpu,
  Layers,
} from 'lucide-react';

export default function FleetPage() {
  const roles = [
    {
      id: 'orchestrator',
      name: 'Conversational Orchestrator',
      icon: Compass,
      skills: ['intent-classification', 'adaptive-planning', 'delegation'],
      modelTier: 'claude-3-5-sonnet',
      status: 'idle',
      description: 'Translates high-level user intent into unambiguous goals, acceptance criteria, and DAG workflows.',
      capabilities: ['intent:classify', 'dag:synthesize', 'workflow:orchestrate'],
    },
    {
      id: 'solution-architect',
      name: 'Lead Solution Architect',
      icon: Layers,
      skills: ['architecture-design', 'interface-specification', 'adr-authoring'],
      modelTier: 'gpt-4o',
      status: 'idle',
      description: 'Authoritative architect for domain models, API contracts, schema migrations, and ADR packages.',
      capabilities: ['arch:spec', 'adr:author', 'contract:validate'],
    },
    {
      id: 'software-engineer',
      name: 'Senior Software Engineer',
      icon: Code2,
      skills: ['tdd-implementation', 'refactoring', 'code-generation'],
      modelTier: 'gpt-4o',
      status: 'busy',
      description: 'Executes strict test-driven development, builds production features, and refactors clean code.',
      capabilities: ['code:write', 'test:tdd', 'refactor:clean'],
    },
    {
      id: 'qa-engineer',
      name: 'QA & Verification Engineer',
      icon: ShieldCheck,
      skills: ['automated-testing', 'quality-gate-verification', 'regression-testing'],
      modelTier: 'gemini-1.5-pro',
      status: 'idle',
      description: 'Validates empirical test evidence against mandatory gate presets and blocks releases on failure.',
      capabilities: ['test:verify', 'gate:evaluate', 'coverage:measure'],
    },
    {
      id: 'devops-engineer',
      name: 'DevOps & Worktree Engineer',
      icon: GitFork,
      skills: ['git-worktrees', 'runner-sandboxing', 'ci-cd-pipelines'],
      modelTier: 'claude-3-5-sonnet',
      status: 'idle',
      description: 'Manages sandboxed execution runners, worktree lifecycle isolation, and atomic merge releases.',
      capabilities: ['worktree:isolate', 'runner:sandbox', 'release:publish'],
    },
    {
      id: 'platform-builder',
      name: 'Platform Builder Agent',
      icon: Cpu,
      skills: ['engine-modification', 'policy-evaluation', 'rollback-management'],
      modelTier: 'gpt-4o',
      status: 'idle',
      description: 'Enables self-contained modification of ForgeOS engines through isolated staging and approval gates.',
      capabilities: ['engine:inspect', 'changeset:plan', 'engine:upgrade'],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Agent Fleet Catalog</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Authoritative role specifications, capability bindings, and least-privilege governance (FR-020–FR-024).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs text-zinc-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> 6 Roles Registered
          </span>
        </div>
      </div>

      {/* Roster Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <div
              key={role.id}
              className="glass-panel glass-specular glass-panel-hover flex flex-col justify-between rounded-xl p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-100">{role.name}</h3>
                      <span className="font-mono text-[10px] text-zinc-500">{role.id}</span>
                    </div>
                  </div>
                  {role.status === 'busy' ? (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-400">
                      active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/10 bg-white/[0.04] font-mono text-[10px] text-zinc-400">
                      idle
                    </Badge>
                  )}
                </div>

                <p className="mt-3.5 text-xs leading-relaxed text-zinc-400">
                  {role.description}
                </p>

                {/* Capability Pills */}
                <div className="mt-4 space-y-1.5">
                  <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                    Bound Capabilities (RBAC)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300 backdrop-blur-sm"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[11px] font-mono text-zinc-500">
                <span>Model: {role.modelTier}</span>
                <span className="text-zinc-400 hover:text-zinc-200 cursor-pointer">Config →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
