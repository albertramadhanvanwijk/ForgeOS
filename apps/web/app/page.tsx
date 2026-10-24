'use client';

import React, { useState } from 'react';

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const samplePrompts = [
    'Build a new user notification microservice with Redis and PostgreSQL',
    'Add multi-factor authentication support to the existing auth API',
    'Investigate latency bottlenecks in query indexing layer',
    'Fix failing checkout API where transaction deadlocks cause 500 errors',
  ];

  const handleClassify = async (textToClassify?: string) => {
    const inputPrompt = textToClassify || prompt;
    if (!inputPrompt.trim()) return;

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('http://localhost:3001/api/intent/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error('Failed to classify intent:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner & Intent Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.08))',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#f8fafc' }}>
              ForgeOS Command Center
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
              Transform natural product intent into verifiable, test-proven engineering deliverables.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#38bdf8' }}>
              TDD Verification Active
            </span>
            <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', backgroundColor: '#064e3b', color: '#34d399', fontWeight: 600 }}>
              91 Tests Passing
            </span>
          </div>
        </div>

        {/* Interactive Intent Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleClassify()}
            placeholder="Type engineering intent (e.g. 'Build new service...', 'Fix failing test...', 'Add feature...')"
            style={{
              flex: 1,
              backgroundColor: '#090d16',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '14px 18px',
              color: '#f8fafc',
              fontSize: '14.5px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => handleClassify()}
            disabled={analyzing}
            style={{
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0 24px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: analyzing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
            }}
          >
            {analyzing ? 'Classifying...' : '⚡ Orchestrate'}
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Try intent:</span>
          {samplePrompts.map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setPrompt(sample);
                handleClassify(sample);
              }}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid #334155',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {sample.length > 40 ? sample.substring(0, 38) + '...' : sample}
            </button>
          ))}
        </div>

        {/* Classification Result Card (Interactive) */}
        {analysisResult && (
          <div
            style={{
              marginTop: '20px',
              backgroundColor: '#090d16',
              border: '1px solid #0284c7',
              borderRadius: '10px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🎯</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '15px' }}>
                  Intent Identified: {analysisResult.intentType?.toUpperCase()}
                </span>
                <span style={{ fontSize: '12px', backgroundColor: '#1e293b', padding: '2px 8px', borderRadius: '4px', color: '#94a3b8' }}>
                  Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
                Workflow: {analysisResult.suggestedWorkflow}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
              <strong>Extracted Goals:</strong> {analysisResult.extractedGoals?.join('; ')}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              <strong>Assigned Roles:</strong> {analysisResult.suggestedRoles?.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Active Projects</span>
            <span style={{ fontSize: '18px' }}>📁</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>3</div>
          <div style={{ fontSize: '12px', color: '#34d399', marginTop: '6px' }}>● 100% On Schedule</div>
        </div>

        <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Agent Fleet</span>
            <span style={{ fontSize: '18px' }}>🤖</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>6 Roles</div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '6px' }}>Orchestrator, Arch, Eng, QA, DevOps, PM</div>
        </div>

        <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Quality Gate Pass Rate</span>
            <span style={{ fontSize: '18px' }}>🛡️</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399' }}>100%</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>91/91 Automated Tests Passing</div>
        </div>

        <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Token & Cost Routing</span>
            <span style={{ fontSize: '18px' }}>⚡</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>$0.0042</div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '6px' }}>Multi-Provider Fast/Reasoning Tiers</div>
        </div>
      </div>

      {/* Engineering Lifecycle Pipeline */}
      <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
          Autonomous Engineering Pipeline
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {[
            { step: '01', title: 'Intent Classification', role: 'Orchestrator', status: 'Completed', color: '#10b981' },
            { step: '02', title: 'Architecture Spec', role: 'Solution Architect', status: 'Active', color: '#38bdf8' },
            { step: '03', title: 'Implementation', role: 'Software Engineer', status: 'Queued', color: '#64748b' },
            { step: '04', title: 'Quality Verification', role: 'QA Engineer', status: 'Pending', color: '#64748b' },
            { step: '05', title: 'Controlled Release', role: 'Policy Engine', status: 'Approval Gate', color: '#64748b' },
          ].map((s) => (
            <div
              key={s.step}
              style={{
                backgroundColor: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                PHASE {s.step}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                {s.role}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: s.color,
                  backgroundColor: `${s.color}15`,
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Projects Table & Agent Fleet Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Active Projects Table */}
        <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Active Projects</h3>
            <a href="/projects" style={{ fontSize: '13px', color: '#38bdf8', textDecoration: 'none' }}>
              View All (3) →
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                id: 'proj-001',
                name: 'ForgeOS Core Engine',
                goal: 'Control plane orchestrator, workflow engine, and persistent memory',
                status: 'active',
                stage: 'Phase 2 Complete',
                tests: '91/91 passed',
              },
              {
                id: 'proj-002',
                name: 'Notification Dispatcher',
                goal: 'High-throughput Redis event queue and multi-channel email/SMS delivery',
                status: 'active',
                stage: 'Quality Verification',
                tests: '18/18 passed',
              },
              {
                id: 'proj-003',
                name: 'Security Audit & RBAC Gate',
                goal: 'Centralized policy authorization and immutable audit logger',
                status: 'completed',
                stage: 'Released',
                tests: '24/24 passed',
              },
            ].map((proj) => (
              <div
                key={proj.id}
                style={{
                  backgroundColor: '#090d16',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <a
                      href={`/projects/${proj.id}`}
                      style={{ fontSize: '15px', fontWeight: 600, color: '#f8fafc', textDecoration: 'none' }}
                    >
                      {proj.name}
                    </a>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: proj.status === 'active' ? '#065f46' : '#1e293b',
                        color: proj.status === 'active' ? '#34d399' : '#94a3b8',
                      }}
                    >
                      {proj.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
                    {proj.goal}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>{proj.stage}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{proj.tests}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Fleet Quick Status */}
        <div style={{ backgroundColor: '#0e1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Agent Fleet</h3>
            <span style={{ fontSize: '12px', color: '#10b981' }}>● 6 Online</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { role: 'Orchestrator', desc: 'Intent classification & DAG synthesis', icon: '⚡' },
              { role: 'Solution Architect', desc: 'Interface design & contract spec', icon: '📐' },
              { role: 'Software Engineer', desc: 'TDD implementation & execution', icon: '💻' },
              { role: 'QA Engineer', desc: 'Automated verification suites', icon: '🛡️' },
              { role: 'DevOps Engineer', desc: 'Isolated worktrees & deployment', icon: '🚀' },
              { role: 'Product Manager', desc: 'Requirements & ambiguity checks', icon: '📋' },
            ].map((agent) => (
              <div
                key={agent.role}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#090d16',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #1e293b',
                }}
              >
                <span style={{ fontSize: '18px' }}>{agent.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{agent.role}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{agent.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
