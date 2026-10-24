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
  Search,
  Terminal,
  Activity,
  Plus,
  Command,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

export const metadata = {
  title: 'ForgeOS — AI Engineering Operating System',
  description: 'Deterministic AI engineering control plane for autonomous software construction and verification.',
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: string;
  status?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navGroups: NavGroup[] = [
    {
      group: 'WORKSPACE',
      items: [
        { href: '/', label: 'Overview', icon: LayoutDashboard },
        { href: '/projects', label: 'Projects', icon: FolderGit2, badge: 'Active' },
        { href: '/workflows', label: 'Workflows', icon: Workflow },
      ],
    },
    {
      group: 'ENGINES & FLEET',
      items: [
        { href: '/fleet', label: 'Agent Fleet', icon: Bot, count: '6' },
        { href: '/memory', label: 'Persistent Memory', icon: BrainCircuit },
        { href: '/design', label: 'Design Studio', icon: Palette },
        { href: '/git', label: 'Git & Worktrees', icon: GitFork },
      ],
    },
    {
      group: 'GOVERNANCE',
      items: [
        { href: '/quality', label: 'Quality Center', icon: ShieldCheck, status: '91/91' },
        { href: '/platform-builder', label: 'Platform Builder', icon: Wrench },
      ],
    },
    {
      group: 'SETTINGS & POLICIES',
      items: [
        { href: '/settings', label: 'AI Models & API Keys', icon: KeyRound },
      ],
    },
  ];

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100">
        {/* Left Sidebar */}
        <aside className="flex w-64 flex-shrink-0 flex-col justify-between border-r border-zinc-800/80 bg-zinc-950">
          <div>
            {/* Logo & Brand Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3.5">
              <a href="/" className="flex items-center gap-2.5 group">
                {/* Bespoke Geometric Mark */}
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-sm transition-colors group-hover:border-zinc-500">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold tracking-tight text-zinc-100">
                    ForgeOS
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 font-medium">
                    v2.2
                  </span>
                </div>
              </a>

              <div className="flex items-center gap-1">
                <span className="inline-flex items-center rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  prod
                </span>
              </div>
            </div>

            {/* Quick Context Switcher */}
            <div className="px-3 pt-3 pb-1">
              <button className="flex w-full items-center justify-between rounded border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors">
                <span className="flex items-center gap-2 truncate">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="truncate font-mono text-[11px]">forgeos-control-plane</span>
                </span>
                <span className="font-mono text-[10px] text-zinc-500">main</span>
              </button>
            </div>

            {/* Navigation Groups */}
            <div className="space-y-4 px-2 py-3">
              {navGroups.map((group) => (
                <div key={group.group}>
                  <div className="px-2.5 pb-1.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                    {group.group}
                  </div>
                  <nav className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          className="group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                            <span>{item.label}</span>
                          </div>
                          {item.count && (
                            <span className="font-mono text-[10px] text-zinc-500">
                              {item.count}
                            </span>
                          )}
                          {item.status && (
                            <span className="font-mono text-[10px] text-emerald-400">
                              {item.status}
                            </span>
                          )}
                          {item.badge && (
                            <span className="rounded bg-zinc-800 px-1 text-[9px] text-zinc-400">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Status Footer */}
          <div className="border-t border-zinc-800/80 bg-zinc-950 p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] font-medium text-zinc-300">Orchestrator Online</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">:3001</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
              <span>91/91 gates pass</span>
              <span>7b3535a</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Refined Top Navigation Bar */}
          <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="text-zinc-500">ForgeOS</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-200 font-medium">Control Plane</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Command Bar Trigger */}
              <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-400 shadow-sm">
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-500">Command Palette</span>
                <kbd className="ml-3 inline-flex items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800 px-1 font-mono text-[10px] text-zinc-400">
                  <Command className="h-2.5 w-2.5" /> K
                </kbd>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/50 px-2 py-1 font-mono text-[11px] text-zinc-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Runner Sandboxed</span>
              </div>

              <a
                href="/projects"
                className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-900 transition-colors hover:bg-white"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Project</span>
              </a>
            </div>
          </header>

          {/* Main Viewport Content */}
          <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
