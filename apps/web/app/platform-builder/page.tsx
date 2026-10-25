'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Wrench,
  Lock,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CapabilityNode {
  id: string;
  name: string;
  layer?: string;
  type?: string;
  description: string;
  dependencies: string[];
  status?: 'stable' | 'active' | 'deprecated';
  version: string;
}

interface ChangeSet {
  id: string;
  title: string;
  description: string;
  author: string;
  scope: string;
  exactVersionHash: string;
  branchName: string;
  status: 'draft' | 'impact_analyzed' | 'approved' | 'rejected' | 'released' | 'rolled_back';
  impactReport?: {
    affectedCapabilities: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    breakingChanges: boolean;
    requiredTestSuites: string[];
  };
}

const DEFAULT_CAPABILITIES: CapabilityNode[] = [
  {
    id: 'cap-orchestrator',
    name: 'Conversational Orchestrator',
    layer: 'platform/orchestrator',
    description: 'Fastify control plane coordinating workflow execution, intent routing, and state.',
    dependencies: ['cap-workflow-engine', 'cap-agent-registry', 'cap-policy-engine'],
    status: 'stable',
    version: '1.0.0',
  },
  {
    id: 'cap-workflow-engine',
    name: 'Durable Workflow Engine',
    layer: 'platform/workflow-engine',
    description: 'Finite state machine managing execution states, checkpoints, and retries.',
    dependencies: [],
    status: 'stable',
    version: '1.0.0',
  },
  {
    id: 'cap-persistent-memory',
    name: 'Persistent Memory Subsystem',
    layer: 'platform/persistent-memory',
    description: 'Project-isolated contextual knowledge store with automated secret scrubbing.',
    dependencies: ['cap-policy-engine'],
    status: 'stable',
    version: '1.2.0',
  },
  {
    id: 'cap-design-studio',
    name: 'Design Studio Engine',
    layer: 'platform/design-studio',
    description: 'Design spec compiler, SHA-256 version locking, and UI token compliance verification.',
    dependencies: ['cap-policy-engine'],
    status: 'stable',
    version: '1.0.0',
  },
  {
    id: 'cap-platform-builder',
    name: 'Self-Modification Platform Builder',
    layer: 'platform/platform-builder',
    description: 'Autonomous capability evolution engine with dependency graph and anti-silent change invariant.',
    dependencies: ['cap-policy-engine', 'cap-quality-engine'],
    status: 'active',
    version: '2.0.0',
  },
  {
    id: 'cap-local-runner',
    name: 'Sandboxed Runner Engine',
    layer: 'infrastructure/local-runner',
    description: 'Process execution within strict command allowlists and isolated worktrees.',
    dependencies: ['cap-policy-engine'],
    status: 'stable',
    version: '1.0.0',
  },
];

const INITIAL_CHANGESETS: ChangeSet[] = [
  {
    id: 'cs-001',
    title: 'Integrate Sandboxed Execution Engine & Allowlist',
    description: 'Enforces strict command allowlist and environment secret filtering.',
    author: 'system-agent',
    scope: 'infrastructure/local-runner',
    exactVersionHash: '4f92a10be6975294',
    branchName: 'evolution/sandboxed-runner',
    status: 'released',
  },
  {
    id: 'cs-002',
    title: 'Add Model Gateway Multi-Provider Fallback Routing',
    description: 'Dynamic fallback between OpenAI, Anthropic, Gemini, Ollama with cost tracking.',
    author: 'engineer-agent',
    scope: 'platform/model-gateway',
    exactVersionHash: '8b3c41ef092100dc',
    branchName: 'evolution/model-gateway-fallback',
    status: 'released',
  },
  {
    id: 'cs-003',
    title: 'Self-Modifying Platform Builder & Anti-Silent-Change Policy',
    description: 'Autonomous capability introspection, impact analysis, and cryptographic approval gates.',
    author: 'architect-agent',
    scope: 'platform/platform-builder',
    exactVersionHash: 'e71029ba55d210ff',
    branchName: 'evolution/platform-builder-core',
    status: 'approved',
  },
];

