'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FolderGit2,
  GitBranch,
  Terminal,
  CheckCircle2,
  Clock,
  Play,
  FileCode2,
  Palette,
  ShieldCheck,
  Send,
  Layers,
  ChevronRight,
  Code2,
  Sparkles,
  ArrowLeft,
  Check,
  Copy,
} from 'lucide-react';

interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

const SAMPLE_PROJECT_FILES: Record<string, GeneratedFile[]> = {
  default: [
    {
      path: 'src/app/page.tsx',
      language: 'tsx',
      content: `import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeatureGrid } from '@/components/FeatureGrid';
import { PricingCards } from '@/components/PricingCards';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0d0d10] text-[#fafafa]">
      <Navbar brandName="AcmeCloud" />
      <HeroSection 
        headline="Accelerate your workflow with AI multi-agents"
        subtitle="Automate fullstack architecture, design systems, and verified software releases."
      />
      <FeatureGrid />
      <PricingCards />
      <Footer />
    </main>
  );
}`,
    },
    {
      path: 'src/components/HeroSection.tsx',
      language: 'tsx',
      content: `import React from 'react';

interface HeroProps {
  headline: string;
  subtitle: string;
}

export function HeroSection({ headline, subtitle }: HeroProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-400">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        v2.2 Production Engine Live
      </div>
      <h1 className="mt-6 font-mono text-4xl sm:text-6xl font-bold tracking-tight text-zinc-100">
        {headline}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400">
        {subtitle}
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <button className="rounded-md bg-zinc-100 px-5 py-2.5 font-mono text-xs font-semibold text-zinc-950 transition-colors hover:bg-white">
          Get Started Free
        </button>
        <button className="rounded-md border border-zinc-800 bg-zinc-900/80 px-5 py-2.5 font-mono text-xs font-medium text-zinc-300 hover:bg-zinc-800">
          Documentation →
        </button>
      </div>
    </section>
  );
}`,
    },
    {
      path: 'src/components/Navbar.tsx',
      language: 'tsx',
      content: `import React from 'react';

export function Navbar({ brandName }: { brandName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0d0d10]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-blue-500" />
          <span className="font-mono text-sm font-bold text-zinc-100">{brandName}</span>
        </div>
        <nav className="flex items-center gap-6 font-mono text-xs text-zinc-400">
          <a href="#features" className="hover:text-zinc-200">Features</a>
          <a href="#pricing" className="hover:text-zinc-200">Pricing</a>
          <a href="#docs" className="hover:text-zinc-200">Docs</a>
        </nav>
      </div>
    </header>
  );
}`,
    },
    {
      path: 'tailwind.config.js',
      language: 'javascript',
      content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d0d10',
        surface: '#18181b',
        primary: '#3b82f6',
        border: '#27272a',
      },
    },
  },
};`,
    },
  ],
};

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'proj-001';

  const [activeTab, setActiveTab] = useState<'timeline' | 'code' | 'design' | 'quality'>('code');
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [commandLogs, setCommandLogs] = useState<Array<{ role: string; text: string; time: string }>>([
    { role: 'Orchestrator', text: 'Autonomous multi-agent workspace initialized for ' + projectId, time: '02:40:12' },
    { role: 'Architect Agent', text: 'Derived 4 user flows & canonical PRD requirements.', time: '02:40:15' },
    { role: 'Designer Agent', text: 'Design Studio generated token contract & exact version hash 8f3a1...c', time: '02:40:22' },
    { role: 'Engineering Agent', text: 'Scaffolded 4 clean Next.js/Tailwind components adhering strictly to design tokens.', time: '02:40:35' },
    { role: 'QA Agent', text: 'Quality gate verified: 0 rogue hex colors, 100% WCAG contrast, all unit tests passed.', time: '02:40:48' },
  ]);

  const files = SAMPLE_PROJECT_FILES.default;
  const currentFile = files[selectedFileIdx] || files[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const newLog = {
      role: 'Developer',
      text: commandInput,
      time: new Date().toLocaleTimeString(),
    };
    const agentAck = {
      role: 'Fleet Orchestrator',
      text: `Task received: "${commandInput}". Dispatching to Engineering & QA agents in worktree...`,
      time: new Date().toLocaleTimeString(),
    };

    setCommandLogs((prev) => [...prev, newLog, agentAck]);
    setCommandInput('');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Projects</span>
            </button>
            <span>/</span>
            <span className="text-zinc-200">{projectId}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Project Multi-Agent Workspace
            </h1>
            <Badge
              variant="outline"
              className="border-emerald-800 bg-emerald-950 font-mono text-[10px] text-emerald-400"
            >
              ACTIVE FLEET
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">
            Automated website creation powered by Architect, Designer, Engineer, and QA agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[11px] text-zinc-300">
            <GitBranch className="h-3.5 w-3.5 text-blue-400" />
            <span>feature/{projectId}-scaffold</span>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveTab('quality')}
            className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            <span>Quality Status</span>
          </Button>
        </div>
      </div>

      {/* Multi-Agent Fleet Status Ribbon */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Architect Agent */}
        <div className="work-card card-specular p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-medium">
              Architect Agent
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-100">PRD & User Flows</p>
          <p className="text-[11px] text-zinc-400 font-mono">4 flows derived (FR-050)</p>
        </div>

        {/* Designer Agent */}
        <div className="work-card card-specular p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-purple-400 font-medium">
              Designer Agent
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-100">Design Studio</p>
          <p className="text-[11px] text-zinc-400 font-mono">SHA-256 locked tokens (FR-051)</p>
        </div>

        {/* Engineering Agent */}
        <div className="work-card card-specular p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
              Engineering Agent
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-100">Code Generation</p>
          <p className="text-[11px] text-zinc-400 font-mono">4 components scaffolded</p>
        </div>

        {/* QA Agent */}
        <div className="work-card card-specular p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-medium">
              QA & Verifier
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-100">Quality Gates</p>
          <p className="text-[11px] text-zinc-400 font-mono">100% token compliance (FR-055)</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors ${
            activeTab === 'code'
              ? 'border-zinc-200 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5" />
          <span>Generated Code & Deliverables</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors ${
            activeTab === 'timeline'
              ? 'border-zinc-200 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Execution DAG & Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors ${
            activeTab === 'design'
              ? 'border-zinc-200 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Design Studio Tokens</span>
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors ${
            activeTab === 'quality'
              ? 'border-zinc-200 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Quality & Evidence</span>
        </button>
      </div>

      {/* Tab 1: Code Files & Deliverables */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* File Tree */}
          <div className="work-card card-specular p-3 space-y-1 lg:col-span-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1 block">
              Project Deliverables
            </span>
            <div className="space-y-0.5">
              {files.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full flex items-center justify-between rounded px-2.5 py-2 font-mono text-xs transition-colors text-left ${
                    selectedFileIdx === idx
                      ? 'bg-zinc-800 text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode2 className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="work-card card-specular flex flex-col overflow-hidden lg:col-span-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{currentFile.path}</span>
                <span className="text-zinc-600">({currentFile.language})</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[11px] text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300 bg-[#0a0a0d]">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Execution DAG & Logs */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {[
              { step: '1', title: 'Intent & PRD', status: 'completed', desc: 'Requirements & Flows' },
              { step: '2', title: 'Design Studio', status: 'completed', desc: 'Tokens & Hash Lock' },
              { step: '3', title: 'Scaffolding', status: 'completed', desc: 'Isolated Worktree' },
              { step: '4', title: 'Sandboxed Build', status: 'completed', desc: 'Runner & Lint' },
              { step: '5', title: 'QA Gates', status: 'completed', desc: 'Visual & Unit Tests' },
            ].map((node) => (
              <div key={node.step} className="work-card card-specular p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-zinc-500">STEP 0{node.step}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <p className="font-mono text-xs font-semibold text-zinc-200">{node.title}</p>
                <p className="text-[11px] text-zinc-400">{node.desc}</p>
              </div>
            ))}
          </div>

          <div className="work-card card-specular overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-2.5 font-mono text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Live Autonomous Multi-Agent Stream</span>
              </div>
              <span className="text-[10px] text-zinc-500">5 events recorded</span>
            </div>
            <div className="divide-y divide-zinc-900 p-4 font-mono text-xs space-y-2">
              {commandLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 pt-2">
                  <span className="text-zinc-600 text-[10px] shrink-0 pt-0.5">{log.time}</span>
                  <span className="rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300 shrink-0">
                    {log.role}
                  </span>
                  <span className="text-zinc-300 leading-relaxed">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Design Studio & Tokens */}
      {activeTab === 'design' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="work-card card-specular p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Semantic Color Tokens</span>
                <span className="font-mono text-[10px] text-zinc-500">WCAG AAA compliant</span>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 p-2">
                  <div className="h-4 w-4 rounded border border-zinc-700 bg-[#0d0d10]" />
                  <span className="text-zinc-300">bg (#0d0d10)</span>
                </div>
                <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 p-2">
                  <div className="h-4 w-4 rounded border border-zinc-700 bg-[#18181b]" />
                  <span className="text-zinc-300">surface (#18181b)</span>
                </div>
                <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 p-2">
                  <div className="h-4 w-4 rounded border border-zinc-700 bg-[#3b82f6]" />
                  <span className="text-zinc-300">primary (#3b82f6)</span>
                </div>
                <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 p-2">
                  <div className="h-4 w-4 rounded border border-zinc-700 bg-[#fafafa]" />
                  <span className="text-zinc-300">text (#fafafa)</span>
                </div>
              </div>
            </div>

            <div className="work-card card-specular p-4 space-y-3">
              <span className="text-xs font-semibold text-zinc-200">Exact Version Hash Lock (FR-053)</span>
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>SPECIFICATION ID</span>
                  <span className="text-emerald-400">APPROVED</span>
                </div>
                <p className="text-[11px] text-zinc-300 break-all">
                  SHA-256: 8f3a1cb2e48719de023fa871b65089e13d9a1094ba9881fa6d0371
                </p>
                <p className="text-[10px] text-zinc-500">
                  Engineering code generation automatically verifies adherence against this exact hash before writing files.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Quality & Test Evidence */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="work-card card-specular p-4">
              <span className="text-[11px] font-medium text-zinc-400">Unit & Integration Tests</span>
              <div className="mt-1.5 font-mono text-xl font-bold text-emerald-400">100% Passed</div>
              <span className="font-mono text-[10px] text-zinc-500">29 test files, 119 tests</span>
            </div>
            <div className="work-card card-specular p-4">
              <span className="text-[11px] font-medium text-zinc-400">Visual Token Compliance</span>
              <div className="mt-1.5 font-mono text-xl font-bold text-zinc-100">0 Violations</div>
              <span className="font-mono text-[10px] text-zinc-500">No rogue unapproved hex codes</span>
            </div>
            <div className="work-card card-specular p-4">
              <span className="text-[11px] font-medium text-zinc-400">Security & Sandboxed Runner</span>
              <div className="mt-1.5 font-mono text-xl font-bold text-emerald-400">Enforced</div>
              <span className="font-mono text-[10px] text-zinc-500">Allowlist policy verified</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Developer Interactive Command Bar */}
      <div className="work-card card-specular p-4">
        <form onSubmit={handleSendCommand} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 shrink-0">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Command the multi-agent team (e.g. 'Add a testimonial carousel', 'Change primary button style', 'Run security audit')..."
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white shrink-0"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            <span>Command Fleet</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
