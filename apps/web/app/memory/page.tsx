import React from 'react';

export default function MemoryPage() {
  const items = [
    {
      id: 'mem-001',
      title: 'Monorepo Stack & Fastify Integration',
      type: 'decision',
      state: 'active',
      scope: 'project:proj-001',
      provenance: 'Task 1.3: Fastify Orchestrator Backend Scaffold',
      version: 1,
    },
    {
      id: 'mem-002',
      title: 'Command Runner Allowlist & Security Policy',
      type: 'policy',
      state: 'active',
      scope: 'system:global',
      provenance: 'Task 2.3: Sandboxed Execution & Runner Policy',
      version: 1,
    },
    {
      id: 'mem-003',
      title: 'Adaptive Intent Workflow DAG Synthesis',
      type: 'pattern',
      state: 'active',
      scope: 'project:proj-001',
      provenance: 'Task 2.1: Orchestrator Intent Classification',
      version: 2,
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>Persistent Memory System</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Contextual knowledge, project-isolated memory items, secret scrubbing, and immutable versioning (MEM-001–MEM-018).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {items.map((m) => (
          <div
            key={m.id}
            style={{
              backgroundColor: '#0e1526',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#38bdf8',
                    backgroundColor: '#0369a120',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {m.id}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#064e3b',
                    color: '#34d399',
                    fontWeight: 600,
                  }}
                >
                  {m.state}
                </span>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700 }}>{m.title}</h3>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                Scope: <span style={{ color: '#cbd5e1' }}>{m.scope}</span> • Type: <span style={{ color: '#cbd5e1' }}>{m.type}</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.4 }}>
                <strong>Provenance:</strong> {m.provenance}
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b' }}>
              Version: v{m.version} (Immutable Snapshot)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