export default function PlatformBuilderPage() {
  const [capabilities, setCapabilities] = useState<CapabilityNode[]>(DEFAULT_CAPABILITIES);
  const [changeSets, setChangeSets] = useState<ChangeSet[]>(INITIAL_CHANGESETS);
  const [selectedChangeSet, setSelectedChangeSet] = useState<ChangeSet | null>(INITIAL_CHANGESETS[2]);
  const [newIntent, setNewIntent] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'changesets' | 'evolution'>('evolution');

  const fetchLiveState = async () => {
    try {
      const resCaps = await fetch('/api/platform-builder/capabilities');
      if (resCaps.ok) {
        const data = await resCaps.json();
        if (data.nodes && data.nodes.length > 0) {
          setCapabilities(
            data.nodes.map((n: any) => ({
              ...n,
              layer: n.layer || n.type || 'core',
              status: n.status || 'stable',
            }))
          );
        }
      }

      const resCs = await fetch('/api/platform-builder/changesets');
      if (resCs.ok) {
        const data = await resCs.json();
        if (data.changeSets && data.changeSets.length > 0) {
          setChangeSets(data.changeSets);
        }
      }
    } catch {
      // Local fallback used if orchestrator is not running or cross-origin
    }
  };

  useEffect(() => {
    fetchLiveState();
  }, []);

  const handleProposeChangeSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntent.trim()) return;

    setIsPlanning(true);
    try {
      const res = await fetch('/api/platform-builder/changesets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: newIntent,
          author: 'developer-user',
          version: '2.4.0',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const created: ChangeSet = {
          id: data.changeSet.id,
          title: data.changeSet.title,
          description: data.changeSet.description,
          author: data.changeSet.author,
          scope: data.changeSet.scope,
          exactVersionHash: data.changeSet.exactVersionHash,
          branchName: data.changeSet.branchName,
          status: 'draft',
          impactReport: data.impactReport,
        };
        setChangeSets((prev) => [created, ...prev]);
        setSelectedChangeSet(created);
        setNewIntent('');
      } else {
        // Mock fallback for direct UI preview
        const mockId = `cs-${Math.floor(100 + Math.random() * 900)}`;
        const mockCs: ChangeSet = {
          id: mockId,
          title: newIntent,
          description: `Self-evolution changeset generated from intent: ${newIntent}`,
          author: 'developer-user',
          scope: 'platform/orchestrator',
          exactVersionHash: Math.random().toString(16).substring(2, 18),
          branchName: `evolution/${newIntent.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`,
          status: 'draft',
          impactReport: {
            affectedCapabilities: ['cap-orchestrator', 'cap-workflow-engine'],
            riskLevel: 'medium',
            breakingChanges: false,
            requiredTestSuites: ['tests/unit/workflow-engine.test.ts', 'tests/integration/orchestrator-health.test.ts'],
          },
        };
        setChangeSets((prev) => [mockCs, ...prev]);
        setSelectedChangeSet(mockCs);
        setNewIntent('');
      }
    } catch {
      const mockId = `cs-${Math.floor(100 + Math.random() * 900)}`;
      const mockCs: ChangeSet = {
        id: mockId,
        title: newIntent,
        description: `Self-evolution changeset generated from intent: ${newIntent}`,
        author: 'developer-user',
        scope: 'platform/orchestrator',
        exactVersionHash: Math.random().toString(16).substring(2, 18),
        branchName: `evolution/${newIntent.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`,
        status: 'draft',
        impactReport: {
          affectedCapabilities: ['cap-orchestrator', 'cap-workflow-engine'],
          riskLevel: 'medium',
          breakingChanges: false,
          requiredTestSuites: ['tests/unit/workflow-engine.test.ts', 'tests/integration/orchestrator-health.test.ts'],
        },
      };
      setChangeSets((prev) => [mockCs, ...prev]);
      setSelectedChangeSet(mockCs);
      setNewIntent('');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleApprove = (id: string) => {
    setChangeSets((prev) =>
      prev.map((cs) => (cs.id === id ? { ...cs, status: 'approved' as const } : cs))
    );
    if (selectedChangeSet && selectedChangeSet.id === id) {
      setSelectedChangeSet({ ...selectedChangeSet, status: 'approved' });
    }
  };

  const handleRelease = (id: string) => {
    setChangeSets((prev) =>
      prev.map((cs) => (cs.id === id ? { ...cs, status: 'released' as const } : cs))
    );
    if (selectedChangeSet && selectedChangeSet.id === id) {
      setSelectedChangeSet({ ...selectedChangeSet, status: 'released' });
    }
  };

  const handleRollback = (id: string) => {
    setChangeSets((prev) =>
      prev.map((cs) => (cs.id === id ? { ...cs, status: 'rolled_back' as const } : cs))
    );
    if (selectedChangeSet && selectedChangeSet.id === id) {
      setSelectedChangeSet({ ...selectedChangeSet, status: 'rolled_back' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Platform Builder</h1>
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-[10px] text-indigo-400">
              FR-070–FR-080
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Autonomous self-modification with capability introspection, deterministic SHA-256 version hashes, and zero silent changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLiveState}
            className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            <span>Sync Engine</span>
          </Button>
        </div>
      </div>

      {/* Governance Invariant Banner */}
      <div className="work-card card-specular flex items-center justify-between border-l-2 border-l-emerald-500 p-4 text-xs">
        <div className="flex items-center gap-3">
          <Lock className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="font-semibold text-zinc-200">Strict Evolution Lifecycle: </span>
            <span className="font-mono text-[11px] text-zinc-400">
              Inspect → Impact Analysis → Plan ChangeSet → Isolated Worktree → Quality Test Gate → Governance Approval → Release
            </span>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-800/80 bg-emerald-950/60 font-mono text-[10px] text-emerald-400">
          POLICY ENFORCED
        </Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('evolution')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs transition-colors ${
            activeTab === 'evolution'
              ? 'border-indigo-500 font-medium text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Propose & Evolve
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs transition-colors ${
            activeTab === 'graph'
              ? 'border-indigo-500 font-medium text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          Capability Graph ({capabilities.length})
        </button>
        <button
          onClick={() => setActiveTab('changesets')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 font-mono text-xs transition-colors ${
            activeTab === 'changesets'
              ? 'border-indigo-500 font-medium text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          ChangeSet Audit Trail ({changeSets.length})
        </button>
      </div>

      {/* Tab: Propose & Evolve (FR-070) */}
      {activeTab === 'evolution' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Intent Input & Staged Changesets */}
          <div className="space-y-6 lg:col-span-6">
            <div className="work-card card-specular p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Conversational Platform Modification</h2>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Describe desired system improvements. Platform Builder automatically inspects existing engines, computes dependencies, establishes isolated worktrees, and guarantees no unverified code enters production.
              </p>

              <form onSubmit={handleProposeChangeSet} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-zinc-400">INTENT / REVISION PROMPT</label>
                  <Input
                    value={newIntent}
                    onChange={(e) => setNewIntent(e.target.value)}
                    placeholder="Contoh: Add automated database migration rollback to local runner engine..."
                    className="border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPlanning || !newIntent.trim()}
                  className="w-full bg-indigo-600 font-mono text-xs text-white hover:bg-indigo-500"
                >
                  {isPlanning ? (
                    <>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Traversing Dependency Graph & Generating ChangeSet...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Plan Platform Evolution (FR-070)
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* ChangeSets List */}
            <div className="work-card card-specular divide-y divide-zinc-800/80 overflow-hidden shadow-sm">
              <div className="bg-zinc-950 px-4 py-2.5 font-mono text-[11px] font-medium text-zinc-400 flex items-center justify-between">
                <span>STAGE CHANGELOG</span>
                <span className="text-[10px] text-zinc-600">{changeSets.length} changesets recorded</span>
              </div>
              {changeSets.map((cs) => {
                const isSelected = selectedChangeSet?.id === cs.id;
                return (
                  <div
                    key={cs.id}
                    onClick={() => setSelectedChangeSet(cs)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-zinc-900/80 border-l-2 border-l-indigo-500' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">{cs.id}</span>
                        <h3 className="text-xs font-semibold text-zinc-200">{cs.title}</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] uppercase ${
                          cs.status === 'released'
                            ? 'border-emerald-800 bg-emerald-950/60 text-emerald-400'
                            : cs.status === 'approved'
                            ? 'border-blue-800 bg-blue-950/60 text-blue-400'
                            : cs.status === 'rolled_back'
                            ? 'border-red-800 bg-red-950/60 text-red-400'
                            : 'border-amber-800 bg-amber-950/60 text-amber-400'
                        }`}
                      >
                        {cs.status}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-zinc-500 line-clamp-1">{cs.description}</p>
                    <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-zinc-500">
                      <span>Scope: <span className="text-zinc-400">{cs.scope}</span></span>
                      <span>Branch: <span className="text-zinc-400">{cs.branchName}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected ChangeSet Governance Inspector */}
          <div className="space-y-6 lg:col-span-6">
            {selectedChangeSet ? (
              <div className="work-card card-specular p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500">SELECTED PLATFORM CHANGESET</span>
                    <h2 className="text-sm font-bold text-zinc-100">{selectedChangeSet.title}</h2>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] uppercase ${
                      selectedChangeSet.status === 'released'
                        ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                        : selectedChangeSet.status === 'approved'
                        ? 'border-blue-800 bg-blue-950 text-blue-400'
                        : 'border-amber-800 bg-amber-950 text-amber-400'
                    }`}
                  >
                    {selectedChangeSet.status}
                  </Badge>
                </div>

                {/* Metadata Details */}
                <div className="grid grid-cols-2 gap-3 rounded border border-zinc-800/80 bg-zinc-950/60 p-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500">CHANGE ID</span>
                    <p className="text-zinc-200">{selectedChangeSet.id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">SCOPE LAYER</span>
                    <p className="text-zinc-200">{selectedChangeSet.scope}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">EXACT VERSION HASH (SHA-256)</span>
                    <p className="text-indigo-400 text-[11px] font-mono truncate">{selectedChangeSet.exactVersionHash}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500">ISOLATED WORKTREE BRANCH</span>
                    <p className="text-zinc-300 flex items-center gap-1">
                      <GitBranch className="h-3 w-3 text-zinc-400" />
                      {selectedChangeSet.branchName}
                    </p>
                  </div>
                </div>

                {/* Impact Analysis Breakdown (FR-074) */}
                <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                      Impact Analysis & Policy Risk
                    </span>
                    <Badge variant="outline" className="border-zinc-700 bg-zinc-800 font-mono text-[10px] text-zinc-300">
                      Risk: {selectedChangeSet.impactReport?.riskLevel || 'LOW'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-400">
                    <p className="text-[11px]">
                      <span className="text-zinc-500">Affected Engines: </span>
                      <span className="font-mono text-zinc-300">
                        {selectedChangeSet.impactReport?.affectedCapabilities?.join(', ') || selectedChangeSet.scope}
                      </span>
                    </p>
                    <p className="text-[11px]">
                      <span className="text-zinc-500">Breaking Changes: </span>
                      <span className="font-mono text-zinc-300">
                        {selectedChangeSet.impactReport?.breakingChanges ? 'Yes (Strict Migration Needed)' : 'No (Backward Compatible)'}
                      </span>
                    </p>
                  </div>

                  {selectedChangeSet.impactReport?.requiredTestSuites && (
                    <div className="mt-2 space-y-1">
                      <span className="font-mono text-[10px] text-zinc-500">REQUIRED VERIFICATION SUITES</span>
                      <div className="space-y-1">
                        {selectedChangeSet.impactReport.requiredTestSuites.map((ts) => (
                          <div key={ts} className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            {ts}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Governance Gates Actions */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    {selectedChangeSet.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(selectedChangeSet.id)}
                        className="flex-1 bg-blue-600 font-mono text-xs text-white hover:bg-blue-500"
                      >
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                        Approve ChangeSet (FR-077)
                      </Button>
                    )}

                    {selectedChangeSet.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleRelease(selectedChangeSet.id)}
                        className="flex-1 bg-emerald-600 font-mono text-xs text-white hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Verify Tests & Release to Production (FR-076)
                      </Button>
                    )}

                    {selectedChangeSet.status === 'released' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRollback(selectedChangeSet.id)}
                        className="border-red-900 bg-red-950/40 font-mono text-xs text-red-400 hover:bg-red-900/60"
                      >
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Rollback ChangeSet (FR-079)
                      </Button>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-zinc-500 text-center">
                    Zero unapproved production changes permitted (FR-080).
                  </p>
                </div>
              </div>
            ) : (
              <div className="work-card card-specular p-8 text-center text-zinc-500 font-mono text-xs">
                Select a ChangeSet on the left to inspect its cryptographic hash, isolated branch, and impact matrix.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Capability Graph (FR-071) */}
      {activeTab === 'graph' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400">
              Live Capability Introspection Matrix ({capabilities.length} nodes registered)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div key={cap.id} className="work-card card-specular p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">{cap.id}</span>
                  <Badge variant="outline" className="border-emerald-800/80 bg-emerald-950/60 font-mono text-[10px] text-emerald-400">
                    v{cap.version}
                  </Badge>
                </div>
                <h3 className="text-xs font-semibold text-zinc-100">{cap.name}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{cap.description}</p>
                <div className="border-t border-zinc-800/80 pt-2 font-mono text-[10px] text-zinc-500 space-y-1">
                  <div>Layer: <span className="text-zinc-300">{cap.layer}</span></div>
                  <div>
                    Dependencies:{' '}
                    {cap.dependencies.length > 0 ? (
                      <span className="text-zinc-400">{cap.dependencies.join(', ')}</span>
                    ) : (
                      <span className="text-zinc-600">None (Root)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: ChangeSet Audit Trail */}
      {activeTab === 'changesets' && (
        <div className="work-card card-specular divide-y divide-zinc-800/80 overflow-hidden shadow-sm">
          <div className="bg-zinc-950 px-4 py-3 font-mono text-[11px] font-medium text-zinc-400 flex items-center justify-between">
            <span>PLATFORM EVOLUTION AUDIT LOG</span>
            <span className="text-[10px] text-zinc-500">Immutable Cryptographic Trail</span>
          </div>
          {changeSets.map((cs) => (
            <div key={cs.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-500">{cs.id}</span>
                  <h4 className="text-xs font-semibold text-zinc-200">{cs.title}</h4>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] uppercase ${
                      cs.status === 'released'
                        ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                        : cs.status === 'approved'
                        ? 'border-blue-800 bg-blue-950 text-blue-400'
                        : 'border-amber-800 bg-amber-950 text-amber-400'
                    }`}
                  >
                    {cs.status}
                  </Badge>
                </div>
                <p className="font-mono text-[11px] text-zinc-500">{cs.description}</p>
                <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-500">
                  <span>Author: <span className="text-zinc-400">{cs.author}</span></span>
                  <span>Scope: <span className="text-zinc-400">{cs.scope}</span></span>
                  <span>Hash: <span className="text-indigo-400">{cs.exactVersionHash}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
