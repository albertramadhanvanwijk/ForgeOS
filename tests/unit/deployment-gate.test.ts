import { describe, it, expect } from 'vitest';
import {
  DeploymentPolicyGate,
  DeploymentRequest,
} from '../../platform/policy-engine/src/deployment-gate.js';

describe('Task 5.3: Policy-Controlled Production Deployment (FR-065)', () => {
  const gate = new DeploymentPolicyGate();

  const validDeployment: DeploymentRequest = {
    deploymentId: 'dep-001',
    environment: 'production',
    commitHash: '78c84461b2390a42',
    isWorkingTreeClean: true,
    allMandatoryGatesPassed: true,
    changeAuthorization: {
      authorized: true,
      approver: 'lead-dev',
      exactVersionHash: '4f92a10be6975294',
    },
    rollbackSnapshotId: 'snap-20261025-001',
    requestedAt: new Date(),
  };

  it('allows production deployment when all criteria and rollback snapshot are satisfied', () => {
    const decision = gate.evaluateDeployment(validDeployment);

    expect(decision.allowed).toBe(true);
    expect(decision.rejectionReasons).toHaveLength(0);
    expect(decision.evaluatedAt).toBeDefined();
  });

  it('blocks deployment when working tree is dirty', () => {
    const dirtyDeployment: DeploymentRequest = {
      ...validDeployment,
      isWorkingTreeClean: false,
    };

    const decision = gate.evaluateDeployment(dirtyDeployment);
    expect(decision.allowed).toBe(false);
    expect(decision.rejectionReasons).toContain('Working tree has uncommitted modifications');
  });

  it('blocks deployment when mandatory quality gates have not passed', () => {
    const failingQualityDeployment: DeploymentRequest = {
      ...validDeployment,
      allMandatoryGatesPassed: false,
    };

    const decision = gate.evaluateDeployment(failingQualityDeployment);
    expect(decision.allowed).toBe(false);
    expect(decision.rejectionReasons).toContain('Mandatory quality verification gates have not passed');
  });

  it('blocks deployment when change authorization is missing or unapproved', () => {
    const unauthorizedDeployment: DeploymentRequest = {
      ...validDeployment,
      changeAuthorization: {
        authorized: false,
      },
    };

    const decision = gate.evaluateDeployment(unauthorizedDeployment);
    expect(decision.allowed).toBe(false);
    expect(decision.rejectionReasons).toContain('Production deployment lacks approved ChangeAuthorization');
  });

  it('blocks deployment when rollback snapshot is missing', () => {
    const noSnapshotDeployment: DeploymentRequest = {
      ...validDeployment,
      rollbackSnapshotId: undefined,
    };

    const decision = gate.evaluateDeployment(noSnapshotDeployment);
    expect(decision.allowed).toBe(false);
    expect(decision.rejectionReasons).toContain('Rollback snapshot must be prepared before production deployment');
  });
});
