export interface ChangeAuthorization {
  authorized: boolean;
  approver?: string;
  exactVersionHash?: string;
  rationale?: string;
  decidedAt?: Date;
}

export interface DeploymentRequest {
  deploymentId: string;
  environment: 'production' | 'staging' | 'preview';
  commitHash: string;
  isWorkingTreeClean: boolean;
  allMandatoryGatesPassed: boolean;
  changeAuthorization: ChangeAuthorization;
  rollbackSnapshotId?: string;
  requestedAt: Date;
}

export interface DeploymentDecision {
  allowed: boolean;
  deploymentId: string;
  environment: string;
  rejectionReasons: string[];
  evaluatedAt: Date;
}

export class DeploymentPolicyGate {
  public evaluateDeployment(request: DeploymentRequest): DeploymentDecision {
    const rejectionReasons: string[] = [];

    // Rule 1: Working tree must be strictly clean (no uncommitted diffs or dirty state)
    if (!request.isWorkingTreeClean) {
      rejectionReasons.push('Working tree has uncommitted modifications');
    }

    // Rule 2: Mandatory quality gates must all have passed
    if (!request.allMandatoryGatesPassed) {
      rejectionReasons.push('Mandatory quality verification gates have not passed');
    }

    // Rule 3: Change authorization must be approved
    if (!request.changeAuthorization?.authorized) {
      rejectionReasons.push('Production deployment lacks approved ChangeAuthorization');
    }

    // Rule 4: Rollback snapshot must be established before production release
    if (request.environment === 'production' && !request.rollbackSnapshotId) {
      rejectionReasons.push('Rollback snapshot must be prepared before production deployment');
    }

    return {
      allowed: rejectionReasons.length === 0,
      deploymentId: request.deploymentId,
      environment: request.environment,
      rejectionReasons,
      evaluatedAt: new Date(),
    };
  }
}
