import { describe, it, expect, beforeEach } from 'vitest';
import {
  DesignStudioEngine,
  type DesignSystemSpec,
  type UserFlow,
  type TokenSet,
} from '@forgeos/design-studio';

describe('Task 3.2: Design Studio Engine (FR-050 - FR-055)', () => {
  let engine: DesignStudioEngine;

  const mockTokens: TokenSet = {
    colors: {
      background: '#0d0d10',
      surface: '#18181b',
      text: '#fafafa',
      primary: '#3b82f6',
      border: '#27272a',
    },
    typography: {
      fontFamilies: { sans: 'Inter, sans-serif', mono: 'JetBrains Mono, monospace' },
      fontSizes: { sm: '12px', base: '14px', lg: '18px' },
      fontWeights: { normal: '400', bold: '700' },
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
    },
    radii: {
      sm: '4px',
      md: '8px',
      full: '9999px',
    },
  };

  beforeEach(() => {
    engine = new DesignStudioEngine();
  });

  describe('FR-050: Requirements & User Flows before Complex UI', () => {
    it('creates and validates structured user flows before UI generation', () => {
      const flow: Omit<UserFlow, 'id' | 'createdAt'> = {
        projectId: 'proj-001',
        title: 'User Checkout Flow',
        actor: 'Customer',
        entryPoint: '/cart',
        successOutcome: '/order/confirmation',
        steps: [
          { stepNumber: 1, action: 'Click Checkout', screenOrPage: '/cart', expectedResult: 'Navigates to /checkout' },
          { stepNumber: 2, action: 'Fill Address & Payment', screenOrPage: '/checkout', expectedResult: 'Form validated' },
          { stepNumber: 3, action: 'Submit Order', screenOrPage: '/checkout', expectedResult: 'Redirect to confirmation' },
        ],
      };

      const created = engine.createUserFlow(flow);
      expect(created.id).toBeDefined();
      expect(created.steps.length).toBe(3);
    });

    it('rejects incomplete user flows missing steps or actor', () => {
      expect(() => {
        engine.createUserFlow({
          projectId: 'proj-001',
          title: 'Empty Flow',
          actor: '',
          entryPoint: '/home',
          successOutcome: '/done',
          steps: [],
        });
      }).toThrow(/actor and at least one step/i);
    });
  });

  describe('FR-051: Sitemap, Wireframes, Mockup, Tokens & Components', () => {
    it('generates a design system specification with deterministic exactVersionHash', () => {
      const spec = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'ForgeOS Hybrid System',
        version: '1.0.0',
        tokens: mockTokens,
        components: [
          {
            name: 'Button',
            category: 'input',
            variants: { variant: ['primary', 'secondary', 'destructive'], size: ['sm', 'md', 'lg'] },
            requiredProps: ['children'],
            accessibilityRequirements: ['Must support keyboard focus and aria-disabled'],
          },
        ],
        sitemap: [
          { route: '/', title: 'Home', componentName: 'HomePage', requiredAuth: false },
          { route: '/dashboard', title: 'Dashboard', componentName: 'DashboardPage', requiredAuth: true },
        ],
      });

      expect(spec.id).toBeDefined();
      expect(spec.status).toBe('draft');
      expect(spec.exactVersionHash).toMatch(/^[a-f0-9]{64}$/); // Valid SHA-256
    });

    it('produces distinct exactVersionHash when tokens change', () => {
      const spec1 = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'System A',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      });

      const modifiedTokens: TokenSet = {
        ...mockTokens,
        colors: { ...mockTokens.colors, primary: '#10b981' }, // Changed primary to emerald
      };

      const spec2 = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'System A',
        version: '1.0.0',
        tokens: modifiedTokens,
        components: [],
        sitemap: [],
      });

      expect(spec1.exactVersionHash).not.toEqual(spec2.exactVersionHash);
    });
  });

  describe('FR-052 & FR-053: Approve/Revise Design & Enforce Approved System', () => {
    it('allows governed approval with approval metadata and version binding', () => {
      const spec = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'Main Design',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      });

      const approved = engine.approveDesignSpec(spec.id, {
        approvedBy: 'lead-designer@forgeos.local',
        rationale: 'WCAG AAA contrast verified and visual tokens accepted',
      });

      expect(approved.status).toBe('approved');
      expect(approved.approvedBy).toBe('lead-designer@forgeos.local');
      expect(approved.approvedAt).toBeDefined();
    });

    it('blocks engineering UI generation if design spec is not approved (FR-053)', () => {
      const draftSpec = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'Draft System',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      });

      // Attempting to verify adherence against draft spec
      const adherence = engine.verifyDesignAdherence(draftSpec.id, draftSpec.exactVersionHash);
      expect(adherence.allowed).toBe(false);
      expect(adherence.reason).toMatch(/not in 'approved' status/i);
    });

    it('blocks engineering UI generation if hash mismatch occurs (FR-053)', () => {
      const spec = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'Approved System',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      });
      engine.approveDesignSpec(spec.id, { approvedBy: 'lead', rationale: 'Approved' });

      // Pass an altered or obsolete hash
      const adherence = engine.verifyDesignAdherence(spec.id, '0000000000000000000000000000000000000000000000000000000000000000');
      expect(adherence.allowed).toBe(false);
      expect(adherence.reason).toMatch(/hash mismatch/i);
    });

    it('permits engineering UI generation when approved with matching hash', () => {
      const spec = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'Approved System',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      });
      engine.approveDesignSpec(spec.id, { approvedBy: 'lead', rationale: 'Approved' });

      const adherence = engine.verifyDesignAdherence(spec.id, spec.exactVersionHash);
      expect(adherence.allowed).toBe(true);
    });
  });

  describe('FR-054: Impact Analysis on Design Change', () => {
    it('computes token, component, and sitemap differences between design versions', () => {
      const v1 = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'E-commerce Theme',
        version: '1.0.0',
        tokens: mockTokens,
        components: [
          { name: 'Button', category: 'input', variants: {}, requiredProps: [], accessibilityRequirements: [] },
          { name: 'Card', category: 'display', variants: {}, requiredProps: [], accessibilityRequirements: [] },
        ],
        sitemap: [
          { route: '/', title: 'Home', componentName: 'HomePage', requiredAuth: false },
          { route: '/pricing', title: 'Pricing', componentName: 'PricingPage', requiredAuth: false },
        ],
      });

      const updatedTokens: TokenSet = {
        ...mockTokens,
        colors: {
          ...mockTokens.colors,
          primary: '#2563eb', // modified
          secondary: '#64748b', // added
        },
      };

      const v2 = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'E-commerce Theme',
        version: '1.1.0',
        tokens: updatedTokens,
        components: [
          { name: 'Button', category: 'input', variants: { variant: ['primary'] }, requiredProps: [], accessibilityRequirements: [] }, // modified
          { name: 'Modal', category: 'feedback', variants: {}, requiredProps: [], accessibilityRequirements: [] }, // added (Card removed)
        ],
        sitemap: [
          { route: '/', title: 'Home', componentName: 'HomePage', requiredAuth: false },
          { route: '/checkout', title: 'Checkout', componentName: 'CheckoutPage', requiredAuth: true }, // added (/pricing removed)
        ],
      });

      const impact = engine.analyzeDesignImpact(v1, v2);

      expect(impact.tokenChanges.modified).toContain('colors.primary');
      expect(impact.tokenChanges.added).toContain('colors.secondary');
      expect(impact.componentChanges.added).toContain('Modal');
      expect(impact.componentChanges.removed).toContain('Card');
      expect(impact.componentChanges.modified).toContain('Button');
      expect(impact.sitemapChanges.added).toContain('/checkout');
      expect(impact.sitemapChanges.removed).toContain('/pricing');
      expect(impact.requiresReApproval).toBe(true);
    });
  });

  describe('FR-055: Visual & Token Validation', () => {
    it('passes compliant UI code using approved design tokens', () => {
      const spec = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'Compliant Theme',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      });

      const cleanCode = `
        export function Header() {
          return (
            <div className="bg-[#0d0d10] text-[#fafafa] p-4 border border-[#27272a]">
              <h1 className="text-lg font-bold">Welcome</h1>
            </div>
          );
        }
      `;

      const result = engine.validateUICompliance(cleanCode, spec);
      expect(result.compliant).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('detects unapproved rogue hex colors and accessibility violations', () => {
      const spec = engine.createDesignSystemSpec({
        projectId: 'proj-001',
        name: 'Compliant Theme',
        version: '1.0.0',
        tokens: mockTokens,
        components: [],
        sitemap: [],
      });

      const nonCompliantCode = `
        export function RogueBanner() {
          return (
            <div style={{ backgroundColor: '#ff0055', color: '#123456' }}>
              <img src="/banner.png" />
              <button onClick={() => alert('hi')}></button>
            </div>
          );
        }
      `;

      const result = engine.validateUICompliance(nonCompliantCode, spec);
      expect(result.compliant).toBe(false);
      expect(result.violations.some((v) => v.rule === 'unapproved-color' && v.message.includes('#ff0055'))).toBe(true);
      expect(result.violations.some((v) => v.rule === 'accessibility-alt-missing')).toBe(true);
      expect(result.violations.some((v) => v.rule === 'accessibility-button-empty')).toBe(true);
    });
  });
});
