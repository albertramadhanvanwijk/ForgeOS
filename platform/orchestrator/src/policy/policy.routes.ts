import type { FastifyPluginAsync } from 'fastify';
import {
  PolicyEngine,
  ApprovalService,
  InMemoryApprovalStore,
  InMemoryAuditLogger,
  RequestApprovalInput,
  DecideApprovalInput,
  AuthorizationRequest,
  DeploymentPolicyGate,
  DeploymentRequest,
} from '@forgeos/policy-engine';

export interface PolicyPluginOptions {
  policyEngine?: PolicyEngine;
  approvalService?: ApprovalService;
  auditLogger?: InMemoryAuditLogger;
  deploymentGate?: DeploymentPolicyGate;
}

export const policyRoutes: FastifyPluginAsync<PolicyPluginOptions> = async (app, opts) => {
  const auditLogger = opts.auditLogger ?? new InMemoryAuditLogger();
  const policyEngine = opts.policyEngine ?? new PolicyEngine(auditLogger);
  const approvalService = opts.approvalService ?? new ApprovalService(new InMemoryApprovalStore());
  const deploymentGate = opts.deploymentGate ?? new DeploymentPolicyGate();

  // POST /api/policy/authorize - Authorize an action
  app.post<{
    Body: AuthorizationRequest;
  }>('/authorize', async (request, reply) => {
    const { actor, role, action, resource, correlationId } = request.body || {};

    if (!actor || !role || !action || !resource || !correlationId) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Properties actor, role, action, resource, and correlationId are all required',
      });
    }

    const result = await policyEngine.authorize(request.body);
    return reply.status(200).send(result);
  });

  // POST /api/policy/approvals - Request approval
  app.post<{
    Body: RequestApprovalInput;
  }>('/approvals', async (request, reply) => {
    const { projectId, action, resourceType, resourceId, exactVersionHash, requestedBy, rationale } =
      request.body || {};

    if (!projectId || !action || !resourceType || !resourceId || !exactVersionHash || !requestedBy || !rationale) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Missing required approval request fields',
      });
    }

    const record = await approvalService.requestApproval(request.body);
    return reply.status(201).send(record);
  });

  // POST /api/policy/approvals/:id/decide - Grant or reject approval
  app.post<{
    Params: {
      id: string;
    };
    Body: DecideApprovalInput;
  }>('/approvals/:id/decide', async (request, reply) => {
    const { id } = request.params;
    const { decision, decidedBy } = request.body || {};

    if (!decision || (decision !== 'approved' && decision !== 'rejected') || !decidedBy) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'decision ("approved" | "rejected") and decidedBy are required',
      });
    }

    try {
      const record = await approvalService.decideApproval(id, request.body);
      return reply.status(200).send(record);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(404).send({ error: 'Not Found', message });
    }
  });

  // POST /api/policy/deployments/evaluate - Policy deployment gate (FR-065)
  app.post<{
    Body: DeploymentRequest;
  }>('/deployments/evaluate', async (request, reply) => {
    const body = request.body;
    if (!body?.deploymentId || !body?.environment) {
      return reply.status(400).send({ error: 'Missing deploymentId or environment' });
    }

    const decision = deploymentGate.evaluateDeployment(body);
    const statusCode = decision.allowed ? 200 : 403;
    return reply.status(statusCode).send(decision);
  });

  // GET /api/policy/audit - Query audit logs (FR-093)
  app.get<{
    Querystring: {
      actor?: string;
      correlationId?: string;
    };
  }>('/audit', async (request, reply) => {
    const logs = auditLogger.getLogs(request.query);
    return reply.status(200).send(logs);
  });
};
