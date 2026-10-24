'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Compass,
  Code2,
  ShieldCheck,
  GitFork,
  Cpu,
  Layers,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AgentRoleItem {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  skills: string[];
  allowedTools: string[];
  defaultModel?: string;
  status?: string;
}

const ROLE_ICONS: Record<string, any> = {
  orchestrator: Compass,
  'solution-architect': Layers,
  'software-engineer': Code2,
  'qa-engineer': ShieldCheck,
  'devops-engineer': GitFork,
  'product-manager': Sparkles,
  'platform-builder': Cpu,
};

export default function FleetPage() {
  const [roles, setRoles] = useState<AgentRoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFleet = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/registry/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch fleet roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Live Agent Fleet Catalog</h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Authoritative role specifications loaded dynamically from the live orchestrator registry (FR-020–FR-024).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchFleet}
            disabled={loading}
            className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-mono text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {roles.length} Live Roles Registered
          </span>
        </div>
      </div>

      {/* Roster Cards */}
      {loading && roles.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center text-xs text-zinc-400">
          Loading live agent registry...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const Icon = ROLE_ICONS[role.id] || Cpu;
            return (
              <div
                key={role.id}
                className="work-card card-specular flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-zinc-100">{role.name}</h3>
                        <span className="font-mono text-[10px] text-zinc-500">{role.id}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-emerald-800 bg-emerald-950 font-mono text-[10px] text-emerald-400">
                      LIVE
                    </Badge>
                  </div>

                  <p className="mt-3.5 text-xs leading-relaxed text-zinc-400">
                    {role.description}
                  </p>

                  {/* Capability Pills */}
                  <div className="mt-4 space-y-1.5">
                    <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                      Bound Capabilities ({role.capabilities?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(role.capabilities || []).map((cap) => (
                        <span
                          key={cap}
                          className="rounded border border-zinc-800 bg-zinc-900/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  {role.skills && role.skills.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
                        Active Skills
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.skills.map((s) => (
                          <span
                            key={s}
                            className="rounded border border-blue-900/50 bg-blue-950/40 px-1.5 py-0.5 font-mono text-[9px] text-blue-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-[11px] font-mono text-zinc-500">
                  <span>Model: {role.defaultModel || 'Custom Endpoint'}</span>
                  <span className="text-zinc-400">Tools: {role.allowedTools?.length || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
