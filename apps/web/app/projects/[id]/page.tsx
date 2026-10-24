import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Workflow, FileCode2, ShieldCheck, Sparkles, CheckCircle2, Play } from 'lucide-react';

export default function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <a href="/projects" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </a>
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">ForgeOS Core Engine</h1>
            <p className="text-xs text-zinc-500 font-mono">Workspace ID: {params.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-800 bg-emerald-950 font-mono text-[10px] text-emerald-400">
              Phase 2 Verified
            </Badge>
            <Button size="sm" className="gap-1.5 bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white">
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Run Stage</span>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-zinc-900/60 border border-zinc-800 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="tasks">Plan & Tasks (DAG)</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts & Deliverables</TabsTrigger>
          <TabsTrigger value="quality">Quality Gates</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="work-card card-specular p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">Active Engineering Overview</h2>
              <p className="text-xs text-zinc-400">
                Autonomous agents are currently executing tasks defined in the workflow graph.
              </p>
            </div>
            <div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Bot className="h-4 w-4 text-sky-400" />
                    <span>Assigned Agent Fleet</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-zinc-100">4 Roles Active</div>
                  <div className="mt-1 text-[11px] text-zinc-500 font-mono">Architect, Engineer, QA, DevOps</div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Workflow className="h-4 w-4 text-emerald-400" />
                    <span>Workflow Progression</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-emerald-400">Phase 2 Completed</div>
                  <div className="mt-1 text-[11px] text-zinc-500 font-mono">DAG Task Resolution 100%</div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <FileCode2 className="h-4 w-4 text-indigo-400" />
                    <span>Artifacts Generated</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-zinc-100">6 Immutable Versions</div>
                  <div className="mt-1 text-[11px] text-zinc-500 font-mono">SHA-256 Provenance Tracked</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Conversation */}
        <TabsContent value="conversation" className="space-y-4">
          <div className="work-card card-specular p-5 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Conversational Orchestrator</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Multi-turn intent analysis and ambiguity resolution (FR-003–FR-007)
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-xs text-zinc-300">
                <span className="font-semibold text-zinc-100">User:</span> Build a high-throughput notification microservice with tests.
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3.5 text-xs text-zinc-200">
                <span className="font-semibold text-emerald-400">Orchestrator:</span> Identified intent as <strong>CREATE</strong> (95% confidence). Synthesized 4-task DAG with Solution Architect, Software Engineer, QA Engineer, and DevOps Engineer.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Tasks DAG */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="work-card card-specular p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">Task Graph & Dependencies</h2>
              <p className="text-xs text-zinc-400">Ordered DAG tasks with assigned roles and status</p>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Architecture & Interface Specification', role: 'Solution Architect', status: 'completed' },
                { name: 'Production Core Implementation', role: 'Software Engineer', status: 'completed' },
                { name: 'Comprehensive Quality & Verification Suite', role: 'QA Engineer', status: 'completed' },
                { name: 'Release Packaging & Worktree Merge', role: 'DevOps Engineer', status: 'completed' },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-zinc-200">{t.name}</span>
                    <span className="text-zinc-500 font-mono text-[11px]">• {t.role}</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-800 bg-emerald-950 font-mono text-[10px] text-emerald-400">
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Artifacts */}
        <TabsContent value="artifacts" className="space-y-4">
          <div className="work-card card-specular p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">Artifact Registry</h2>
              <p className="text-xs text-zinc-400">Versioned deliverables with cryptographic integrity (FR-030–FR-036)</p>
            </div>
            <div className="space-y-2.5">
              {[
                { title: 'target_architecture.md', type: 'document', hash: 'e3b0c44298fc1c149afbf4c8996fb924', version: 'v1' },
                { title: 'source_code_bundle.tar.gz', type: 'code', hash: 'ca978112ca1bbdcafac231b39a23dc4b', version: 'v2' },
                { title: 'verification_report.json', type: 'test_report', hash: '3e23e8160039594a33894f6564e1b134', version: 'v1' },
              ].map((art) => (
                <div key={art.title} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-200">{art.title}</span>
                    <div className="font-mono text-[11px] text-zinc-500">SHA-256: {art.hash}</div>
                  </div>
                  <Badge variant="outline" className="border-zinc-800 bg-zinc-900 font-mono text-[10px] text-zinc-300">
                    {art.version}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Quality */}
        <TabsContent value="quality" className="space-y-4">
          <div className="work-card card-specular p-5 shadow-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Quality & Policy Gate Audit</h2>
              </div>
              <p className="text-xs text-zinc-400">Empirical verification status before release (FR-060–FR-063)</p>
            </div>
            <div>
              <div className="rounded-lg border border-emerald-800 bg-emerald-950/60 p-4 text-xs text-emerald-300 font-mono">
                ✓ All 91 automated tests passing. Zero mandatory violations. Release gate clearance: <strong>GRANTED</strong>.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
