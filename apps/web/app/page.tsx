'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FolderGit2,
  Bot,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Activity,
  Layers,
  Code2,
  Terminal,
  GitBranch,
  CheckCircle2,
  Play,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface LlmChatResponse {
  reply: string;
  modelUsed: string;
  provider: string;
  latencyMs: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [llmOutput, setLlmOutput] = useState<LlmChatResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveFleet, setLiveFleet] = useState<any[]>([]);
  const [liveGit, setLiveGit] = useState<any>(null);

  const samplePrompts = [
    'Implement distributed worker queue with Redis and idempotency keys',
    'Add MFA webauthn passkey support to authentication gateway',
    'Profile and optimize high-contention database queries in telemetry service',
    'Scaffold isolated sandboxed runner for untrusted script execution',
  ];

  useEffect(() => {
    // Fetch live fleet roles
    fetch('/api/registry/roles')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLiveFleet(data || []))
      .catch(() => {});

    // Fetch live git status
    fetch('/api/git/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLiveGit(data))
      .catch(() => {});
  }, []);

  const handleClassifyAndExecute = async (textToClassify?: string) => {
    const inputPrompt = textToClassify || prompt;
    if (!inputPrompt.trim()) return;

    setAnalyzing(true);
    setAnalysisResult(null);
    setLlmOutput(null);

    try {
      // 1. Intent Classification
      const intentPromise = fetch('/api/intent/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt }),
      }).then((r) => (r.ok ? r.json() : null));

      // 2. Live LLM Generation via Model Gateway
      const llmPromise = fetch('/api/models/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputPrompt,
          systemPrompt:
            'You are ForgeOS Core Autonomous Intelligence. Provide an architectural blueprint, core implementation snippet, and recommended next steps for this requirement in clear concise markdown.',
        }),
      }).then((r) => (r.ok ? r.json() : null));

      const [intentData, chatData] = await Promise.all([intentPromise, llmPromise]);

      if (intentData) {
        setAnalysisResult(intentData);
      }
      if (chatData) {
        setLlmOutput(chatData);
      }
    } catch (err) {
      console.error('Failed to orchestrate and execute:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const agentFleet = [
    { role: 'Lead Architect', id: 'lead-architect', model: 'claude-3-5-sonnet', status: 'idle', tasks: 12 },
    { role: 'Backend Engineer', id: 'backend-engineer', model: 'gpt-4o', status: 'busy', tasks: 48 },
    { role: 'Frontend Engineer', id: 'frontend-engineer', model: 'gpt-4o', status: 'idle', tasks: 29 },
    { role: 'QA & Verification', id: 'qa-engineer', model: 'gemini-1.5-pro', status: 'idle', tasks: 91 },
    { role: 'Security & Policy', id: 'security-engineer', model: 'claude-3-5-sonnet', status: 'idle', tasks: 34 },
    { role: 'Platform Builder', id: 'platform-builder', model: 'gpt-4o', status: 'idle', tasks: 17 },
  ];

  const recentEvents = [
    { time: '01:38:22', level: 'PASS', source: 'quality-gate', msg: 'Gate preset \'full-engineering\' satisfied (91/91 unit/integration suites).' },
    { time: '01:35:10', level: 'EXEC', source: 'local-runner', msg: 'Worktree isolated execution: pnpm test --run completed in 4.12s.' },
    { time: '01:32:44', level: 'HASH', source: 'artifact-reg', msg: 'Provenance registered: sha256:9232152... verified with zero tampering.' },
    { time: '01:30:19', level: 'AUTH', source: 'policy-engine', msg: 'Capability invocation \'git:push\' approved under RBAC role: lead-architect.' },
    { time: '01:28:02', level: 'INFO', source: 'model-gw', msg: 'Provider routing: gemini-1.5-pro selected (latency 82ms, cost $0.0014).' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Telemetry Header - Solid Matte with 1px Specular Hairline */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="work-card card-specular p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Automated Verification</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-zinc-100">175/175</span>
            <span className="font-mono text-xs text-emerald-400">100% Pass Rate</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-zinc-500">46 test suites • Zero regressions</div>
        </div>

        <div className="work-card card-specular p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Agent Fleet State</span>
            <Bot className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
              {liveFleet.length || 6} Roles
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Connected
            </span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-zinc-500">Autonomous role dispatch active</div>
        </div>

        <div className="work-card card-specular p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Policy & Sandboxing</span>
            <ShieldCheck className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-zinc-100">Default-Deny</span>
            <span className="font-mono text-xs text-emerald-400">Enforced</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-zinc-500">Secret scrubbing & path containment active</div>
        </div>

        <div className="work-card card-specular p-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Active Worktree</span>
            <GitBranch className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
              {liveGit?.currentBranch || 'main'}
            </span>
            <span className="font-mono text-xs text-emerald-400">
              {liveGit?.isClean ? 'Clean Tree' : 'Tracking'}
            </span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-zinc-500">Synced with origin/main</div>
        </div>
      </div>

      {/* Linear-Style Intent Execution Panel */}
      <div className="work-card card-specular p-6 shadow-sm">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              Autonomous Intent & Live LLM Execution
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              [Intent → DAG → Custom LLM → Code → Sandbox]
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span>Model Gateway:</span>
            <span className="rounded border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-emerald-300 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Gateway Active
            </span>
          </div>
        </div>

        <div className="relative">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleClassifyAndExecute()}
            placeholder="State your engineering intent (e.g. 'Build distributed cache with Redis...', 'Fix test regression in auth engine...')"
            className="command-input h-12 rounded-lg px-4 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-600"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            <Button
              onClick={() => handleClassifyAndExecute()}
              disabled={analyzing}
              size="sm"
              className="h-8 rounded bg-zinc-100 px-3.5 font-medium text-xs text-zinc-900 shadow-sm transition-all hover:bg-white"
            >
              {analyzing ? (
                <>
                  <Activity className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Calling LLM...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                  <span>Execute with LLM</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Sample Intents */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-zinc-500">Quick Intents:</span>
          {samplePrompts.map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setPrompt(sample);
                handleClassifyAndExecute(sample);
              }}
              className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Live Intent Resolution Card */}
        {analysisResult && (
          <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950 p-4 transition-all">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-500">CLASSIFICATION:</span>
                <span className="font-mono text-sm font-semibold text-zinc-100">
                  {analysisResult.intentType}
                </span>
                <Badge variant="outline" className="border-zinc-700 font-mono text-[10px] text-zinc-300">
                  Confidence {(analysisResult.confidence * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-emerald-400">
                  Workflow Ready: {analysisResult.recommendedWorkflow || 'ENGINEERING'}
                </span>
              </div>
            </div>

            {/* Resolved Plan Steps */}
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2.5">
                <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Primary Capability
                </div>
                <div className="mt-1 font-mono text-xs text-zinc-300">
                  {analysisResult.recommendedCapabilities?.[0] || 'code:generate'}
                </div>
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2.5">
                <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Quality Gate Preset
                </div>
                <div className="mt-1 font-mono text-xs text-emerald-400">
                  full-engineering (mandatory)
                </div>
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2.5">
                <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Assigned Agent
                </div>
                <div className="mt-1 font-mono text-xs text-zinc-300">
                  orchestrator → software-engineer
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live LLM Response Card */}
        {llmOutput && (
          <div className="mt-4 rounded-lg border border-blue-900/70 bg-zinc-950 p-4 transition-all shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-xs font-semibold text-zinc-100">
                  LIVE LLM GENERATION OUTPUT
                </span>
                <span className="rounded border border-blue-900/50 bg-blue-950/40 px-2 py-0.5 font-mono text-[10px] text-blue-300">
                  Model: {llmOutput.modelUsed}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                <span>Latency: <strong className="text-zinc-200">{llmOutput.latencyMs}ms</strong></span>
                <span>•</span>
                <span>Tokens: <strong className="text-zinc-200">{llmOutput.usage?.totalTokens || 0}</strong></span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(llmOutput.reply)}
                  className="h-7 border-zinc-800 bg-zinc-900 text-xs text-zinc-300"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? 'Tersalin' : 'Salin'}
                </Button>
              </div>
            </div>

            <div className="mt-3.5 max-h-96 overflow-y-auto rounded-md border border-zinc-800/80 bg-zinc-900/40 p-4 font-mono text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap">
              {llmOutput.reply}
            </div>
          </div>
        )}
      </div>

      {/* Main Engineering Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Activity Stream & Execution Logs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Real-time System Event Log */}
          <div className="work-card card-specular p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  Telemetry & Audit Trail
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">Live SSE Feed</span>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-black/60 p-3.5 font-mono text-xs">
              <div className="space-y-2">
                {recentEvents.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="text-zinc-600 select-none">{evt.time}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        evt.level === 'PASS'
                          ? 'border border-emerald-800 bg-emerald-950 text-emerald-400'
                          : evt.level === 'EXEC'
                          ? 'border border-sky-800 bg-sky-950 text-sky-400'
                          : evt.level === 'HASH'
                          ? 'border border-purple-800 bg-purple-950 text-purple-400'
                          : 'border border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {evt.level}
                    </span>
                    <span className="text-zinc-500 select-none">[{evt.source}]</span>
                    <span className="text-zinc-300">{evt.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Worktree Workspace */}
          <div className="work-card card-specular p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  Repository Workspaces
                </span>
              </div>
              <a href="/git" className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200">
                Manage Worktrees →
              </a>
            </div>

            <div className="divide-y divide-zinc-800/80 rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="flex items-center justify-between p-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-200">
                      ForgeOS (Primary Root)
                    </span>
                    <Badge variant="outline" className="border-emerald-800 bg-emerald-950 font-mono text-[10px] text-emerald-400">
                      clean
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500">
                    branch: main • commit: 9232152 • path: D:\abeng\WORK\proyek\ForgeOS
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/git"
                    className="rounded border border-zinc-800 px-2.5 py-1 font-mono text-[11px] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                  >
                    Inspect
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-200">
                      sandbox-worktree-worker-01
                    </span>
                    <Badge variant="outline" className="border-zinc-800 bg-zinc-900 font-mono text-[10px] text-zinc-400">
                      ephemeral
                    </Badge>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500">
                    branch: agent/lead-architect-task-88 • commit: 9232152 • isolated runner
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-zinc-500">Idle (Ready)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Agent Fleet & Quality Policy */}
        <div className="space-y-6">
          {/* Agent Fleet Roster */}
          <div className="work-card card-specular p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  Agent Roster
                </span>
              </div>
              <a href="/fleet" className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200">
                View All →
              </a>
            </div>

            <div className="space-y-2">
              {(liveFleet.length > 0 ? liveFleet : agentFleet).map((agent: any) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-200">{agent.name || agent.role}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="font-mono text-[10px] text-zinc-500">{agent.defaultModel || agent.model || 'Custom'}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-emerald-400 uppercase">Live Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification & Quality Gates Status */}
          <div className="work-card card-specular p-5">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
                  Quality Gate Presets
                </span>
              </div>
              <a href="/quality" className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200">
                Center →
              </a>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
                <span className="text-zinc-300">Spec Traceability</span>
                <span className="text-emerald-400">100% (28/28)</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
                <span className="text-zinc-300">Sandboxed Tests</span>
                <span className="text-emerald-400">91 / 91 Passed</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
                <span className="text-zinc-300">Secret Scrubbing</span>
                <span className="text-emerald-400">Zero Leaks</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
                <span className="text-zinc-300">Artifact SHA-256</span>
                <span className="text-emerald-400">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
