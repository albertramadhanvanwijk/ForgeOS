'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cpu, Check, ShieldCheck, DollarSign, Sparkles, KeyRound, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ALL_MODELS,
  getStoredApiKeys,
  isProviderConnected,
  type ApiKeysConfig,
  DEFAULT_API_KEYS,
} from '@/lib/api-keys-store';

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

export function ModelFleetSelectorModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: ModelSelectorProps) {
  const [config, setConfig] = useState<FleetModelConfig>(currentConfig);
  const [apiKeys, setApiKeys] = useState<ApiKeysConfig>(DEFAULT_API_KEYS);

  useEffect(() => {
    if (isOpen) {
      setApiKeys(getStoredApiKeys());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const renderModelOptions = () => {
    return ALL_MODELS.map((m) => {
      const isConnected = isProviderConnected(m.provider, apiKeys) || m.provider === 'Ollama';
      const label = `${m.name} (${m.provider}) — ${m.cost} ${isConnected ? ' [✓ Ready]' : ' [⚠️ Key in Settings]'}`;
      return (
        <option key={m.id} value={m.id}>
          {label}
        </option>
      );
    });
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
                Models adapt based on your connected API Keys in Settings
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* API Keys Banner Notification */}
        <div className="flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-950 p-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
            <KeyRound className="h-3.5 w-3.5 text-blue-400" />
            <span>Connect Anthropic, OpenAI, or DeepSeek API keys to unlock cloud models.</span>
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Open Settings</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
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
              {renderModelOptions()}
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
              {renderModelOptions()}
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
              {renderModelOptions()}
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
              {renderModelOptions()}
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
