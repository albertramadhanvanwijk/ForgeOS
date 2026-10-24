'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  FolderGit2,
  Bot,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Activity,
  Layers,
  Code2,
  Terminal,
} from 'lucide-react';

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const samplePrompts = [
    'Build a new user notification microservice with Redis and PostgreSQL',
    'Add multi-factor authentication support to the existing auth API',
    'Investigate latency bottlenecks in query indexing layer',
    'Fix failing checkout API where transaction deadlocks cause 500 errors',
  ];

  const handleClassify = async (textToClassify?: string) => {
    const inputPrompt = textToClassify || prompt;
    if (!inputPrompt.trim()) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('http://localhost:3001/api/intent/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error('Failed to classify intent:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero Intent Command Center */}
      <Card className="border-sky-900/40 bg-gradient-to-br from-sky-950/20 via-card to-indigo-950/10 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-400" />
                <CardTitle className="text-xl font-bold tracking-tight">
                  ForgeOS Command Center
                </CardTitle>
              </div>
              <CardDescription className="mt-1 text-sm">
                Transform product intent into empirical, test-proven engineering deliverables with autonomous agents.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-sky-800 bg-sky-950/40 text-sky-400">
                TDD Verification Active
              </Badge>
              <Badge variant="success">
                91 Tests Passing
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input & Action Button */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleClassify()}
              placeholder="Type engineering intent (e.g. 'Build new service...', 'Fix failing test...', 'Add feature...')"
              className="h-11 bg-background/80 text-sm shadow-inner placeholder:text-muted-foreground"
            />
            <Button
              onClick={() => handleClassify()}
              disabled={analyzing}
              className="h-11 px-6 font-semibold"
            >
              {analyzing ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" /> Classifying...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Orchestrate
                </>
              )}
            </Button>
          </div>

          {/* Prompt Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-semibold text-muted-foreground">Try intent:</span>
            {samplePrompts.map((sample) => (
              <button
                key={sample}
                onClick={() => {
                  setPrompt(sample);
                  handleClassify(sample);
                }}
                className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-accent hover:text-white"
              >
                {sample.length > 44 ? sample.substring(0, 42) + '...' : sample}
              </button>
            ))}
          </div>

          {/* Interactive Classification Result */}
          {analysisResult && (
            <div className="rounded-lg border border-sky-800 bg-background/90 p-4 shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🎯</span>
                  <span className="font-bold text-sky-400">
                    Intent Identified: {analysisResult.intentType?.toUpperCase()}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Badge variant="outline" className="border-emerald-800 bg-emerald-950/40 text-emerald-400">
                  Workflow: {analysisResult.suggestedWorkflow}
                </Badge>
              </div>
              <div className="mt-3 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Extracted Goals:</strong> {analysisResult.extractedGoals?.join('; ')}
              </div>
              <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-slate-200">Assigned Roles:</strong> {analysisResult.suggestedRoles?.join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
            <FolderGit2 className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="mt-1 text-xs text-emerald-400">● 100% On Schedule</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Agent Fleet
            </CardTitle>
            <Bot className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 Roles</div>
            <p className="mt-1 text-xs text-sky-400">Orchestrator, Arch, Eng, QA, DevOps, PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Quality Gate Pass Rate
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">100%</div>
            <p className="mt-1 text-xs text-muted-foreground">91/91 Automated Tests Passing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Token & Cost Routing
            </CardTitle>
            <Cpu className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.0042</div>
            <p className="mt-1 text-xs text-sky-400">Multi-Provider Fast/Reasoning Tiers</p>
          </CardContent>
        </Card>
      </div>

      {/* Engineering Lifecycle Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Autonomous Engineering Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {[
              { step: '01', title: 'Intent Classification', role: 'Orchestrator', status: 'Completed', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/20' },
              { step: '02', title: 'Architecture Spec', role: 'Solution Architect', status: 'Active', color: 'text-sky-400 border-sky-800 bg-sky-950/20' },
              { step: '03', title: 'Implementation', role: 'Software Engineer', status: 'Queued', color: 'text-muted-foreground border-border bg-muted/20' },
              { step: '04', title: 'Quality Verification', role: 'QA Engineer', status: 'Pending', color: 'text-muted-foreground border-border bg-muted/20' },
              { step: '05', title: 'Controlled Release', role: 'Policy Engine', status: 'Approval Gate', color: 'text-muted-foreground border-border bg-muted/20' },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-lg border border-border bg-background/50 p-4"
              >
                <div className="text-[10px] font-bold text-muted-foreground">
                  PHASE {s.step}
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">
                  {s.title}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {s.role}
                </div>
                <div className="mt-3">
                  <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${s.color}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Projects Table & Agent Fleet Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Projects Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Active Projects</CardTitle>
              <CardDescription className="text-xs">
                Empirical deliverables tracked across isolated workspaces
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/projects" className="text-xs text-sky-400 hover:text-sky-300">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                id: 'proj-001',
                name: 'ForgeOS Core Engine',
                goal: 'Control plane orchestrator, workflow engine, and persistent memory',
                status: 'active',
                stage: 'Phase 2 Complete',
                tests: '91/91 passed',
              },
              {
                id: 'proj-002',
                name: 'Notification Dispatcher',
                goal: 'High-throughput Redis event queue and multi-channel email/SMS delivery',
                status: 'active',
                stage: 'Quality Verification',
                tests: '18/18 passed',
              },
              {
                id: 'proj-003',
                name: 'Security Audit & RBAC Gate',
                goal: 'Centralized policy authorization and immutable audit logger',
                status: 'completed',
                stage: 'Released',
                tests: '24/24 passed',
              },
            ].map((proj) => (
              <div
                key={proj.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background/50 p-4 transition-colors hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/projects/${proj.id}`}
                      className="font-semibold text-sm text-foreground hover:text-sky-400 hover:underline"
                    >
                      {proj.name}
                    </a>
                    <Badge variant={proj.status === 'active' ? 'success' : 'secondary'} className="text-[10px]">
                      {proj.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {proj.goal}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-sky-400">{proj.stage}</div>
                  <div className="text-[11px] text-muted-foreground">{proj.tests}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Agent Fleet Quick Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Agent Fleet</CardTitle>
              <CardDescription className="text-xs">
                Role capabilities & status
              </CardDescription>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> 6 Online
            </span>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { role: 'Orchestrator', desc: 'Intent classification & DAG synthesis', icon: Sparkles },
              { role: 'Solution Architect', desc: 'Interface design & contract spec', icon: Layers },
              { role: 'Software Engineer', desc: 'TDD implementation & execution', icon: Code2 },
              { role: 'QA Engineer', desc: 'Automated verification suites', icon: ShieldCheck },
              { role: 'DevOps Engineer', desc: 'Isolated worktrees & deployment', icon: Terminal },
              { role: 'Product Manager', desc: 'Requirements & ambiguity checks', icon: Bot },
            ].map((agent) => {
              const Icon = agent.icon;
              return (
                <div
                  key={agent.role}
                  className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sky-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{agent.role}</div>
                    <div className="text-[10px] text-muted-foreground">{agent.desc}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
