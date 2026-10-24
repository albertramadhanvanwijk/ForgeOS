import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  CheckCircle2,
  Play,
} from 'lucide-react';

export default function QualityPage() {
  const gates = [
    {
      name: 'Unit & Integration Test Verification Suite',
      type: 'unit_test',
      severity: 'mandatory',
      command: 'pnpm test --run',
      status: 'passed',
      evidence: '91/91 tests passing across 25 test suites',
      timestamp: '2 min ago',
    },
    {
      name: 'TypeScript Strict Typecheck Compilation',
      type: 'typecheck',
      severity: 'mandatory',
      command: 'pnpm --filter @forgeos/* typecheck',
      status: 'passed',
      evidence: '0 errors found across all packages',
      timestamp: '4 min ago',
    },
    {
      name: 'Least-Privilege RBAC & Capability Gate',
      type: 'security_audit',
      severity: 'mandatory',
      command: 'pnpm --filter @forgeos/policy-engine test',
      status: 'passed',
      evidence: 'Default-deny active; zero unauthorized escalation vectors',
      timestamp: '10 min ago',
    },
    {
      name: 'Cryptographic Artifact SHA-256 Provenance',
      type: 'provenance_audit',
      severity: 'mandatory',
      command: 'artifact-registry verify --all',
      status: 'passed',
      evidence: 'All staged artifacts match immutable SHA-256 hashes',
      timestamp: '12 min ago',
    },
    {
      name: 'Static Lint & Formatting Enforcement',
      type: 'lint',
      severity: 'advisory',
      command: 'eslint . --max-warnings 0',
      status: 'passed',
      evidence: 'Codebase adheres to clean architectural guidelines',
      timestamp: '15 min ago',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Quality Center</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Automated verification gates, empirical test evidence, and release blocking enforcement (FR-060–FR-063).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-md hover:bg-white">
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
            <span>Evaluate All Gates</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="glass-panel glass-specular glass-panel-hover rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400">Overall Gate Pass Rate</span>
          <div className="mt-1.5 font-mono text-2xl font-bold text-emerald-400">100%</div>
          <span className="font-mono text-[10px] text-zinc-500">5/5 gates passing</span>
        </div>
        <div className="glass-panel glass-specular glass-panel-hover rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400">Release Gate Clearance</span>
          <div className="mt-1.5 font-mono text-2xl font-bold text-zinc-100">GRANTED</div>
          <span className="font-mono text-[10px] text-zinc-500">Zero mandatory blockers</span>
        </div>
        <div className="glass-panel glass-specular glass-panel-hover rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400">Automated Suites</span>
          <div className="mt-1.5 font-mono text-2xl font-bold text-zinc-100">91 Tests</div>
          <span className="font-mono text-[10px] text-zinc-500">100% automated regression evidence</span>
        </div>
      </div>

      {/* Quality Gate List */}
      <div className="glass-panel glass-specular divide-y divide-white/[0.06] rounded-xl shadow-2xl overflow-hidden">
        {gates.map((g) => (
          <div key={g.name} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-zinc-100">{g.name}</h3>
                <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  {g.severity}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-500">
                <span className="text-zinc-400">$ {g.command}</span>
                <span>•</span>
                <span>{g.evidence}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-zinc-500">{g.timestamp}</span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-400">
                PASSED
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
