import { createHash, randomUUID } from 'node:crypto';
import type {
  UserFlow,
  DesignSystemSpec,
  DesignImpactResult,
  UIComplianceResult,
} from './types.js';
import { analyzeDesignImpact } from './impact-analyzer.js';
import { validateUICompliance } from './compliance-validator.js';

export class DesignStudioEngine {
  private userFlows = new Map<string, UserFlow>();
  private designSpecs = new Map<string, DesignSystemSpec>();

  /**
   * Computes deterministic SHA-256 hash over canonical serialized design spec.
   */
  public computeExactVersionHash(spec: Omit<DesignSystemSpec, 'id' | 'exactVersionHash' | 'status' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt' | 'rationale'>): string {
    const canonicalPayload = JSON.stringify({
      projectId: spec.projectId,
      name: spec.name,
      version: spec.version,
      tokens: spec.tokens,
      components: spec.components,
      sitemap: spec.sitemap,
    });
    return createHash('sha256').update(canonicalPayload).digest('hex');
  }

  /**
   * FR-050: Requirements & User Flows before Complex UI
   */
  public createUserFlow(flow: Omit<UserFlow, 'id' | 'createdAt'>): UserFlow {
    if (!flow.actor?.trim() || !flow.steps || flow.steps.length === 0) {
      throw new Error('User flow must include an actor and at least one step.');
    }

    const created: UserFlow = {
      ...flow,
      id: randomUUID(),
      createdAt: new Date(),
    };

    this.userFlows.set(created.id, created);
    return created;
  }

  public getUserFlow(id: string): UserFlow | undefined {
    return this.userFlows.get(id);
  }

  public getUserFlowsByProject(projectId: string): UserFlow[] {
    return Array.from(this.userFlows.values()).filter((f) => f.projectId === projectId);
  }

  /**
   * FR-051: Sitemap, Wireframes, Tokens, and Components Spec
   */
  public createDesignSystemSpec(
    params: Omit<DesignSystemSpec, 'id' | 'exactVersionHash' | 'status' | 'createdAt' | 'updatedAt' | 'approvedBy' | 'approvedAt' | 'rationale'>
  ): DesignSystemSpec {
    const hash = this.computeExactVersionHash(params);
    const id = randomUUID();

    const spec: DesignSystemSpec = {
      ...params,
      id,
      status: 'draft',
      exactVersionHash: hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.designSpecs.set(id, spec);
    return spec;
  }

  public getDesignSpec(id: string): DesignSystemSpec | undefined {
    return this.designSpecs.get(id);
  }

  public getDesignSpecsByProject(projectId: string): DesignSystemSpec[] {
    return Array.from(this.designSpecs.values()).filter((s) => s.projectId === projectId);
  }

  /**
   * FR-052: Governed Approval & Exact-Version Hash Binding
   */
  public approveDesignSpec(
    id: string,
    approval: { approvedBy: string; rationale: string }
  ): DesignSystemSpec {
    const spec = this.designSpecs.get(id);
    if (!spec) {
      throw new Error(`Design spec '${id}' not found.`);
    }

    spec.status = 'approved';
    spec.approvedBy = approval.approvedBy;
    spec.approvedAt = new Date();
    spec.rationale = approval.rationale;
    spec.updatedAt = new Date();

    return spec;
  }

  /**
   * FR-053: Enforce Approved Design System on Engineering Agents
   */
  public verifyDesignAdherence(
    specId: string,
    claimedHash: string
  ): { allowed: boolean; reason?: string } {
    const spec = this.designSpecs.get(specId);
    if (!spec) {
      return { allowed: false, reason: `Design spec '${specId}' does not exist.` };
    }

    if (spec.status !== 'approved') {
      return {
        allowed: false,
        reason: `Design spec '${specId}' is currently in '${spec.status}' status, not in 'approved' status.`,
      };
    }

    if (spec.exactVersionHash !== claimedHash) {
      return {
        allowed: false,
        reason: `Design system hash mismatch. Claimed '${claimedHash}' but active approved version is '${spec.exactVersionHash}'.`,
      };
    }

    return { allowed: true };
  }

  /**
   * FR-054: Impact Analysis on Design Change
   */
  public analyzeDesignImpact(v1: DesignSystemSpec, v2: DesignSystemSpec): DesignImpactResult {
    return analyzeDesignImpact(v1, v2);
  }

  /**
   * FR-055: Visual & Token Validation
   */
  public validateUICompliance(
    sourceCode: string,
    approvedSpec: DesignSystemSpec
  ): UIComplianceResult {
    return validateUICompliance(sourceCode, approvedSpec);
  }
}
