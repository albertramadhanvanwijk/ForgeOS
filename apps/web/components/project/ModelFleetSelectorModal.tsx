'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, SlidersHorizontal, ShieldCheck, ExternalLink, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getStoredApiKeys,
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

  // Extract all automatically detected models across all configured custom endpoints
  const detectedModels: string[] = Array.from(
    new Set(
      (apiKeys.customEndpoints || []).flatMap((ep) => ep.availableModels || [])
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="work-card card-specular w-full max-w-2xl border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Custom AI Model Routing</h2>
              <p className="text-[11px] text-zinc-400">
                Pilih atau ketik model kustom apa saja sesuai endpoint yang Anda konfigurasi
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Custom Endpoints Shortcut Banner */}
        <div className="flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-950 p-3 text-xs">
          <div className="text-zinc-400 font-mono text-[11px]">
            {detectedModels.length > 0 ? (
              <span className="text-emerald-400 font-semibold">
                ✓ {detectedModels.length} model terdeteksi otomatis dari endpoint Anda.
              </span>
            ) : (
              <span>💡 Belum ada endpoint kustom. Ketik model bebas atau hubungkan endpoint di Settings.</span>
            )}
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-400 hover:text-blue-300 shrink-0 ml-2"
          >
            <span>+ AI Endpoints Settings</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Global Datalist for suggestions */}
        <datalist id="model-suggestions">
          {detectedModels.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>

        {/* Roles Configuration with Free-Form Inputs */}
        <div className="space-y-4">
          {/* Architect */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-blue-400">Architect Agent</span>
                <p className="text-[10px] text-zinc-500">PRD, requirements, dan alur sistem</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">Custom Model String</span>
            </div>
            <input
              type="text"
              list="model-suggestions"
              value={config.architect}
              onChange={(e) => setConfig({ ...config, architect: e.target.value })}
              placeholder="Ketik atau pilih model (misal: deepseek-r1)..."
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Designer */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-purple-400">Designer Agent</span>
                <p className="text-[10px] text-zinc-500">Design Studio tokens, wireframes, dan sitemap</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">Custom Model String</span>
            </div>
            <input
              type="text"
              list="model-suggestions"
              value={config.designer}
              onChange={(e) => setConfig({ ...config, designer: e.target.value })}
              placeholder="Ketik atau pilih model (misal: claude-3-5-sonnet)..."
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Engineer */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-emerald-400">Engineering Agent</span>
                <p className="text-[10px] text-zinc-500">Scaffolding kode, TSX components, dan git worktrees</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">Custom Model String</span>
            </div>
            <input
              type="text"
              list="model-suggestions"
              value={config.engineer}
              onChange={(e) => setConfig({ ...config, engineer: e.target.value })}
              placeholder="Ketik atau pilih model (misal: deepseek-coder, qwen2.5-coder)..."
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* QA & Verification */}
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-amber-400">QA & Verifier Agent</span>
                <p className="text-[10px] text-zinc-500">Automated tests, visual compliance, dan quality gates</p>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">Custom Model String</span>
            </div>
            <input
              type="text"
              list="model-suggestions"
              value={config.qa}
              onChange={(e) => setConfig({ ...config, qa: e.target.value })}
              placeholder="Ketik atau pilih model (misal: gpt-4o-mini, llama-3.3-70b)..."
              className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Mendukung seluruh model internal, local airgap, maupun cloud.</span>
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
              Simpan Model Kustom
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
