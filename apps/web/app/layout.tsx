import React from 'react';

export const metadata = {
  title: 'ForgeOS — AI Engineering Operating System',
  description: 'Turn user intent into verified engineering deliverables with orchestrated AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navSections = [
    {
      label: 'CORE WORKSPACE',
      items: [
        { href: '/', label: 'Dashboard & Overview', icon: '📊' },
        { href: '/projects', label: 'Projects Workspace', icon: '📁' },
        { href: '/workflows', label: 'Workflows & Runs', icon: '⚡' },
      ],
    },
    {
      label: 'ENGINEERING & FLEET',
      items: [
        { href: '/fleet', label: 'Agent Fleet Catalog', icon: '🤖' },
        { href: '/memory', label: 'Persistent Memory', icon: '🧠' },
        { href: '/design', label: 'Design Studio', icon: '🎨' },
      ],
    },
    {
      label: 'GOVERNANCE & ENGINE',
      items: [
        { href: '/quality', label: 'Quality Center', icon: '🛡️' },
        { href: '/platform-builder', label: 'Platform Builder', icon: '🛠️' },
        { href: '/git', label: 'Git & Worktrees', icon: '🌿' },
      ],
    },
  ];

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: 0,
          backgroundColor: '#090d16',
          color: '#f1f5f9',
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar */}
        <aside
          style={{
            width: '280px',
            backgroundColor: '#0e1526',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          {/* Logo & Brand Header */}
          <div>
            <div
              style={{
                padding: '24px 20px',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(14, 165, 233, 0.35)',
                }}
              >
                <span style={{ fontSize: '20px' }}>⚡</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: '#fff' }}>
                    ForgeOS
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: '#1e293b',
                      color: '#38bdf8',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #334155',
                    }}
                  >
                    v2.2
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  AI Engineering Operating System
                </div>
              </div>
            </div>

            {/* Navigation Sections */}
            <div style={{ padding: '16px 12px', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
              {navSections.map((section) => (
                <div key={section.label} style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: '0.08em',
                      padding: '0 12px 8px',
                    }}
                  >
                    {section.label}
                  </div>
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {section.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          color: '#cbd5e1',
                          textDecoration: 'none',
                          fontSize: '13.5px',
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Status Footer */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #1e293b',
              backgroundColor: '#090d16',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>Control Plane</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#38bdf8' }}>
                :3001
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
              91 Tests Passing • Local Runner Active • Model Gateway Ready
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top Header */}
          <header
            style={{
              height: '64px',
              borderBottom: '1px solid #1e293b',
              backgroundColor: '#0e1526',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 32px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Workspace /</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Autonomous Engineering</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#1e293b',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid #334155',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: '#10b981' }}>●</span>
                <span style={{ color: '#cbd5e1' }}>6 Agents Idle / Ready</span>
              </div>
              <a
                href="/projects"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>+</span> New Project
              </a>
            </div>
          </header>

          {/* Page Body */}
          <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
