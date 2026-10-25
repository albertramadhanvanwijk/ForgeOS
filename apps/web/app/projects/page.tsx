'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, FolderGit2, X, Sparkles, Layers, Terminal } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  goal: string;
  status: string;
  rolesCount?: number;
  artifactsCount?: number;
  createdAt?: string;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-ecommerce-01',
    name: 'E-Commerce Storefront & Checkout',
    goal: 'Build a high-performance modern Next.js store with cart drawer, Stripe payment intent, and Tailwind design tokens.',
    status: 'active',
    rolesCount: 4,
    artifactsCount: 8,
  },
  {
    id: 'proj-002',
    name: 'Notification Dispatcher Service',
    goal: 'High-throughput Redis event queue and multi-channel email/SMS delivery microservice.',
    status: 'active',
    rolesCount: 3,
    artifactsCount: 4,
  },
  {
    id: 'proj-003',
    name: 'Security Audit & RBAC Gate',
    goal: 'Centralized policy authorization engine and immutable cryptographic audit logger.',
    status: 'completed',
    rolesCount: 2,
    artifactsCount: 5,
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectCategory, setProjectCategory] = useState<'static' | 'dynamic' | 'backend' | 'custom'>('static');
  const [customStackInput, setCustomStackInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    techStack: 'HTML5 + Tailwind CSS (Zero-dependency Static Web)',
  });

  const STACK_PRESETS = {
    static: [
      'HTML5 + Tailwind CSS (Zero-dependency Static Web)',
      'Pure HTML5 + CSS3 + Vanilla JavaScript (Static Site)',
      'Astro Static Site Generator (Markdown & Content Web)',
      'Next.js Static HTML Export (SSG / Static Export)',
    ],
    dynamic: [
      'Next.js 14 App Router + Tailwind CSS + TypeScript',
      'React + Vite + Tailwind CSS + TypeScript (SPA)',
      'Vue 3 + Vite + Tailwind CSS',
      'SvelteKit App + TypeScript',
    ],
    backend: [
      'Node.js Fastify API + TypeScript + Prisma ORM',
      'Node.js Express + REST API',
      'Python FastAPI / Flask Microservice',
      'Go (Golang) Gin / Fiber REST API',
    ],
  };

  const handleCategoryChange = (cat: 'static' | 'dynamic' | 'backend' | 'custom') => {
    setProjectCategory(cat);
    if (cat !== 'custom') {
      setFormData((prev) => ({
        ...prev,
        techStack: STACK_PRESETS[cat][0],
      }));
    }
  };

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API projects with defaults so user always has rich interactive entries
          const merged = [...data];
          for (const d of DEFAULT_PROJECTS) {
            if (!merged.some((m) => m.id === d.id)) {
              merged.push(d);
            }
          }
          setProjects(merged);
        }
      })
      .catch(() => {
        // Fallback to local default state
      });
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.goal.trim()) return;

    setIsSubmitting(true);
    const finalStack = projectCategory === 'custom'
      ? (customStackInput.trim() || 'Custom Tech Stack')
      : formData.techStack;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          goal: formData.goal,
          capabilityProfile: {
            projectType: projectCategory,
            techStack: finalStack,
            autonomousFleet: ['Architect', 'Designer', 'Engineer', 'QA'],
          },
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setIsModalOpen(false);
        router.push(`/projects/${created.id}`);
      } else {
        // Fallback local create if server unreachable
        const fakeId = `proj-${Date.now().toString().slice(-4)}`;
        const newProj: ProjectItem = {
          id: fakeId,
          name: formData.name,
          goal: formData.goal,
          status: 'active',
          rolesCount: 4,
          artifactsCount: 1,
        };
        setProjects([newProj, ...projects]);
        setIsModalOpen(false);
        router.push(`/projects/${fakeId}`);
      }
    } catch {
      const fakeId = `proj-${Date.now().toString().slice(-4)}`;
      router.push(`/projects/${fakeId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Projects Workspace</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Create web apps, microservices, and platforms with autonomous multi-agent engineering teams
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm transition-all hover:bg-white"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="work-card card-specular flex flex-col justify-between p-5 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <FolderGit2 className="h-4 w-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-100">{proj.name}</h3>
                    <span className="font-mono text-[10px] text-zinc-500">{proj.id}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`font-mono text-[10px] ${
                    proj.status === 'active'
                      ? 'border-emerald-800 bg-emerald-950 text-emerald-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {proj.status}
                </Badge>
              </div>

              <p className="mt-3.5 text-xs leading-relaxed text-zinc-400 line-clamp-3">
                {proj.goal}
              </p>
            </div>

            <div className="mt-5 space-y-3 pt-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <span>{proj.rolesCount || 4} Active Roles</span>
                <span>{proj.artifactsCount || 2} Artifacts</span>
              </div>
              <button
                onClick={() => router.push(`/projects/${proj.id}`)}
                className="w-full flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                <span>Open Multi-Agent Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="work-card card-specular w-full max-w-lg border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Create New Project</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. saas-customer-portal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Engineering Goal / Specification
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what you want the multi-agent team to build (e.g. Responsive website with landing page, pricing table, authentication, and dark mode design tokens)..."
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none resize-none"
                />
              </div>

              {/* Project Type Category Selector */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Project Architecture / Type
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('static')}
                    className={`rounded-md border p-2 text-left transition-colors ${
                      projectCategory === 'static'
                        ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-zinc-200">Static Web</div>
                    <div className="text-[10px] text-zinc-500">HTML / Tailwind / SSG</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('dynamic')}
                    className={`rounded-md border p-2 text-left transition-colors ${
                      projectCategory === 'dynamic'
                        ? 'border-blue-700 bg-blue-950/40 text-blue-300'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-zinc-200">Dynamic SaaS</div>
                    <div className="text-[10px] text-zinc-500">Next.js / React / SPA</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('backend')}
                    className={`rounded-md border p-2 text-left transition-colors ${
                      projectCategory === 'backend'
                        ? 'border-purple-700 bg-purple-950/40 text-purple-300'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-zinc-200">Backend API</div>
                    <div className="text-[10px] text-zinc-500">Fastify / Python / Go</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('custom')}
                    className={`rounded-md border p-2 text-left transition-colors ${
                      projectCategory === 'custom'
                        ? 'border-amber-700 bg-amber-950/40 text-amber-300'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-zinc-200">Custom Stack</div>
                    <div className="text-[10px] text-zinc-500">Ketik Bebas Sendiri</div>
                  </button>
                </div>
              </div>

              {/* Tech Stack Picker or Custom Text Input */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  Target Tech Stack
                </label>
                {projectCategory === 'custom' ? (
                  <input
                    type="text"
                    required
                    placeholder="e.g. SvelteKit, Hugo, Vue 3, Laravel, Ruby on Rails..."
                    value={customStackInput}
                    onChange={(e) => setCustomStackInput(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-amber-900/60 bg-zinc-900 px-3 py-2 font-mono text-xs text-amber-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
                  />
                ) : (
                  <select
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    className="mt-1.5 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
                  >
                    {STACK_PRESETS[projectCategory].map((stack) => (
                      <option key={stack} value={stack}>
                        {stack}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="rounded-md border border-zinc-800/80 bg-zinc-950/60 p-3 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Autonomous Fleet Initialized</span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">
                  Orchestrator will assign Architect (PRD), Designer (Design Studio tokens), Engineer (code generation), and QA (automated test gates).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-zinc-800 font-mono text-xs text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
                >
                  {isSubmitting ? 'Initializing Fleet...' : 'Launch Project Fleet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
