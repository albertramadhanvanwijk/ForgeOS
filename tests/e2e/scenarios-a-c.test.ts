import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Phase 6 — E2E Acceptance Scenarios A, B, C (Requirements 12)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Scenario A: Static Website Delivery End-to-End', () => {
    it('executes lean delivery pipeline: intent → design tokens → artifact generation → preview clearance', async () => {
      // 1. Intent classification (lean, skips irrelevant agents like database engineer)
      const intentRes = await app.inject({
        method: 'POST',
        url: '/api/intent/classify',
        payload: {
          prompt: 'Create a sleek landing page for a specialty artisan bakery in Bandung',
        },
      });
      expect(intentRes.statusCode).toBe(200);
      const intentData = intentRes.json();
      expect(intentData.intentType).toBeDefined();

      // 2. Compile Design Tokens Spec with deterministic exactVersionHash
      const designRes = await app.inject({
        method: 'POST',
        url: '/api/design/specs',
        payload: {
          projectId: 'proj-bakery-01',
          name: 'Artisan Bakery Design System',
          version: '1.0.0',
          tokens: {
            colors: {
              background: '#0a0a0b',
              foreground: '#f4f4f5',
              primary: '#d97706',
              secondary: '#78350f',
              muted: '#27272a',
            },
            typography: {
              fontFamily: 'Inter, sans-serif',
              headings: 'Playfair Display, serif',
            },
            radii: {
              card: '8px',
              button: '6px',
            },
          },
          components: [
            { name: 'HeroBanner', spec: 'Responsive viewport with CTA button' },
            { name: 'ProductGrid', spec: '3-column grid displaying artisan pastries' },
          ],
        },
      });
      expect(designRes.statusCode).toBe(201);
      const designSpec = designRes.json().spec;
      expect(designSpec.exactVersionHash).toHaveLength(64);

      // 3. Approve Design Spec
      const approveDesignRes = await app.inject({
        method: 'POST',
        url: `/api/design/specs/${designSpec.id}/approve`,
        payload: {
          approvedBy: 'lead-designer',
          rationale: 'Approved warm bakery visual identity',
        },
      });
      expect(approveDesignRes.statusCode).toBe(200);

      // 4. Register Generated TSX Deliverable in Artifact Registry
      const artifactRes = await app.inject({
        method: 'POST',
        url: '/api/artifacts',
        payload: {
          projectId: 'proj-bakery-01',
          title: 'BakeryLandingPage.tsx',
          type: 'code',
          content: 'export default function BakeryLanding() { return <div>Artisan Bakery</div>; }',
          metadata: {
            designVersionHash: designSpec.exactVersionHash,
            targetViewport: 'responsive',
          },
        },
      });
      expect(artifactRes.statusCode).toBe(201);
      const artifact = artifactRes.json();
      expect(artifact.id).toBeDefined();

      // 5. Evaluate Quality Gates & Clearance (FR-060, FR-063)
      const qualityRes = await app.inject({
        method: 'POST',
        url: '/api/quality/evaluate',
        payload: {
          taskId: 'task-static-website',
          artifactId: artifact.id,
          gates: [
            {
              id: 'gate-lint',
              name: 'Design System Compliance',
              type: 'lint',
              severity: 'mandatory',
            },
          ],
        },
      });
      expect(qualityRes.statusCode).toBe(200);
      const qualityData = qualityRes.json();
      expect(qualityData.passed).toBe(true);
      expect(qualityData.blockingViolations).toHaveLength(0);
    });
  });

  describe('Scenario B: Dynamic SaaS Task with Access Control & Approval Gate', () => {
    it('enforces RBAC permission validation and governance approval before release', async () => {
      // 1. Check actor authorization (default-deny policy)
      const authRes = await app.inject({
        method: 'POST',
        url: '/api/policy/authorize',
        payload: {
          actor: 'engineer-01',
          role: 'engineer',
          action: 'db:migrate',
          resource: 'tenants_table',
          correlationId: 'corr-saas-01',
        },
      });
      expect(authRes.statusCode).toBe(200);

      // 2. Request change approval for sensitive SaaS deployment
      const approvalRes = await app.inject({
        method: 'POST',
        url: '/api/policy/approvals',
        payload: {
          projectId: 'proj-saas-01',
          action: 'production_release',
          resourceType: 'service',
          resourceId: 'billing-api',
          exactVersionHash: '4f92a10be6975294',
          requestedBy: 'engineer-01',
          rationale: 'Release multi-tenant subscription billing service',
        },
      });
      expect(approvalRes.statusCode).toBe(201);
      const approvalRecord = approvalRes.json();

      // 3. Approve via governance gate
      const decideRes = await app.inject({
        method: 'POST',
        url: `/api/policy/approvals/${approvalRecord.id}/decide`,
        payload: {
          decision: 'approved',
          decidedBy: 'engineering-director',
        },
      });
      expect(decideRes.statusCode).toBe(200);
      expect(decideRes.json().status).toBe('approved');
    });
  });

  describe('Scenario C: Bug Fix Workflow with Self-Healing Verification', () => {
    it('diagnoses failure, applies scoped patch, and verifies clean resolution', async () => {
      const failedEvaluation = {
        taskId: 'tsk-bugfix-01',
        passed: false,
        blockingViolations: [
          {
            gateId: 'gate-api-tests',
            name: 'API Regression Tests',
            type: 'unit_test',
            severity: 'mandatory',
            status: 'failed',
            message: 'AssertionError: expected status 200 but received 500',
            evidence: { stderr: 'TypeError: Cannot read properties of undefined (reading id)' },
            durationMs: 310,
            executedAt: new Date(),
          },
        ],
        results: [],
        summary: 'API Regression Tests failed',
        evaluatedAt: new Date(),
      };

      const selfHealRes = await app.inject({
        method: 'POST',
        url: '/api/quality/self-heal',
        payload: {
          evaluation: failedEvaluation,
          patch: {
            patchId: 'patch-null-check',
            filePath: 'platform/orchestrator/src/app.ts',
            diff: '+ if (!user) return reply.status(404);',
          },
          verificationResult: {
            passed: true,
            blockingViolations: [],
          },
        },
      });

      expect(selfHealRes.statusCode).toBe(200);
      const healResult = selfHealRes.json();
      expect(healResult.status).toBe('resolved');
      expect(healResult.attempts).toBe(1);
    });
  });
});
