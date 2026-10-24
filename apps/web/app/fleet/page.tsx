import React from 'react';

export default function FleetPage() {
  const roles = [
    {
      id: 'orchestrator',
      name: 'Conversational Orchestrator',
      icon: '⚡',
      skills: ['intent-classification', 'adaptive-planning', 'delegation'],
      modelTier: 'fast',
      status: 'idle',
      description: 'Translates high-level user intent into goals, criteria, and executable DAG workflows.',
    },
    {
      id: 'solution-architect',
      name: 'Solution Architect',
      icon: '📐',
      skills: ['architecture-design', 'interface-specification', 'adr-authoring'],
      modelTier: 'deep_reasoning',
      status: 'idle',
      description: 'Designs software architecture, data schemas, API contracts, and technology trade-offs.',
    },
    {
      id: 'software-engineer',
      name: 'Software Engineer',
      icon: '💻',
      skills: ['tdd-implementation', 'refactoring', 'code-generation'],
      modelTier: 'balanced',
      status: 'idle',
      description: 'Executes test-driven development, implements features, and satisfies architectural contracts.',
    },
    {
      id: 'qa-engineer',
      name: 'QA & Verification Engineer',
      icon: '🛡️',
      skills: ['automated-testing', 'quality-gate-verification', 'regression-testing'],
      modelTier: 'balanced',
      status: 'idle',
      description: 'Authors test suites, verifies coverage thresholds, and validates mandatory release gates.',
    },
    {
      id: 'devops-engineer',
      name: 'DevOps & Release Engineer',
      icon: '🚀',
      skills: ['git-worktrees', 'runner-sandboxing', 'ci-cd-pipelines'],
      modelTier: 'balanced',
      status: 'idle',
      description: 'Manages isolated branches, runner environments, deployment scripts, and container configs.',
    },
    {
      id: 'product-manager',
      name: 'Product Manager',
      icon: '📋',
      skills: ['requirements-analysis', 'ambiguity-detection', 'impact-analysis'],
      modelTier: 'fast',
      status: 'idle',
      description: 'Synthesizes functional requirements, acceptance criteria, and user story definitions.',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>Agent Fleet Catalog</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Role registry, skill bindings, model tier routing, and capability isolation (FR-020–FR-028).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {roles.map((r) => (
          <div
            key={r.id}
            style={{
              backgroundColor: '#0e1526',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{r.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{r.name}</h3>
                    <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#64748b' }}>
                      {r.id}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#064e3b',
                    color: '#34d399',
                  }}
                >
                  {r.status}
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px' }}>
                {r.description}
              </p>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                  COMPATIBLE SKILLS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {r.skills.map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#1e293b',
                        color: '#cbd5e1',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '14px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Model Tier:</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>{r.modelTier}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
