import { describe, it, expect } from 'vitest';

describe('Task 1.7: Policy Engine & Approval Gates (FR-015, FR-025, FR-028, FR-093)', () => {
  it('enforces default-deny and authorizes allowed actions per role (FR-025)', async () => {
    const { PolicyEngine, InMemoryAuditLogger } = await import(
      '../../platform/policy-engine/src/index.js'
    );
    const auditLogger = new InMemoryAuditLogger();
    const policy = new PolicyEngine(auditLogger);

    // Register basic role policies
    policy.registerRolePolicy({
      roleId: 'software-engineer',
      allowedActions: ['read_code', 'write_code', 'run_tests'],
      disallowedActions: ['deploy_production', 'grant_permissions'],
    });

    // Allowed action
    const allowResult = await policy.authorize({
      actor: 'agent-eng-01',
      role: 'software-engineer',
      action: 'write_code',
      resource: 'src/app.ts',
      correlationId: 'corr-101',
    });
    expect(allowResult.allowed).toBe(true);

    // Disallowed action
    const denyResult = await policy.authorize({
      actor: 'agent-eng-01',
      role: 'software-engineer',
      action: 'deploy_production',
      resource: 'production-env',
      correlationId: 'corr-102',
    });
    expect(denyResult.allowed).toBe(false);
    expect(denyResult.reason).toContain('deploy_production');
  });

  it('strictly blocks agents from expanding their own permissions (FR-028)', async () => {
    const { PolicyEngine, InMemoryAuditLogger } = await import(
      '../../platform/policy-engine/src/index.js'
    );
    const auditLogger = new InMemoryAuditLogger();
    const policy = new PolicyEngine(auditLogger);

    policy.registerRolePolicy({
      roleId: 'software-engineer',
      allowedActions: ['read_code', 'write_code'],
      disallowedActions: ['grant_permissions', 'modify_policy'],
    });

    // Agent attempts self-privilege escalation
    const escalationAttempt = await policy.authorize({
      actor: 'agent-eng-02',
      role: 'software-engineer',
      action: 'modify_policy',
      resource: 'platform/policy-engine',
      correlationId: 'corr-escalate-01',
    });

    expect(escalationAttempt.allowed).toBe(false);
    expect(escalationAttempt.reason).toContain('Privilege escalation is strictly forbidden');
  });

  it('manages approval lifecycle for sensitive actions (FR-015)', async () => {
    const { ApprovalService, InMemoryApprovalStore } = await import(
      '../../platform/policy-engine/src/index.js'
    );
    const store = new InMemoryApprovalStore();
    const approvals = new ApprovalService(store);

    // Request approval for production deployment
    const record = await approvals.requestApproval({
      projectId: 'proj-fintech-01',
      action: 'deploy_production',
      resourceType: 'environment',
      resourceId: 'prod-cluster-01',
      exactVersionHash: 'sha256-abc123fixedversionhash',
      riskLevel: 'high',
      requestedBy: 'devops-agent-01',
      rationale: 'Production deployment after verified QA passes',
    });

    expect(record.id).toBeDefined();
    expect(record.status).toBe('pending');

    // Unapproved action check fails
    const isApprovedBefore = await approvals.isActionApproved({
      action: 'deploy_production',
      resourceId: 'prod-cluster-01',
      exactVersionHash: 'sha256-abc123fixedversionhash',
    });
    expect(isApprovedBefore).toBe(false);

    // Grant approval by human/authorized reviewer
    const decided = await approvals.decideApproval(record.id, {
      decision: 'approved',
      decidedBy: 'human-admin@forgeos.dev',
    });
    expect(decided.status).toBe('approved');

    // Check approval with matching hash succeeds
    const isApprovedAfter = await approvals.isActionApproved({
      action: 'deploy_production',
      resourceId: 'prod-cluster-01',
      exactVersionHash: 'sha256-abc123fixedversionhash',
    });
    expect(isApprovedAfter).toBe(true);

    // Check approval with mismatched hash fails (approval drift protection)
    const isApprovedDrifted = await approvals.isActionApproved({
      action: 'deploy_production',
      resourceId: 'prod-cluster-01',
      exactVersionHash: 'sha256-DIFFERENT-tampered-hash',
    });
    expect(isApprovedDrifted).toBe(false);
  });

  it('records structured audit log for sensitive actions (FR-093)', async () => {
    const { PolicyEngine, InMemoryAuditLogger } = await import(
      '../../platform/policy-engine/src/index.js'
    );
    const auditLogger = new InMemoryAuditLogger();
    const policy = new PolicyEngine(auditLogger);

    policy.registerRolePolicy({
      roleId: 'devops-engineer',
      allowedActions: ['build_container', 'deploy_staging'],
      disallowedActions: ['drop_database'],
    });

    await policy.authorize({
      actor: 'devops-agent-02',
      role: 'devops-engineer',
      action: 'drop_database',
      resource: 'postgres-db',
      correlationId: 'corr-audit-99',
    });

    const logs = auditLogger.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    const lastLog = logs[logs.length - 1];
    expect(lastLog.actor).toBe('devops-agent-02');
    expect(lastLog.action).toBe('drop_database');
    expect(lastLog.outcome).toBe('denied');
    expect(lastLog.correlationId).toBe('corr-audit-99');
    expect(lastLog.timestamp).toBeDefined();
  });
});
