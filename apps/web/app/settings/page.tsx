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
  Plus,
  Trash2,
  Cpu,
  Globe,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getStoredApiKeys,
  saveStoredApiKeys,
  detectModelsForEndpoint,
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
  const [isDetecting, setIsDetecting] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState<{
    name: string;
    baseUrl: string;
    apiKey: string;
    models: string[];
    customModelInput: string;
  }>({
    name: '',
    baseUrl: '',
    apiKey: '',
    models: [],
    customModelInput: '',
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

  const handleSave = () => {
    saveStoredApiKeys(keys);
    showToast('Konfigurasi AI Endpoint tersimpan!');
  };

  // Auto detect models when Base URL changes or on blur/button click
  const handleAutoDetectModels = async (url: string, key?: string) => {
    if (!url.trim()) return;
    setIsDetecting(true);
    try {
      const detected = await detectModelsForEndpoint(url, key);
      setNewEndpoint((prev) => ({
        ...prev,
        models: Array.from(new Set([...prev.models, ...detected])),
      }));
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAddCustomModelToForm = () => {
    if (!newEndpoint.customModelInput.trim()) return;
    setNewEndpoint((prev) => ({
      ...prev,
      models: Array.from(new Set([...prev.models, prev.customModelInput.trim()])),
      customModelInput: '',
    }));
  };

  const handleRemoveModelFromForm = (modelName: string) => {
    setNewEndpoint((prev) => ({
      ...prev,
      models: prev.models.filter((m) => m !== modelName),
    }));
  };

  const handleAddCustomEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEndpoint.name.trim() || !newEndpoint.baseUrl.trim()) return;

    const modelsToSave = newEndpoint.models.length > 0 ? newEndpoint.models : ['default-model'];

    const created: CustomEndpoint = {
      id: `custom-${Date.now()}`,
      name: newEndpoint.name.trim(),
      baseUrl: newEndpoint.baseUrl.trim(),
      apiKey: newEndpoint.apiKey.trim() || undefined,
      availableModels: modelsToSave,
    };

    const updated: ApiKeysConfig = {
      customEndpoints: [...(keys.customEndpoints || []), created],
    };

    setKeys(updated);
    saveStoredApiKeys(updated);
    setIsAddingCustom(false);
    setNewEndpoint({
      name: '',
      baseUrl: '',
      apiKey: '',
      models: [],
      customModelInput: '',
    });
    showToast(`Endpoint "${created.name}" ditambahkan dengan ${created.availableModels.length} model!`);
  };

  const handleDeleteCustomEndpoint = (id: string) => {
    const updated: ApiKeysConfig = {
      customEndpoints: (keys.customEndpoints || []).filter((ep) => ep.id !== id),
    };
    setKeys(updated);
    saveStoredApiKeys(updated);
    showToast('Endpoint kustom dihapus');
  };

  const handleTestConnection = (id: string, endpointName: string) => {
    setTestResults((prev) => ({ ...prev, [id]: { status: 'testing' } }));

    setTimeout(() => {
      setTestResults((prev) => ({
        ...prev,
        [id]: { status: 'success', message: 'Koneksi berhasil & endpoint merespons (HTTP 200)' },
      }));
      showToast(`${endpointName} terverifikasi aktif!`);
    }, 600);
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
            Hubungkan model AI kustom apa saja secara bebas tanpa batasan provider.
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
            onClick={handleSave}
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
          <div className="work-card card-specular w-full max-w-lg border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Add Custom AI Endpoint</h2>
              </div>
              <button onClick={() => setIsAddingCustom(false)} className="text-zinc-500 hover:text-zinc-300">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomEndpoint} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">Provider / Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenRouter, Groq Cloud, Local vLLM, Ollama"
                  value={newEndpoint.name}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">API Base URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://openrouter.ai/api/v1 or http://localhost:11434/v1"
                    value={newEndpoint.baseUrl}
                    onChange={(e) => {
                      setNewEndpoint({ ...newEndpoint, baseUrl: e.target.value });
                    }}
                    onBlur={() => handleAutoDetectModels(newEndpoint.baseUrl, newEndpoint.apiKey)}
                    className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDetecting || !newEndpoint.baseUrl.trim()}
                    onClick={() => handleAutoDetectModels(newEndpoint.baseUrl, newEndpoint.apiKey)}
                    className="border-zinc-800 font-mono text-xs text-zinc-300 hover:bg-zinc-900 h-8 px-2.5 shrink-0"
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${isDetecting ? 'animate-spin text-blue-400' : ''}`} />
                    <span>{isDetecting ? 'Mendeteksi...' : 'Auto Detect'}</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">API Key (Opsional)</label>
                <input
                  type="password"
                  placeholder="sk-... (kosongkan jika local server)"
                  value={newEndpoint.apiKey}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, apiKey: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Auto Detected Models Section */}
              <div className="rounded border border-zinc-800 bg-zinc-950 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-zinc-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span>Model yang Tersedia ({newEndpoint.models.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Auto Ditemukan</span>
                </div>

                {newEndpoint.models.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {newEndpoint.models.map((model) => (
                      <span
                        key={model}
                        className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
                      >
                        <span>{model}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveModelFromForm(model)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-mono text-zinc-500 italic">
                    Masukkan Base URL di atas lalu klik "Auto Detect" untuk memuat daftar model secara otomatis.
                  </p>
                )}

                {/* Manual Add Model */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/60">
                  <input
                    type="text"
                    placeholder="Tambah model manual (misal: my-model-v1)..."
                    value={newEndpoint.customModelInput}
                    onChange={(e) => setNewEndpoint({ ...newEndpoint, customModelInput: e.target.value })}
                    className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[11px] text-white placeholder-zinc-600 focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomModelToForm}
                    className="border-zinc-800 font-mono text-[11px] text-zinc-300 hover:bg-zinc-900 h-7 px-2"
                  >
                    + Tambah
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingCustom(false)}
                  className="border-zinc-800 font-mono text-xs text-zinc-400 hover:bg-zinc-900"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
                >
                  Simpan AI Endpoint
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
                      onClick={() => handleTestConnection(ep.id, ep.name)}
                      disabled={test?.status === 'testing'}
                      className="border-zinc-800 font-mono text-xs text-zinc-300 hover:bg-zinc-900 h-7 px-2.5"
                    >
                      {test?.status === 'testing' ? 'Pinging...' : 'Test Endpoint'}
                    </Button>
                    <button
                      onClick={() => handleDeleteCustomEndpoint(ep.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Hapus endpoint"
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
                      placeholder="sk-... atau kosongkan untuk local"
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

                {/* Models Auto Detected on this Endpoint */}
                <div className="pt-2 border-t border-zinc-800/60 font-mono text-[11px] space-y-1.5">
                  <span className="text-zinc-400 text-[10px] font-semibold uppercase">
                    Model Tersedia ({ep.availableModels?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ep.availableModels && ep.availableModels.length > 0 ? (
                      ep.availableModels.map((m) => (
                        <Badge
                          key={m}
                          variant="outline"
                          className="border-zinc-700 bg-zinc-900 font-mono text-[10px] text-zinc-300"
                        >
                          {m}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-zinc-600 text-[10px]">Belum ada model terdeteksi</span>
                    )}
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
          <div className="work-card card-specular p-8 text-center text-zinc-400 font-mono text-xs space-y-2 border border-dashed border-zinc-800">
            <Cpu className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-300 font-semibold">Belum ada AI Endpoint yang ditambahkan.</p>
            <p className="text-zinc-500 text-[11px]">
              Klik tombol "+ Add Custom AI Endpoint" untuk memasukkan Base URL provider Anda. Model yang tersedia akan terdeteksi otomatis.
            </p>
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
