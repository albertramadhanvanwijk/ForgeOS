import React from 'react';

export const metadata = {
  title: 'ForgeOS — The AI Engineering Operating System',
  description: 'Turn user intent into verified engineering deliverables with orchestrated AI agents.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0, backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <header style={{ borderBottom: '1px solid #1e293b', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🚀</span>
            <span style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '0.05em' }}>ForgeOS</span>
          </div>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <a href="/projects" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 500 }}>Projects</a>
            <a href="/fleet" style={{ color: '#94a3b8', textDecoration: 'none' }}>Agent Fleet</a>
            <a href="/quality" style={{ color: '#94a3b8', textDecoration: 'none' }}>Quality Center</a>
            <a href="/memory" style={{ color: '#94a3b8', textDecoration: 'none' }}>Memory Center</a>
          </nav>
        </header>
        <main style={{ padding: '32px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
