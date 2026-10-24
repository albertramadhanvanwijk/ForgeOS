import React from 'react';

export default function HomePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>
        Welcome to ForgeOS
      </h1>
      <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
        The AI Engineering Operating System — transform your product intent into empirical, test-verified deliverables with controlled autonomous agent orchestration.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <a
          href="/projects"
          style={{
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Open Projects Workspace
        </a>
      </div>
    </div>
  );
}
