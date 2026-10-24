'use client';

import React, { useState } from 'react';
import { X, Cpu, Check, ShieldCheck, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FleetModelConfig {
  architect: string;
  designer: string;
  engineer: string;
  qa: string;
}

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: FleetModelConfig;
  onSave: (config: FleetModelConfig) => void;
}

const MODEL_OPTIONS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', cost: '$3.00 / 1M', tag: 'Best Architecture & Code' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Omni)', provider: 'OpenAI', cost: '$2.50 / 1M', tag: 'Multimodal & Reasoning' },
  { id: 'deepseek/deepseek-coder-v2', name: 'DeepSeek-Coder V2', provider: 'DeepSeek', cost: '$0.28 / 1M', tag: 'Ultra-Fast Code Gen' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o-mini', provider: 'OpenAI', cost: '$0.15 / 1M', tag: 'Cost-Optimized QA & Tests' },
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', cost: '$0.80 / 1M', tag: 'Fast Verifier' },
  { id: 'ollama/llama3.1-70b', name: 'Llama 3.1 70B (Local)', provider: 'Ollama', cost: '$0.00 (Self-hosted)', tag: 'Zero-Cloud Airgap' },
];

export function ModelFleetSelectorModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: ModelSelectorProps) {
  const [config, setConfig] = useState<FleetModelConfig>(currentConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="work-card card-specular w-full max-w-2xl border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <Cpu className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">AI Model Fleet Routing</h2>
              <p className="text-[11px] text-zinc-400">
                Configure specialized LLMs per autonomous agent role via Model Gateway
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Roles Configuration */}
        <div className="space-y-4">
          {/* Architect */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-blue-400">Architect Agent</span>
                <p className="text-[10px] text-zinc-500">PRD extraction, domain models, and system flows</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">High Reasoning</span>
            </div>
            <select
              value={config.architect}
              onChange={(e) => setConfig({ ...config, architect: e.target.value })}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) — {m.cost}
                </option>
              ))}
            </select>
          </div>

          {/* Designer */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-purple-400">Designer Agent</span>
                <p className="text-[10px] text-zinc-500">Design Studio tokens, component contracts, and sitemaps</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">Visual & Tokens</span>
            </div>
            <select
              value={config.designer}
              onChange={(e) => setConfig({ ...config, designer: e.target.value })}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) — {m.cost}
                </option>
              ))}
            </select>
          </div>

          {/* Engineer */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-emerald-400">Engineering Agent</span>
                <p className="text-[10px] text-zinc-500">TypeScript scaffolding, React components, and sandboxed worktree code</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">Coding Specialist</span>
            </div>
            <select
              value={config.engineer}
              onChange={(e) => setConfig({ ...config, engineer: e.target.value })}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) — {m.cost}
                </option>
              ))}
            </select>
          </div>

          {/* QA & Verification */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-amber-400">QA & Verifier Agent</span>
                <p className="text-[10px] text-zinc-500">Automated unit tests, visual compliance check, and quality gates</p>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold">Cost-Optimized</span>
            </div>
            <select
              value={config.qa}
              onChange={(e) => setConfig({ ...config, qa: e.target.value })}
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) — {m.cost}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Automatic fallback if primary provider limits hit</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-zinc-800 font-mono text-xs text-zinc-400 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
            >
              Save Fleet Routing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
