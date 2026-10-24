import React from 'react';

export default function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  const tabs = ['Overview', 'Conversation', 'Plan & Tasks', 'Artifacts', 'Quality Gates'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <a href="/projects" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>← Back to Projects</a>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '8px 0 4px' }}>Project Workspace</h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Project ID: {params.id}</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #334155', gap: '8px', marginBottom: '24px' }}>
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: idx === 0 ? '2px solid #38bdf8' : '2px solid transparent',
              color: idx === 0 ? '#38bdf8' : '#94a3b8',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>Active Overview</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.5 }}>
          Autonomous agents are currently executing tasks defined in the workflow graph.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Assigned Agent Fleet</span>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>4 Roles Active</div>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Workflow Progression</span>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px', color: '#34d399' }}>Running</div>
          </div>
          <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Artifacts Generated</span>
            <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '4px' }}>3 Versions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
