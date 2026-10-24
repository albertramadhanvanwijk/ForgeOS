import React from 'react';
import type { Project } from '@forgeos/types';

export default function ProjectsPage() {
  // Static view / server rendering initial structure
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Projects Workspace</h1>
          <p style={{ color: '#94a3b8', margin: '6px 0 0' }}>Manage and oversee active AI engineering projects</p>
        </div>
        <button
          style={{
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, fontWeight: 600 }}>ForgeOS Core Engine</h2>
            <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: '#065f46', color: '#34d399' }}>active</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px' }}>
            Develop the control plane orchestrator, workflow engine, and persistent memory.
          </p>
          <a href="/projects/proj-001" style={{ color: '#38bdf8', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
            Open Workspace →
          </a>
        </div>
      </div>
    </div>
  );
}
