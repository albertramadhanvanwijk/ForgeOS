import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Phase 6 — E2E Acceptance Scenarios D, E, F, G (Requirements 12)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scenario D: Platform Capability Evolution without Duplicates (FR-070–FR-074)', () => {
    it('introspects capability graph, identifies reuse, and plans non-duplicate ChangeSet', async () => {
      // 1. Introspect existing capabilities
      const capsRes = await app.inject({
        method: 'GET',
        url: '/api/platform-builder/capabilities',
      });
      expect(capsRes.statusCode).toBe(200);
      const graph = capsRes.json();
      expect(graph.nodes.length).toBeGreaterThanOrEqual(5);

      // 2. Plan new platform capability evolution
      const planRes = await app.inject({
        method: 'POST',
        url: '/api/platform-builder/changesets',
        payload: {
          intent: 'Add automated database migration validator to local-runner',
          author: 'senior-architect',
          version: '2.5.0',
        },
      });
      expect(planRes.statusCode).toBe(201);
      const planData = planRes.json();
      expect(planData.changeSet.id).toBeDefined();
      expect(planData.isolatedBranch).toContain('platform/changeset-');
      expect(planData.changeSet.exactVersionHash).toHaveLength(64);

      // 3. Run impact analysis
      const impactRes = await app.inject({
        method: 'POST',
        url: `/api/platform-builder/changesets/${planData.changeSet.id}/impact`,
      });
      expect(impactRes.statusCode).toBe(200);
      const impactReport = impactRes.json().report;
      expect(impactReport.affectedCapabilities).toBeDefined();
      expect(['low', 'medium', 'high', 'critical']).toContain(impactReport.policyRiskLevel);
    });
  });

  describe('Scenario E: Toolchain Inspection & Platform Compatibility (FR-042, FR-071)', () => {
    it('accurately lists supported execution capabilities and sandbox runner boundaries', async () => {
      const runnerRes = await app.inject({
        method: 'POST',
        url: '/api/runner/execute',
        payload: {
          command: 'node',
          args: ['-e', 'console.log(JSON.stringify({ platform: process.platform, arch: process.arch }))'],
        },
      });
      expect(runnerRes.statusCode).toBe(200);
      const runData = runnerRes.json();
      expect(runData.success).toBe(true);
      expect(runData.stdout).toContain('platform');
    });
  });

  describe('Scenario F: Self-Healing with Strict Quality Threshold Invariants (FR-064)', () => {
    it('refuses to lower quality thresholds or omit test suites during self-healing', async () => {
      const cheatPayload = {
        evaluation: {
          taskId: 'tsk-cheat-01',
          passed: false,
          blockingViolations: [
            {
              gateId: 'gate-security',
              name: 'Security Checks',
              type: 'security_audit',
              severity: 'mandatory',
              status: 'failed',
              message: 'Vulnerability detected',
              durationMs: 120,
              executedAt: new Date(),
            },
          ],
        },
        patch: {
          patchId: 'patch-bypass',
          filePath: 'platform/orchestrator/src/app.ts',
          diff: '- expect(securityPassed).toBe(true);\n+ // test deleted to force pass',
        },
      };

      const res = await app.inject({
        method: 'POST',
        url: '/api/quality/self-heal',
        payload: cheatPayload,
      });

      // Must be rejected with 400 Bad Request due to quality policy violation
      expect(res.statusCode).toBe(400);
      expect(res.json().error).toContain('Cannot lower quality thresholds');
    });
  });

  describe('Scenario G: Production Deployment under Strict Governance Policy (FR-065)', () => {
    it('approves deployment when all 4 policy criteria are proven satisfied', async () => {
      const validDeployment = {
        deploymentId: 'dep-scen-g-01',
        environment: 'production',
        commitHash: '9b52fa71029ba55d',
        isWorkingTreeClean: true,
        allMandatoryGatesPassed: true,
        changeAuthorization: {
          authorized: true,
          approver: 'release-manager',
          exactVersionHash: '4f92a10be6975294',
        },
        rollbackSnapshotId: 'snap-release-v1.0.0',
      };

      const res = await app.inject({
        method: 'POST',
        url: '/api/policy/deployments/evaluate',
        payload: validDeployment,
      });

      expect(res.statusCode).toBe(200);
      const decision = res.json();
      expect(decision.allowed).toBe(true);
      expect(decision.rejectionReasons).toHaveLength(0);
    });

    it('blocks deployment and records all violation reasons when prerequisites fail', async () => {
      const invalidDeployment = {
        deploymentId: 'dep-scen-g-02',
        environment: 'production',
        commitHash: '9b52fa71029ba55d',
        isWorkingTreeClean: false, // Dirty tree
        allMandatoryGatesPassed: false, // Failed gates
        changeAuthorization: { authorized: false }, // Not authorized
        // Missing rollbackSnapshotId
      };

      const res = await app.inject({
        method: 'POST',
        url: '/api/policy/deployments/evaluate',
        payload: invalidDeployment,
      });

      expect(res.statusCode).toBe(403);
      const decision = res.json();
      expect(decision.allowed).toBe(false);
      expect(decision.rejectionReasons.length).toBeGreaterThanOrEqual(3);
    });
  });
});
