import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, FileCode2 } from 'lucide-react';

export default function DesignStudioPage() {
  const artifacts = [
    { name: 'Wireframes & User Journey (Checkout Flow)', type: 'wireframe', status: 'approved', version: 'v1.2' },
    { name: 'Color Palette & HSL Design Tokens', type: 'tokens', status: 'approved', version: 'v2.0' },
    { name: 'Component Library & State Variants', type: 'components', status: 'in_review', version: 'v1.0' },
    { name: 'Accessibility & Contrast Verification', type: 'a11y', status: 'verified', version: 'v1.0' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Design Studio</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            User flows, wireframes, design tokens, and exact-version approval binding (FR-050–FR-055).
          </p>
        </div>
        <Button size="sm" className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-md hover:bg-white">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          <span>Generate Design Specs</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="glass-panel glass-specular glass-panel-hover rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400">Design System</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-zinc-100">shadcn/ui + Tailwind</div>
          <span className="font-mono text-[10px] text-zinc-500">Frosted Glassmorphism Theme</span>
        </div>
        <div className="glass-panel glass-specular glass-panel-hover rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400">Tokens Documented</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-emerald-400">24 Semantic Tokens</div>
          <span className="font-mono text-[10px] text-zinc-500">WCAG AAA compliant contrast</span>
        </div>
        <div className="glass-panel glass-specular glass-panel-hover rounded-xl p-4">
          <span className="text-[11px] font-medium text-zinc-400">Exact Version Hash Binding</span>
          <div className="mt-1.5 font-mono text-xl font-bold text-zinc-100">Enforced</div>
          <span className="font-mono text-[10px] text-zinc-500">Cryptographically locked approvals</span>
        </div>
      </div>

      {/* Design Deliverables Table */}
      <div className="glass-panel glass-specular divide-y divide-white/[0.06] rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-black/40 px-4 py-3 font-mono text-[11px] font-medium text-zinc-400">
          DESIGN ARTIFACTS & DELIVERABLES
        </div>
        {artifacts.map((art) => (
          <div key={art.name} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <FileCode2 className="h-4 w-4 text-zinc-400" />
                <h3 className="text-xs font-semibold text-zinc-100">{art.name}</h3>
                <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                  {art.type}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">{art.version}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`font-mono text-[10px] ${
                  art.status === 'approved' || art.status === 'verified'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                {art.status.toUpperCase()}
              </Badge>
              <button className="font-mono text-[11px] text-zinc-400 hover:text-zinc-200">
                Preview →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
