'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Lock,
  Plus,
  RefreshCw,
  Database,
  CheckCircle2,
  X,
} from 'lucide-react';

interface MemoryItem {
  id: string;
  scopeId: string;
  scopeType: string;
  memoryType: string;
  title: string;
  content: string;
  confidence: number;
  sensitivity: string;
  currentVersion: number;
  createdAt: string;
}

export default function MemoryPage() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storing, setStoring] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    memoryType: 'decision',
    scopeId: 'proj-default',
  });

  const fetchMemory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/memory/items?scopeId=proj-default');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch memory items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setStoring(true);
    try {
      const res = await fetch('/api/memory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scopeType: 'project',
          createdById: 'user',
        }),
      });

      if (res.ok) {
        setFormData({
          title: '',
          content: '',
          memoryType: 'decision',
          scopeId: 'proj-default',
        });
        setIsModalOpen(false);
        await fetchMemory();
      }
    } catch (err) {
      console.error('Failed to store memory item:', err);
    } finally {
      setStoring(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Live Persistent Memory Subsystem</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Contextual memory items, strict project-level isolation, automated secret scrubbing, and deduplication (MEM-001–MEM-018).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchMemory}
            disabled={loading}
            className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-100 font-mono text-xs text-zinc-900 shadow-sm hover:bg-white"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>Store Context Item</span>
          </Button>
        </div>
      </div>

      {/* Governance Banner */}
      <div className="work-card card-specular flex items-center justify-between px-4 py-3 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Project Isolation Enforced: Context items cannot leak across project boundaries.</span>
        </div>
        <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live Database: Connected ({items.length} items)
        </span>
      </div>

      {/* Modal / Dialog for New Memory Item */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="work-card w-full max-w-md p-6 border-zinc-700 bg-zinc-950">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100">Store New Persistent Memory Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMemory} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-mono">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Next.js 14 App Router Convention"
                  className="mt-1 bg-zinc-900 border-zinc-800 text-xs text-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono">Memory Type</label>
                <select
                  value={formData.memoryType}
                  onChange={(e) => setFormData({ ...formData, memoryType: e.target.value })}
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200"
                >
                  <option value="decision">Architecture Decision (ADR)</option>
                  <option value="pattern">Design Pattern</option>
                  <option value="policy">Governance Policy</option>
                  <option value="project">Project Context</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-mono">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe the architectural rule, decision or guideline..."
                  rows={3}
                  className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-100"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-zinc-800 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={storing}
                  className="bg-blue-600 hover:bg-blue-500 text-xs text-white"
                >
                  {storing ? 'Menyimpan...' : 'Simpan ke Memory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Memory Item Grid */}
      {loading && items.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-400">Loading live memory items...</div>
      ) : items.length === 0 ? (
        <div className="work-card p-12 text-center border-zinc-800">
          <Database className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-400">Belum ada context memory tersimpan di scope proj-default.</p>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="mt-3 bg-zinc-100 font-mono text-xs text-zinc-900"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Tambah Memory Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {items.map((m) => (
            <div
              key={m.id}
              className="work-card card-specular flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] text-zinc-500">{m.id.substring(0, 16)}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="border-zinc-800 bg-zinc-900 font-mono text-[10px] text-zinc-300">
                      {m.memoryType}
                    </Badge>
                    <span className="rounded border border-zinc-800 bg-zinc-900 px-1 font-mono text-[10px] text-zinc-400">
                      v{m.currentVersion || 1}
                    </span>
                  </div>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-zinc-100">{m.title}</h3>
                <div className="mt-1 font-mono text-[11px] text-zinc-500">Scope: {m.scopeType}:{m.scopeId}</div>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  {m.content}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Sanitized & Encrypted
                </span>
                <span className="text-zinc-500 font-sans text-[10px]">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
