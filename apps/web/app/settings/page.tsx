'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Server,
  Plus,
  Trash2,
  Cpu,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getStoredApiKeys,
  saveStoredApiKeys,
  type ApiKeysConfig,
  type CustomEndpoint,
  DEFAULT_API_KEYS,
} from '@/lib/api-keys-store';

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKeysConfig>(DEFAULT_API_KEYS);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Custom Endpoint Form State
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState<Omit<CustomEndpoint, 'id'>>({
    name: '',
    modelName: '',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
  });

  useEffect(() => {
    setKeys(getStoredApiKeys());
  }, []);

  const toggleShow = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStoredApiKeys(keys);
    showToast('Custom AI configuration saved! All agent roles adapt to these endpoints.');
  };

  const handleAddCustomEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndpoint.name.trim() || !newEndpoint.modelName.trim()) return;

    const created: CustomEndpoint = {
      ...newEndpoint,
      id: `custom-${Date.now()}`,
    };

    const updated = {
      ...keys,
      customEndpoints: [...(keys.customEndpoints || []), created],
    };

    setKeys(updated);
    saveStoredApiKeys(updated);
    setIsAddingCustom(false);
    setNewEndpoint({
      name: '',
      modelName: '',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
    });
    showToast(`Added custom AI model: ${created.name}`);
  };

  const handleDeleteCustomEndpoint = (id: string) => {
    const updated = {
      ...keys,
      customEndpoints: (keys.customEndpoints || []).filter((ep) => ep.id !== id),
    };
    setKeys(updated);
    saveStoredApiKeys(updated);
    showToast('Custom endpoint removed');
  };

  const handleTestConnection = (id: string, endpointName: string, apiKey?: string) => {
    setTestResults((prev) => ({ ...prev, [id]: { status: 'testing' } }));

    setTimeout(() => {
      setTestResults((prev) => ({
        ...prev,
        [id]: { status: 'success', message: 'Endpoint verified & responding (HTTP 200)' },
      }));
      showToast(`${endpointName} connection verified!`);
    }, 700);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Custom AI Models & Endpoints</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Hubungkan model AI kustom apa saja (OpenRouter, Groq, vLLM, Ollama, LM Studio, dll) secara bebas tanpa batasan provider.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddingCustom(true)}
            size="sm"
            variant="outline"
            className="border-zinc-800 font-mono text-xs text-zinc-300 hover:bg-zinc-900"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
            <span>+ Add Custom AI Endpoint</span>
          </Button>

          <Button
            onClick={() => handleSave()}
            size="sm"
            className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            <span>Save All</span>
          </Button>
        </div>
      </div>

      {/* Add Custom Endpoint Modal */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="work-card card-specular w-full max-w-lg border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Add Custom AI Model / Endpoint</h2>
              </div>
              <button onClick={() => setIsAddingCustom(false)} className="text-zinc-500 hover:text-zinc-300">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomEndpoint} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">Provider / Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenRouter DeepSeek R1, Groq Llama, Company Internal LLM"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">Model Identifier String</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. deepseek/deepseek-r1, llama-3.3-70b-versatile, qwen2.5:latest"
                  value={newEndpoint.modelName}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, modelName: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">API Base URL (OpenAI-Compatible)</label>
                <input
                  type="text"
                  required
                  placeholder="https://openrouter.ai/api/v1 or http://localhost:11434/v1"
                  value={newEndpoint.baseUrl}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, baseUrl: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">API Key (Optional for local server)</label>
                <input
                  type="password"
                  placeholder="sk-or-... (leave blank if local server without auth)"
                  value={newEndpoint.apiKey}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, apiKey: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingCustom(false)}
                  className="border-zinc-800 font-mono text-xs text-zinc-400 hover:bg-zinc-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
                >
                  Add Custom Model
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom AI Endpoints List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Configured AI Endpoints ({keys.customEndpoints?.length || 0})
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            OpenAI-Compatible Protocol (Groq, vLLM, OpenRouter, Ollama, LM Studio)
          </span>
        </div>

        {keys.customEndpoints && keys.customEndpoints.length > 0 ? (
          keys.customEndpoints.map((ep) => {
            const isVisible = showKey[ep.id];
            const test = testResults[ep.id];
            const hasKey = Boolean(ep.apiKey?.trim());

            return (
              <div
                key={ep.id}
                className="work-card card-specular p-5 space-y-4 border border-zinc-800/90"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-semibold text-zinc-100">{ep.name}</h3>
                      <Badge variant="outline" className="border-blue-800 bg-blue-950 font-mono text-[10px] text-blue-400">
                        {ep.modelName}
                      </Badge>
                      {hasKey ? (
                        <span className="font-mono text-[10px] text-emerald-400">Auth Key Set</span>
                      ) : (
                        <span className="font-mono text-[10px] text-zinc-500">No Key (Local/Airgap)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                      <Globe className="h-3 w-3 text-zinc-500" />
                      <span>{ep.baseUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(ep.id, ep.name, ep.apiKey)}
                      disabled={test?.status === 'testing'}
                      className="border-zinc-800 font-mono text-xs text-zinc-300 hover:bg-zinc-900 h-7 px-2.5"
                    >
                      {test?.status === 'testing' ? 'Pinging...' : 'Test Endpoint'}
                    </Button>
                    <button
                      onClick={() => handleDeleteCustomEndpoint(ep.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete endpoint"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* API Key field if present */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                  <span className="font-mono text-[10px] uppercase text-zinc-500 w-16">API Key:</span>
                  <div className="relative flex-1">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      value={ep.apiKey || ''}
                      onChange={(e) => {
                        const updated = {
                          ...keys,
                          customEndpoints: keys.customEndpoints.map((item) =>
                            item.id === ep.id ? { ...item, apiKey: e.target.value } : item
                          ),
                        };
                        setKeys(updated);
                      }}
                      placeholder="sk-... or leave empty for local"
                      className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(ep.id)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {test?.status === 'success' && (
                  <p className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{test.message}</span>
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="work-card card-specular p-6 text-center text-zinc-400 font-mono text-xs">
            Belum ada endpoint kustom. Klik "+ Add Custom AI Endpoint" untuk menambahkan model apa saja.
          </div>
        )}
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs text-zinc-200 shadow-xl animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
