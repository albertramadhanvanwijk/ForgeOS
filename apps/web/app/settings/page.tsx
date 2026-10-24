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
  Pencil,
  Search,
  X,
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

  // Edit Endpoint State
  const [editingEndpoint, setEditingEndpoint] = useState<CustomEndpoint | null>(null);
  const [editCustomModelInput, setEditCustomModelInput] = useState('');
  const [isDetectingEdit, setIsDetectingEdit] = useState(false);
  const [refreshingEndpointId, setRefreshingEndpointId] = useState<string | null>(null);
  const [modelSearch, setModelSearch] = useState<Record<string, string>>({});
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const local = getStoredApiKeys();
    setKeys(local);

    // Sync with backend config
    fetch('/api/models/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.customEndpoints && data.customEndpoints.length > 0) {
          setKeys({ customEndpoints: data.customEndpoints });
          saveStoredApiKeys({ customEndpoints: data.customEndpoints });
        } else if (local.customEndpoints && local.customEndpoints.length > 0) {
          // Push local to backend
          fetch('/api/models/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(local),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const syncToBackend = async (config: ApiKeysConfig) => {
    try {
      await fetch('/api/models/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }
  };

  const toggleShow = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    saveStoredApiKeys(keys);
    syncToBackend(keys);
    showToast('Konfigurasi AI Endpoint tersimpan & tersinkronisasi ke backend!');
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
    syncToBackend(updated);
    setIsAddingCustom(false);
    setNewEndpoint({
      name: '',
      baseUrl: '',
      apiKey: '',
      models: [],
      customModelInput: '',
    });
    showToast(`Endpoint "${created.name}" ditambahkan & didaftarkan ke backend!`);
  };

  const handleDeleteCustomEndpoint = (id: string) => {
    const updated: ApiKeysConfig = {
      customEndpoints: (keys.customEndpoints || []).filter((ep) => ep.id !== id),
    };
    setKeys(updated);
    saveStoredApiKeys(updated);
    syncToBackend(updated);
    showToast('Endpoint kustom dihapus');
  };

  // Refresh models live from provider endpoint
  const handleRefreshEndpointModels = async (ep: CustomEndpoint) => {
    setRefreshingEndpointId(ep.id);
    try {
      const detected = await detectModelsForEndpoint(ep.baseUrl, ep.apiKey);
      if (detected && detected.length > 0) {
        const merged = Array.from(new Set([...ep.availableModels, ...detected]));
        const updated: ApiKeysConfig = {
          customEndpoints: keys.customEndpoints.map((item) =>
            item.id === ep.id ? { ...item, availableModels: merged } : item
          ),
        };
        setKeys(updated);
        saveStoredApiKeys(updated);
        await syncToBackend(updated);
        showToast(`Berhasil refresh! ${detected.length} model terbaru dimuat untuk "${ep.name}".`);
      } else {
        showToast(`Tidak ditemukan model baru dari endpoint "${ep.name}". Periksa URL atau API Key.`);
      }
    } catch (err: any) {
      showToast(`Gagal refresh model: ${err.message || 'Error'}`);
    } finally {
      setRefreshingEndpointId(null);
    }
  };

  // Open edit modal for an endpoint
  const handleOpenEditEndpoint = (ep: CustomEndpoint) => {
    setEditingEndpoint({ ...ep });
    setEditCustomModelInput('');
  };

  // Auto detect models while editing
  const handleAutoDetectEditModels = async () => {
    if (!editingEndpoint || !editingEndpoint.baseUrl.trim()) return;
    setIsDetectingEdit(true);
    try {
      const detected = await detectModelsForEndpoint(editingEndpoint.baseUrl, editingEndpoint.apiKey);
      if (detected.length > 0) {
        setEditingEndpoint((prev) =>
          prev
            ? {
                ...prev,
                availableModels: Array.from(new Set([...prev.availableModels, ...detected])),
              }
            : null
        );
        showToast(`${detected.length} model berhasil dideteksi!`);
      } else {
        showToast('Tidak ada model yang ditemukan dari URL ini.');
      }
    } finally {
      setIsDetectingEdit(false);
    }
  };

  // Add custom model to edit form
  const handleAddModelToEdit = () => {
    if (!editCustomModelInput.trim() || !editingEndpoint) return;
    setEditingEndpoint({
      ...editingEndpoint,
      availableModels: Array.from(
        new Set([...editingEndpoint.availableModels, editCustomModelInput.trim()])
      ),
    });
    setEditCustomModelInput('');
  };

  // Remove model from edit form
  const handleRemoveModelFromEdit = (modelName: string) => {
    if (!editingEndpoint) return;
    setEditingEndpoint({
      ...editingEndpoint,
      availableModels: editingEndpoint.availableModels.filter((m) => m !== modelName),
    });
  };

  // Save edited endpoint
  const handleSaveEditEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEndpoint) return;

    const modelsToSave =
      editingEndpoint.availableModels.length > 0
        ? editingEndpoint.availableModels
        : ['default-model'];

    const updatedEndpoint: CustomEndpoint = {
      ...editingEndpoint,
      name: editingEndpoint.name.trim(),
      baseUrl: editingEndpoint.baseUrl.trim(),
      apiKey: editingEndpoint.apiKey?.trim() || undefined,
      availableModels: modelsToSave,
    };

    const updated: ApiKeysConfig = {
      customEndpoints: keys.customEndpoints.map((item) =>
        item.id === updatedEndpoint.id ? updatedEndpoint : item
      ),
    };

    setKeys(updated);
    saveStoredApiKeys(updated);
    syncToBackend(updated);
    setEditingEndpoint(null);
    showToast(`Perubahan untuk "${updatedEndpoint.name}" berhasil disimpan & disinkronkan!`);
  };

  const handleTestConnection = async (id: string, endpointName: string) => {
    setTestResults((prev) => ({ ...prev, [id]: { status: 'testing' } }));

    try {
      const ep = keys.customEndpoints.find((e) => e.id === id);
      if (!ep) throw new Error('Endpoint tidak ditemukan');

      // First sync current config to backend
      await syncToBackend(keys);

      const targetModel = ep.availableModels[0] || 'default';
      const res = await fetch('/api/models/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: [{ role: 'user', content: 'Ping! Respond with OK.' }],
          maxTokens: 10,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResults((prev) => ({
          ...prev,
          [id]: {
            status: 'success',
            message: `Live Connected! Model: ${data.modelUsed} (${data.latencyMs}ms)`,
          },
        }));
        showToast(`${endpointName} LIVE dan terverifikasi aktif!`);
      } else {
        const err = await res.json().catch(() => ({ error: 'Koneksi gagal' }));
        setTestResults((prev) => ({
          ...prev,
          [id]: {
            status: 'error',
            message: err.error || 'Endpoint gagal merespons',
          },
        }));
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          status: 'error',
          message: err.message || 'Koneksi gagal',
        },
      }));
    }
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

      {/* Edit Endpoint Modal */}
      {editingEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="work-card card-specular w-full max-w-lg border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Edit AI Endpoint</h2>
              </div>
              <button onClick={() => setEditingEndpoint(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEndpoint} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">Provider / Display Name</label>
                <input
                  type="text"
                  required
                  value={editingEndpoint.name}
                  onChange={(e) => setEditingEndpoint({ ...editingEndpoint, name: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">API Base URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    required
                    value={editingEndpoint.baseUrl}
                    onChange={(e) => setEditingEndpoint({ ...editingEndpoint, baseUrl: e.target.value })}
                    className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDetectingEdit || !editingEndpoint.baseUrl.trim()}
                    onClick={handleAutoDetectEditModels}
                    className="border-zinc-800 font-mono text-xs text-blue-400 hover:bg-zinc-900 shrink-0"
                  >
                    <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isDetectingEdit ? 'animate-spin' : ''}`} />
                    <span>Fetch Semua Model</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">API Key (Opsional)</label>
                <input
                  type="password"
                  value={editingEndpoint.apiKey || ''}
                  onChange={(e) => setEditingEndpoint({ ...editingEndpoint, apiKey: e.target.value })}
                  placeholder="sk-... atau kosongkan jika local"
                  className="mt-1 w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Models Available in Edit */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase">
                    Model Tersedia ({editingEndpoint.availableModels?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingEndpoint({ ...editingEndpoint, availableModels: [] })}
                    className="text-[10px] font-mono text-zinc-500 hover:text-red-400"
                  >
                    Kosongkan Semua
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto rounded border border-zinc-800 bg-zinc-950 p-2.5 flex flex-wrap gap-1.5">
                  {editingEndpoint.availableModels && editingEndpoint.availableModels.length > 0 ? (
                    editingEndpoint.availableModels.map((model) => (
                      <span
                        key={model}
                        className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
                      >
                        <span>{model}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveModelFromEdit(model)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500">Belum ada model. Klik 'Fetch Semua Model' di atas atau tambah manual.</span>
                  )}
                </div>

                {/* Manual Add Model in Edit */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Tambah model manual..."
                    value={editCustomModelInput}
                    onChange={(e) => setEditCustomModelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddModelToEdit();
                      }
                    }}
                    className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-[11px] text-white placeholder-zinc-600 focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddModelToEdit}
                    className="border-zinc-800 font-mono text-[11px] text-zinc-300 hover:bg-zinc-900 h-7 px-2.5"
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
                  onClick={() => setEditingEndpoint(null)}
                  className="border-zinc-800 font-mono text-xs text-zinc-400 hover:bg-zinc-900"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 font-mono text-xs text-white shadow-sm"
                >
                  Simpan Perubahan
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
            const isRefreshing = refreshingEndpointId === ep.id;
            const search = (modelSearch[ep.id] || '').toLowerCase().trim();
            const allModels = ep.availableModels || [];
            const filteredModels = search
              ? allModels.filter((m) => m.toLowerCase().includes(search))
              : allModels;
            const isExpanded = Boolean(expandedModels[ep.id]);
            const displayModels = isExpanded || filteredModels.length <= 16
              ? filteredModels
              : filteredModels.slice(0, 16);

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
                      onClick={() => handleRefreshEndpointModels(ep)}
                      disabled={isRefreshing}
                      title="Ambil daftar model terbaru langsung dari provider"
                      className="border-zinc-800 font-mono text-xs text-zinc-300 hover:bg-zinc-900 h-7 px-2.5"
                    >
                      <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
                      <span>{isRefreshing ? 'Memuat...' : 'Refresh Models'}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditEndpoint(ep)}
                      title="Edit nama, URL, API key, atau daftar model"
                      className="border-zinc-800 font-mono text-xs text-zinc-300 hover:bg-zinc-900 h-7 px-2.5"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                      <span>Edit</span>
                    </Button>

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
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors ml-1"
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
                <div className="pt-2 border-t border-zinc-800/60 font-mono text-[11px] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 text-[10px] font-semibold uppercase">
                        Model Tersedia ({allModels.length}):
                      </span>
                      {allModels.length > 10 && (
                        <div className="relative inline-block">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="Cari model..."
                            value={modelSearch[ep.id] || ''}
                            onChange={(e) =>
                              setModelSearch({ ...modelSearch, [ep.id]: e.target.value })
                            }
                            className="rounded border border-zinc-800 bg-zinc-900 pl-6 pr-2 py-0.5 font-mono text-[10px] text-zinc-200 placeholder-zinc-600 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {allModels.length > 16 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedModels({ ...expandedModels, [ep.id]: !isExpanded })
                        }
                        className="text-[10px] font-mono text-blue-400 hover:underline"
                      >
                        {isExpanded ? 'Tampilkan Lebih Sedikit' : `Lihat Semua (${allModels.length} Model)`}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {displayModels.length > 0 ? (
                      displayModels.map((m) => (
                        <Badge
                          key={m}
                          variant="outline"
                          className="border-zinc-700 bg-zinc-900 font-mono text-[10px] text-zinc-300 hover:border-zinc-500 cursor-default"
                        >
                          {m}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-zinc-500 text-[10px]">
                        {search ? `Tidak ada model yang cocok dengan "${search}"` : 'Belum ada model terdeteksi. Klik "Refresh Models" di atas.'}
                      </span>
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
