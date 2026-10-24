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
  ExternalLink,
  Download,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { LivePreviewCanvas } from '@/components/project/LivePreviewCanvas';

interface GeneratedFile {
  path: string;
  language: string;
  content: string;
}

const INITIAL_PROJECT_FILES: GeneratedFile[] = [
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
      <Navbar brandName="AcmeStore" />
      <HeroSection 
        headline="The Next-Gen SaaS & E-Commerce Platform"
        subtitle="Designed with strict token compliance, zero design drift, and verified by autonomous quality gates."
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
        <button className="rounded-md bg-blue-600 px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
          Buy Now ($49)
        </button>
        <button className="rounded-md border border-zinc-800 bg-zinc-900/80 px-5 py-2.5 font-mono text-xs font-medium text-zinc-300 hover:bg-zinc-800">
          Explore Demo →
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
];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'proj-ecommerce-01';

  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'timeline' | 'design' | 'quality'>('preview');
  const [files, setFiles] = useState<GeneratedFile[]>(INITIAL_PROJECT_FILES);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedBranch, setCopiedBranch] = useState(false);
  const [specApproved, setSpecApproved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [activeSections, setActiveSections] = useState<string[]>([]);

  const [commandLogs, setCommandLogs] = useState<Array<{ role: string; text: string; time: string }>>([
    { role: 'Orchestrator', text: `Autonomous multi-agent workspace initialized for ${projectId}`, time: '02:40:12' },
    { role: 'Architect Agent', text: 'Derived 4 user flows & canonical PRD requirements.', time: '02:40:15' },
    { role: 'Designer Agent', text: 'Design Studio generated token contract & exact version hash 8f3a1...c', time: '02:40:22' },
    { role: 'Engineering Agent', text: 'Scaffolded 4 clean Next.js/Tailwind components adhering strictly to design tokens.', time: '02:40:35' },
    { role: 'QA Agent', text: 'Quality gate verified: 0 rogue hex colors, 100% WCAG contrast, all unit tests passed.', time: '02:40:48' },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentFile = files[selectedFileIdx] || files[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    showToast(`Copied ${currentFile.path} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBranch = () => {
    const cmd = `git checkout -b feature/${projectId}-scaffold`;
    navigator.clipboard.writeText(cmd);
    setCopiedBranch(true);
    showToast(`Copied command: ${cmd}`);
    setTimeout(() => setCopiedBranch(false), 2000);
  };

  const handleOpenVSCode = () => {
    const url = `vscode://file/D:/abeng/WORK/proyek/ForgeOS/runtime-data/projects/${projectId}`;
    window.open(url, '_blank');
    showToast('Triggering VS Code to open project directory...');
  };

  const handleExportZip = () => {
    const bundleData = JSON.stringify(files, null, 2);
    const blob = new Blob([bundleData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectId}-deliverables.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${files.length} project files`);
  };

  const handleApproveSpec = () => {
    setSpecApproved(true);
    showToast('Design Spec approved! Exact SHA-256 hash locked for engineering fleet.');
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isProcessingCommand) return;

    const prompt = commandInput.trim();
    setCommandInput('');
    setIsProcessingCommand(true);

    const now = () => new Date().toLocaleTimeString();

    // Log developer prompt
    setCommandLogs((prev) => [
      ...prev,
      { role: 'Developer', text: prompt, time: now() },
      { role: 'Orchestrator', text: `Analyzing intent: "${prompt}". Dispatching to Fleet Agents...`, time: now() },
    ]);

    // Simulate multi-agent chain
    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let newSectionName = '';

      if (lower.includes('contact') || lower.includes('kontak') || lower.includes('pesan') || lower.includes('form')) {
        newSectionName = 'contact';
        const contactFile: GeneratedFile = {
          path: 'src/components/ContactForm.tsx',
          language: 'tsx',
          content: `import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="border-t border-zinc-800 px-6 py-12 bg-zinc-950/60">
      <div className="max-w-md mx-auto text-center">
        <Mail className="h-6 w-6 text-blue-400 mx-auto mb-2" />
        <h2 className="font-mono text-lg font-bold text-white">Get in Touch</h2>
        <p className="text-xs text-zinc-400 mt-1">Our engineering team responds within 2 hours</p>
        {sent ? (
          <div className="mt-4 p-3 rounded bg-emerald-950/60 border border-emerald-800 text-xs font-mono text-emerald-400">
            ✓ Message received!
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-4 space-y-3">
            <input type="email" required placeholder="your@email.com" className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white" />
            <textarea rows={2} required placeholder="Requirements..." className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white" />
            <button type="submit" className="w-full rounded bg-zinc-100 py-2 font-mono text-xs font-semibold text-zinc-950 hover:bg-white flex items-center justify-center gap-1">
              <Send className="h-3 w-3" /> Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}`,
        };
        setFiles((f) => [contactFile, ...f]);
        setSelectedFileIdx(0);
        if (!activeSections.includes('contact')) {
          setActiveSections((s) => [...s, 'contact']);
        }
      } else if (lower.includes('testimonial') || lower.includes('review') || lower.includes('testimoni')) {
        newSectionName = 'testimonials';
        const testFile: GeneratedFile = {
          path: 'src/components/Testimonials.tsx',
          language: 'tsx',
          content: `import React from 'react';

export function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-zinc-800 px-6 py-12 bg-zinc-900/30">
      <div className="text-center mb-6">
        <span className="font-mono text-[10px] text-purple-400 uppercase tracking-widest font-semibold">Customer Stories</span>
        <h2 className="font-mono text-xl font-bold text-white mt-1">Loved by 10,000+ Developers</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4">
          <div className="text-amber-400 text-xs mb-1">★★★★★</div>
          <p className="text-xs text-zinc-300">"ForgeOS cut our product launch time from 3 months down to 4 days."</p>
        </div>
      </div>
    </section>
  );
}`,
        };
        setFiles((f) => [testFile, ...f]);
        setSelectedFileIdx(0);
        if (!activeSections.includes('testimonials')) {
          setActiveSections((s) => [...s, 'testimonials']);
        }
      } else {
        const customFile: GeneratedFile = {
          path: `src/components/CustomFeature_${Date.now().toString().slice(-4)}.tsx`,
          language: 'tsx',
          content: `// Generated for prompt: "${prompt}"
import React from 'react';

export function CustomFeature() {
  return (
    <div className="p-4 rounded border border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-200">
      <h3 className="font-bold text-white">${prompt}</h3>
      <p className="text-zinc-400 mt-1">Implemented autonomously by Engineering Fleet with design token conformance.</p>
    </div>
  );
}`,
        };
        setFiles((f) => [customFile, ...f]);
        setSelectedFileIdx(0);
      }

      setCommandLogs((prev) => [
        ...prev,
        { role: 'Architect Agent', text: `Requirements & state flow validated for "${prompt}".`, time: now() },
        { role: 'Designer Agent', text: 'Checked token contrast and component variant contract.', time: now() },
        { role: 'Engineering Agent', text: 'Written new component file into project worktree.', time: now() },
        { role: 'QA Agent', text: 'Vitest pass & visual token compliance verified (0 violations).', time: now() },
      ]);

      setIsProcessingCommand(false);
      showToast('Component generated & Live Preview updated!');
    }, 900);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header & Breadcrumb */}
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
            <span className="text-zinc-200 font-semibold">{projectId}</span>
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
            Autonomous website construction & verification powered by Architect, Designer, Engineer, and QA agents.
          </p>
        </div>

        {/* Developer Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyBranch}
            title="Copy git checkout command"
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 font-mono text-[11px] text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <GitBranch className="h-3.5 w-3.5 text-blue-400" />
            <span>{copiedBranch ? 'Branch Copied!' : `feature/${projectId}`}</span>
          </button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenVSCode}
            className="border-zinc-800 font-mono text-xs text-zinc-300 hover:bg-zinc-900 hover:text-white"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
            <span>Open in VS Code</span>
          </Button>

          <Button
            size="sm"
            onClick={handleExportZip}
            className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            <span>Export Code</span>
          </Button>
        </div>
      </div>

      {/* Multi-Agent Fleet Status Ribbon */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="work-card card-specular p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-purple-400 font-medium">
              Designer Agent
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-100">Design Studio</p>
          <p className="text-[11px] text-zinc-400 font-mono">
            {specApproved ? 'Status: APPROVED (Locked)' : 'SHA-256 tokens ready (FR-051)'}
          </p>
        </div>

        <div className="work-card card-specular p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
              Engineering Agent
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-100">Code Generation</p>
          <p className="text-[11px] text-zinc-400 font-mono">{files.length} components scaffolded</p>
        </div>

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
      <div className="flex overflow-x-auto border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Live Web Preview</span>
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'code'
              ? 'border-zinc-200 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode2 className="h-3.5 w-3.5" />
          <span>Generated Code ({files.length} files)</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
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
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'quality'
              ? 'border-zinc-200 text-zinc-100'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Quality & Evidence</span>
        </button>
      </div>

      {/* Tab: Live Web Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <p>
              Interactive browser rendering of website components created by autonomous multi-agent fleet.
            </p>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Hot Reload Active
            </span>
          </div>
          <LivePreviewCanvas activeSections={activeSections} brandName="AcmeStore" />
        </div>
      )}

      {/* Tab: Generated Code & Deliverables */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="work-card card-specular p-3 space-y-1 lg:col-span-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1 block">
              Deliverables ({files.length})
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
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-zinc-300 bg-[#0a0a0d] max-h-[500px]">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Execution DAG & Logs */}
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
              <span className="text-[10px] text-zinc-500">{commandLogs.length} events recorded</span>
            </div>
            <div className="divide-y divide-zinc-900 p-4 font-mono text-xs space-y-2 max-h-[350px] overflow-y-auto">
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

      {/* Tab: Design Studio & Tokens */}
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Exact Version Hash Lock (FR-053)</span>
                {specApproved ? (
                  <Badge variant="outline" className="border-emerald-800 bg-emerald-950 font-mono text-[10px] text-emerald-400">
                    APPROVED
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleApproveSpec}
                    className="bg-emerald-600 font-mono text-[11px] text-white hover:bg-emerald-500 h-6 px-2.5"
                  >
                    Approve Spec
                  </Button>
                )}
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>SPECIFICATION ID</span>
                  <span className={specApproved ? 'text-emerald-400' : 'text-amber-400'}>
                    {specApproved ? 'LOCKED & BOUND' : 'AWAITING APPROVAL'}
                  </span>
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

      {/* Tab: Quality & Test Evidence */}
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
            disabled={isProcessingCommand}
            placeholder="Command the multi-agent team (try: 'Tambahkan formulir kontak', 'Tambahkan testimoni', 'Ubah tema tombol')..."
            className="flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isProcessingCommand}
            className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white shrink-0"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            <span>{isProcessingCommand ? 'Dispatching Fleet...' : 'Command Fleet'}</span>
          </Button>
        </form>
      </div>

      {/* Floating Linear-style Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs text-zinc-200 shadow-xl animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
