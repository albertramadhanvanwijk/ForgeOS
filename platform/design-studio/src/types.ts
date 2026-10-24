export interface UserFlowStep {
  stepNumber: number;
  action: string;
  screenOrPage: string;
  expectedResult: string;
}

export interface UserFlow {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  actor: string;
  entryPoint: string;
  successOutcome: string;
  steps: UserFlowStep[];
  createdAt: Date;
}

export interface TokenSet {
  colors: Record<string, string>;
  typography: {
    fontFamilies: Record<string, string>;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, string>;
  };
  spacing: Record<string, string>;
  radii: Record<string, string>;
}

export interface ComponentSpec {
  name: string;
  category: 'layout' | 'navigation' | 'input' | 'feedback' | 'display';
  variants: Record<string, string[]>;
  requiredProps: string[];
  accessibilityRequirements: string[];
}

export interface SitemapItem {
  route: string;
  title: string;
  componentName: string;
  requiredAuth: boolean;
}

export type DesignSpecStatus = 'draft' | 'in_review' | 'approved' | 'superseded';

export interface DesignSystemSpec {
  id: string;
  projectId: string;
  name: string;
  version: string;
  status: DesignSpecStatus;
  tokens: TokenSet;
  components: ComponentSpec[];
  sitemap: SitemapItem[];
  exactVersionHash: string;
  approvedBy?: string;
  approvedAt?: Date;
  rationale?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignImpactResult {
  tokenChanges: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  componentChanges: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  sitemapChanges: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  affectedRoutes: string[];
  requiresReApproval: boolean;
}

export interface UIComplianceViolation {
  rule: 'unapproved-color' | 'accessibility-alt-missing' | 'accessibility-button-empty' | 'malformed-structure';
  message: string;
  line?: number;
}

export interface UIComplianceResult {
  compliant: boolean;
  violations: UIComplianceViolation[];
}
