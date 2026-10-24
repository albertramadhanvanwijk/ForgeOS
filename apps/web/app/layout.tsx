import React from 'react';
import './globals.css';
import {
  LayoutDashboard,
  FolderGit2,
  Workflow,
  Bot,
  BrainCircuit,
  Palette,
  ShieldCheck,
  Wrench,
  GitFork,
  Activity,
  Plus,
} from 'lucide-react';

export const metadata = {
  title: 'ForgeOS — AI Engineering Operating System',
  description: 'Turn user intent into verified engineering deliverables with orchestrated AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navSections = [
    {
      label: 'CORE WORKSPACE',
      items: [
        { href: '/', label: 'Dashboard & Overview', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects Workspace', icon: FolderGit2 },
        { href: '/workflows', label: 'Workflows & Runs', icon: Workflow },
      ],
    },
    {
      label: 'ENGINEERING & FLEET',
      items: [
        { href: '/fleet', label: 'Agent Fleet Catalog', icon: Bot },
        { href: '/memory', label: 'Persistent Memory', icon: BrainCircuit },
        { href: '/design', label: 'Design Studio', icon: Palette },
      ],
    },
    {
      label: 'GOVERNANCE & ENGINE',
      items: [
        { href: '/quality', label: 'Quality Center', icon: ShieldCheck },
        { href: '/platform-builder', label: 'Platform Builder', icon: Wrench },
        { href: '/git', label: 'Git & Worktrees', icon: GitFork },
      ],
    },
  ];

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex h-screen overflow-hidden bg-background font-sans text-foreground antialiased">
        {/* Left Sidebar */}
        <aside className="flex w-72 flex-shrink-0 flex-col justify-between border-r border-border bg-card">
          {/* Logo & Brand Header */}
          <div>
            <div className="flex items-center gap-3 border-b border-border p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white">
                    ForgeOS
                  </span>
                  <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-sky-400">
                    v2.2
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  AI Engineering OS
                </div>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="max-h-[calc(100vh-210px)] overflow-y-auto p-3">
              {navSections.map((section) => (
                <div key={section.label} className="mb-6">
                  <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {section.label}
                  </div>
                  <nav className="flex flex-col space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-accent hover:text-white"
                        >
                          <Icon className="h-4 w-4 text-slate-400" />
                          <span>{item.label}</span>
                        </a>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Status Footer */}
          <div className="border-t border-border bg-background/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-xs font-semibold text-slate-200">Control Plane</span>
              </div>
              <span className="font-mono text-xs text-sky-400">
                :3001
              </span>
            </div>
            <div className="text-[11px] leading-relaxed text-muted-foreground">
              91 Tests Passing • Local Runner Active • Model Gateway Ready
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-card px-8">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Workspace /</span>
              <span className="font-semibold text-foreground">Autonomous Engineering Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-slate-300">6 Agent Roles Ready</span>
              </div>
              <a
                href="/projects"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-500 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Project
              </a>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
