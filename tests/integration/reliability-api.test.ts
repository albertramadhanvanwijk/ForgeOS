import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Task 5.5: Reliability, Evaluation & Deployment Gate API (FR-064, FR-065, FR-092, FR-095)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('FR-064: Self-Healing Repair API (/api/quality/self-heal)', () => {
    it('executes self-healing repair loop and returns resolved status when repair passes', async () => {
      const payload = {
        evaluation: {
          taskId: 'tsk-heal-api',
          passed: false,
          blockingViolations: [
            {
              gateId: 'gate-unit-test',
              name: 'Unit Tests',
              type: 'unit_test',
              severity: 'mandatory',
              status: 'failed',
              message: 'AssertionError: expected 200 to be 201',
              evidence: { stderr: 'AssertionError at api.test.ts:30' },
              durationMs: 320,
              executedAt: new Date(),
            },
          ],
          results: [],
          summary: '1 gate failed',
          evaluatedAt: new Date(),
        },
        patch: {
          patchId: 'pt-001',
          filePath: 'platform/orchestrator/src/app.ts',
          diff: '+ reply.status(201)',
        },
        verificationResult: {
          passed: true,
          blockingViolations: [],
        },
      };

      const res = await app.inject({
        method: 'POST',
        url: '/api/quality/self-heal',
        payload,
      });

      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.status).toBe('resolved');
      expect(data.attempts).toBe(1);
      expect(data.appliedPatches).toHaveLength(1);
    });
  });

  describe('FR-095: Outcome-Based Agent Evaluation API (/api/quality/evaluations)', () => {
    it('records agent execution and retrieves evaluation scorecard with grade', async () => {
      const recordPayload = {
        taskId: 'tsk-eval-01',
        agentRole: 'engineer',
        outcome: 'success',
        firstTryPass: true,
        schemaValid: true,
        toolCallsSucceeded: 6,
        toolCallsFailed: 0,
        tokensUsed: 1500,
        costUsd: 0.025,
        durationMs: 4000,
        policyViolations: 0,
      };

      const recordRes = await app.inject({
        method: 'POST',
        url: '/api/quality/evaluations/record',
        payload: recordPayload,
      });

      expect(recordRes.statusCode).toBe(201);

      const getRes = await app.inject({
        method: 'GET',
        url: '/api/quality/evaluations/engineer',
      });

      expect(getRes.statusCode).toBe(200);
      const report = getRes.json();
      expect(report.agentRole).toBe('engineer');
      expect(report.totalTasks).toBeGreaterThanOrEqual(1);
      expect(report.grade).toBe('A');
      expect(report.compositeScore).toBeGreaterThanOrEqual(90);
    });
  });

  describe('FR-065: Policy-Controlled Deployment Gate API (/api/policy/deployments/evaluate)', () => {
    it('approves deployment when all criteria are satisfied', async () => {
      const validPayload = {
        deploymentId: 'dep-test-01',
        environment: 'production',
        commitHash: '78c84461b2390a42',
        isWorkingTreeClean: true,
        allMandatoryGatesPassed: true,
        changeAuthorization: {
          authorized: true,
          approver: 'lead-dev',
          exactVersionHash: '4f92a10be6975294',
        },
        rollbackSnapshotId: 'snap-001',
      };

      const res = await app.inject({
        method: 'POST',
        url: '/api/policy/deployments/evaluate',
        payload: validPayload,
      });

      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.allowed).toBe(true);
      expect(data.rejectionReasons).toHaveLength(0);
    });

    it('rejects deployment with 403 when criteria fail', async () => {
      const invalidPayload = {
        deploymentId: 'dep-test-02',
        environment: 'production',
        commitHash: '78c84461b2390a42',
        isWorkingTreeClean: false, // Dirty tree
        allMandatoryGatesPassed: false, // Tests failed
        changeAuthorization: { authorized: false },
      };

      const res = await app.inject({
        method: 'POST',
        url: '/api/policy/deployments/evaluate',
        payload: invalidPayload,
      });

      expect(res.statusCode).toBe(403);
      const data = res.json();
      expect(data.allowed).toBe(false);
      expect(data.rejectionReasons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('FR-092: Context Compaction API (/api/observability/compact)', () => {
    it('compacts conversation history exceeding budget threshold into structured summary', async () => {
      const messages = [
        { role: 'user', content: 'Design landing page', timestamp: 1000 },
        { role: 'agent', agentRole: 'architect', content: 'PRD created', timestamp: 2000 },
        { role: 'agent', agentRole: 'designer', content: 'Design tokens established', timestamp: 3000 },
        { role: 'agent', agentRole: 'engineer', content: 'Hero.tsx scaffolded', timestamp: 4000 },
        { role: 'agent', agentRole: 'qa', content: 'All tests passed', timestamp: 5000 },
        { role: 'user', content: 'Add contact form', timestamp: 6000 },
        { role: 'agent', agentRole: 'engineer', content: 'ContactForm.tsx added', timestamp: 7000 },
      ];

      const res = await app.inject({
        method: 'POST',
        url: '/api/observability/compact',
        payload: {
          messages,
          maxMessagesBeforeCompaction: 5,
          retainRecentMessages: 2,
        },
      });

      expect(res.statusCode).toBe(200);
      const data = res.json();
      expect(data.wasCompacted).toBe(true);
      expect(data.messages[0].role).toBe('system');
      expect(data.messages[0].content).toContain('[CONTEXT SUMMARY]');
    });
  });
});
