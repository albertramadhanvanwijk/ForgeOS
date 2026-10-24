import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Bot, Workflow, FileCode2, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <a href="/projects" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-sky-400">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </a>
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">ForgeOS Core Engine</h1>
            <p className="text-xs text-muted-foreground font-mono">Workspace ID: {params.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Phase 2 Verified</Badge>
            <Button size="sm">⚡ Run Stage</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="tasks">Plan & Tasks (DAG)</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts & Deliverables</TabsTrigger>
          <TabsTrigger value="quality">Quality Gates</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Active Engineering Overview</CardTitle>
              <CardDescription className="text-xs">
                Autonomous agents are currently executing tasks defined in the workflow graph.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Bot className="h-4 w-4 text-sky-400" />
                    <span>Assigned Agent Fleet</span>
                  </div>
                  <div className="mt-2 text-xl font-bold">4 Roles Active</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Architect, Engineer, QA, DevOps</div>
                </div>

                <div className="rounded-lg border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Workflow className="h-4 w-4 text-emerald-400" />
                    <span>Workflow Progression</span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-emerald-400">Phase 2 Completed</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">DAG Task Resolution 100%</div>
                </div>

                <div className="rounded-lg border border-border bg-background/50 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileCode2 className="h-4 w-4 text-indigo-400" />
                    <span>Artifacts Generated</span>
                  </div>
                  <div className="mt-2 text-xl font-bold">6 Immutable Versions</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">SHA-256 Provenance Tracked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Conversation */}
        <TabsContent value="conversation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <CardTitle className="text-base font-semibold">Conversational Orchestrator</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Multi-turn intent analysis and ambiguity resolution (FR-003–FR-007)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-background/60 p-3.5 text-xs text-slate-300">
                <span className="font-semibold text-sky-400">User:</span> Build a high-throughput notification microservice with tests.
              </div>
              <div className="rounded-lg border border-sky-900/50 bg-sky-950/20 p-3.5 text-xs text-slate-200">
                <span className="font-semibold text-emerald-400">Orchestrator:</span> Identified intent as <strong>CREATE</strong> (95% confidence). Synthesized 4-task DAG with Solution Architect, Software Engineer, QA Engineer, and DevOps Engineer.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Tasks DAG */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Task Graph & Dependencies</CardTitle>
              <CardDescription className="text-xs">
                Ordered DAG tasks with assigned roles and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Architecture & Interface Specification', role: 'Solution Architect', status: 'completed' },
                { name: 'Production Core Implementation', role: 'Software Engineer', status: 'completed' },
                { name: 'Comprehensive Quality & Verification Suite', role: 'QA Engineer', status: 'completed' },
                { name: 'Release Packaging & Worktree Merge', role: 'DevOps Engineer', status: 'completed' },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-foreground">{t.name}</span>
                    <span className="text-muted-foreground">• {t.role}</span>
                  </div>
                  <Badge variant="success" className="text-[10px]">{t.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Artifacts */}
        <TabsContent value="artifacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Artifact Registry</CardTitle>
              <CardDescription className="text-xs">
                Versioned deliverables with cryptographic integrity (FR-030–FR-036)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'target_architecture.md', type: 'document', hash: 'e3b0c44298fc1c149afbf4c8996fb924', version: 'v1' },
                { title: 'source_code_bundle.tar.gz', type: 'code', hash: 'ca978112ca1bbdcafac231b39a23dc4b', version: 'v2' },
                { title: 'verification_report.json', type: 'test_report', hash: '3e23e8160039594a33894f6564e1b134', version: 'v1' },
              ].map((art) => (
                <div key={art.title} className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-3 text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{art.title}</span>
                    <div className="font-mono text-[11px] text-muted-foreground">SHA-256: {art.hash}</div>
                  </div>
                  <Badge variant="outline">{art.version}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Quality */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-base font-semibold">Quality & Policy Gate Audit</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Empirical verification status before release (FR-060–FR-063)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-4 text-xs text-emerald-300">
                ✓ All 91 automated tests passing. Zero mandatory violations. Release gate clearance: <strong>GRANTED</strong>.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
