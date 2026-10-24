import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Task 3.2: Design Studio API Integration (FR-050 - FR-055)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  const mockTokens = {
    colors: {
      background: '#0d0d10',
      surface: '#18181b',
      text: '#fafafa',
      primary: '#3b82f6',
      border: '#27272a',
    },
    typography: {
      fontFamilies: { sans: 'Inter, sans-serif' },
      fontSizes: { base: '14px' },
      fontWeights: { normal: '400' },
    },
    spacing: { md: '16px' },
    radii: { md: '8px' },
  };

  it('POST /api/design/user-flows creates structured user flows (FR-050)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/design/user-flows',
      payload: {
        projectId: 'proj-design-01',
        title: 'Customer Onboarding Flow',
        actor: 'New User',
        entryPoint: '/signup',
        successOutcome: '/dashboard',
        steps: [
          { stepNumber: 1, action: 'Fill Email & Password', screenOrPage: '/signup', expectedResult: 'Account created' },
          { stepNumber: 2, action: 'Complete Profile', screenOrPage: '/onboarding', expectedResult: 'Profile saved' },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.flow).toBeDefined();
    expect(body.flow.id).toBeDefined();
    expect(body.flow.steps.length).toBe(2);
  });

  it('POST /api/design/specs generates design spec and exactVersionHash (FR-051)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/design/specs',
      payload: {
        projectId: 'proj-design-01',
        name: 'ForgeOS Design System v1',
        version: '1.0.0',
        tokens: mockTokens,
        components: [
          {
            name: 'PrimaryButton',
            category: 'input',
            variants: { variant: ['solid', 'outline'] },
            requiredProps: ['label'],
            accessibilityRequirements: ['aria-label when icon only'],
          },
        ],
        sitemap: [
          { route: '/', title: 'Landing', componentName: 'LandingPage', requiredAuth: false },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.spec).toBeDefined();
    expect(body.spec.status).toBe('draft');
    expect(body.spec.exactVersionHash).toBeDefined();
    expect(body.spec.exactVersionHash.length).toBe(64);
  });

  it('POST /api/design/specs/:id/approve & adherence check (FR-052 & FR-053)', async () => {
    // 1. Create spec
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/design/specs',
      payload: {
        projectId: 'proj-design-01',
        name: 'Design for Approval',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      },
    });
    const spec = JSON.parse(createRes.body).spec;

    // 2. Before approval, adherence check should fail (FR-053)
    const checkBefore = await app.inject({
      method: 'POST',
      url: '/api/design/adherence',
      payload: {
        specId: spec.id,
        claimedHash: spec.exactVersionHash,
      },
    });
    expect(checkBefore.statusCode).toBe(200);
    expect(JSON.parse(checkBefore.body).allowed).toBe(false);

    // 3. Approve spec (FR-052)
    const approveRes = await app.inject({
      method: 'POST',
      url: `/api/design/specs/${spec.id}/approve`,
      payload: {
        approvedBy: 'lead-architect@forgeos.local',
        rationale: 'Validated against brand guideline and accessibility standards',
      },
    });
    expect(approveRes.statusCode).toBe(200);
    const approvedSpec = JSON.parse(approveRes.body).spec;
    expect(approvedSpec.status).toBe('approved');
    expect(approvedSpec.approvedBy).toBe('lead-architect@forgeos.local');

    // 4. After approval, adherence check passes with matching hash
    const checkAfter = await app.inject({
      method: 'POST',
      url: '/api/design/adherence',
      payload: {
        specId: spec.id,
        claimedHash: spec.exactVersionHash,
      },
    });
    expect(checkAfter.statusCode).toBe(200);
    expect(JSON.parse(checkAfter.body).allowed).toBe(true);
  });

  it('POST /api/design/validate checks UI code against approved tokens (FR-055)', async () => {
    // Create & approve spec
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/design/specs',
      payload: {
        projectId: 'proj-design-01',
        name: 'Validation Theme',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      },
    });
    const spec = JSON.parse(createRes.body).spec;

    // Validate bad code with rogue color
    const valRes = await app.inject({
      method: 'POST',
      url: '/api/design/validate',
      payload: {
        specId: spec.id,
        sourceCode: '<div style={{ color: "#ff1493" }}>Invalid</div>',
      },
    });

    expect(valRes.statusCode).toBe(200);
    const result = JSON.parse(valRes.body);
    expect(result.compliant).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });
});
