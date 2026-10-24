import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Lock,
} from 'lucide-react';

export default function PlatformBuilderPage() {
  const changeSets = [
    {
      id: 'cs-001',
      title: 'Integrate Sandboxed Execution Engine & Allowlist',
      scope: 'infrastructure/local-runner',
      impact: 'Enforces strict command allowlist and environment secret filtering.',
      status: 'released',
      version: 'v1.0.0',
    },
    {
      id: 'cs-002',
      title: 'Add Model Gateway Multi-Provider Fallback Routing',
      scope: 'platform/model-gateway',
      impact: 'Automatic fallback between OpenAI, Anthropic, Gemini, Ollama with cost tracking.',
      status: 'released',
      version: 'v1.1.0',
    },
    {
      id: 'cs-003',
      title: 'Persistent Memory Engine & Boundary Isolation',
      scope: 'platform/persistent-memory',
      impact: 'Captures architectural decisions with automated secret scrubbing.',
      status: 'active',
      version: 'v1.2.0',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Platform Builder</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Controlled conversational evolution, versioned PlatformChangeSets, and zero silent modifications (FR-070–FR-080).
          </p>
        </div>
        <Button size="sm" className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white">
          <Wrench className="mr-1.5 h-3.5 w-3.5" />
          <span>Propose ChangeSet</span>
        </Button>
      </div>

      {/* Governance Bar */}
      <div className="work-card card-specular flex items-center gap-3 p-4 text-xs text-zinc-400">
        <Lock className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        <div>
          <span className="font-semibold text-zinc-200">Evolution Lifecycle: </span>
          <span className="font-mono text-[11px] text-zinc-400">
            Inspect → Analyze Impact → Plan ChangeSet → Isolated Worktree → Validate → Approval Gate → Release
          </span>
        </div>
      </div>

      {/* Versioned ChangeSets */}
      <div className="work-card card-specular divide-y divide-zinc-800/80 overflow-hidden shadow-sm">
        <div className="bg-zinc-950 px-4 py-3 font-mono text-[11px] font-medium text-zinc-400">
          CHANGE SET AUDIT TRAIL
        </div>
        {changeSets.map((cs) => (
          <div key={cs.id} className="flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] text-zinc-500">{cs.id}</span>
                <h3 className="text-xs font-semibold text-zinc-100">{cs.title}</h3>
                <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  {cs.version}
                </span>
                {cs.status === 'released' ? (
                  <Badge variant="outline" className="border-emerald-800 bg-emerald-950 font-mono text-[10px] text-emerald-400">
                    RELEASED
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-800 bg-amber-950 font-mono text-[10px] text-amber-400">
                    STAGED
                  </Badge>
                )}
              </div>
              <div className="font-mono text-[11px] text-zinc-500">
                Scope: <span className="text-zinc-400">{cs.scope}</span> • {cs.impact}
              </div>
            </div>

            <div>
              <button className="font-mono text-[11px] text-zinc-400 hover:text-zinc-100">
                Inspect Diff →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
