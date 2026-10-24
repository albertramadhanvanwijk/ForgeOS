import React from 'react';

export default function WorkflowsPage() {
  const workflows = [
    {
      id: 'wf-001',
      name: 'workflow-greenfield-engineering',
      intent: 'CREATE',
      tasks: 4,
      status: 'completed',
      leadRole: 'Solution Architect',
      duration: '42s',
    },
    {
      id: 'wf-002',
      name: 'workflow-feature-enhancement',
      intent: 'MODIFY',
      tasks: 3,
      status: 'running',
      leadRole: 'Software Engineer',
      duration: '18s',
    },
    {
      id: 'wf-003',
      name: 'workflow-incident-repair',
      intent: 'TROUBLESHOOT',
      tasks: 2,
      status: 'completed',
      leadRole: 'QA Engineer',
      duration: '12s',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>Workflows & Runs</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Durable state machines, DAG task graphs, and persistent checkpoints (FR-011, FR-016-FR-018).
        </p>
      </div>

      <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#090d16', color: '#64748b' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Workflow Run ID</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>DAG Definition</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Intent Type</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Tasks</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Lead Role</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((wf) => (
              <tr key={wf.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", color: '#38bdf8' }}>{wf.id}</td>
                <td style={{ padding: '16px 20px', fontWeight: 600 }}>{wf.name}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#1e293b', color: '#cbd5e1' }}>
                    {wf.intent}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#94a3b8' }}>{wf.tasks} nodes</td>
                <td style={{ padding: '16px 20px' }}>
                  <span
                    style={{
                      fontSize: '11.5px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: wf.status === 'completed' ? '#064e3b' : '#075985',
                      color: wf.status === 'completed' ? '#34d399' : '#38bdf8',
                      fontWeight: 600,
                    }}
                  >
                    {wf.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>{wf.leadRole}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
