import type {
  RolePolicy,
  AuthorizationRequest,
  AuthorizationResult,
} from './types.js';
import type { IAuditLogger } from './audit.js';

export class PolicyEngine {
  private rolePolicies: Map<string, RolePolicy> = new Map();

  // Immutable escalation block list (FR-028)
  private static readonly ESCALATION_ACTIONS = new Set([
    'grant_permissions',
    'modify_policy',
    'escalate_privileges',
    'bypass_approval',
    'disable_tests',
    'alter_audit_log',
  ]);

  constructor(private readonly auditLogger: IAuditLogger) {}

  registerRolePolicy(policy: RolePolicy): void {
    this.rolePolicies.set(policy.roleId, policy);
  }

  getRolePolicy(roleId: string): RolePolicy | undefined {
    return this.rolePolicies.get(roleId);
  }

  async authorize(req: AuthorizationRequest): Promise<AuthorizationResult> {
    // 1. Strict Privilege Escalation Protection (FR-028)
    if (PolicyEngine.ESCALATION_ACTIONS.has(req.action)) {
      const reason = `Privilege escalation is strictly forbidden: action "${req.action}" cannot be performed by agents`;

      await this.auditLogger.log({
        actor: req.actor,
        action: req.action,
        resourceType: 'policy',
        resourceId: req.resource,
        outcome: 'denied',
        correlationId: req.correlationId,
        details: { reason },
      });

      return { allowed: false, reason };
    }

    // 2. Resolve Role Policy (Default Deny)
    const policy = this.rolePolicies.get(req.role);
    if (!policy) {
      const reason = `No policy defined for role "${req.role}". Default-deny enforced.`;

      await this.auditLogger.log({
        actor: req.actor,
        action: req.action,
        resourceType: 'role',
        resourceId: req.resource,
        outcome: 'denied',
        correlationId: req.correlationId,
        details: { reason },
      });

      return { allowed: false, reason };
    }

    // 3. Explicit Disallow check
    if (policy.disallowedActions?.includes(req.action)) {
      const reason = `Action "${req.action}" is explicitly disallowed for role "${req.role}".`;

      await this.auditLogger.log({
        actor: req.actor,
        action: req.action,
        resourceType: 'action',
        resourceId: req.resource,
        outcome: 'denied',
        correlationId: req.correlationId,
        details: { reason },
      });

      return { allowed: false, reason };
    }

    // 4. Allowed actions check
    const isAllowed = policy.allowedActions.includes(req.action) || policy.allowedActions.includes('*');

    if (!isAllowed) {
      const reason = `Action "${req.action}" is not authorized for role "${req.role}".`;

      await this.auditLogger.log({
        actor: req.actor,
        action: req.action,
        resourceType: 'action',
        resourceId: req.resource,
        outcome: 'denied',
        correlationId: req.correlationId,
        details: { reason },
      });

      return { allowed: false, reason };
    }

    // Authorized
    await this.auditLogger.log({
      actor: req.actor,
      action: req.action,
      resourceType: 'action',
      resourceId: req.resource,
      outcome: 'allowed',
      correlationId: req.correlationId,
    });

    return { allowed: true };
  }
}
