import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { projectsRoutes } from './projects/projects.routes.js';
import { ProjectsService } from './projects/projects.service.js';
import { InMemoryProjectStore } from './projects/project-store.js';
import { registryRoutes } from './registry/registry.routes.js';
import { AgentRegistry } from '@forgeos/agent-registry';
import { workflowsRoutes } from './workflows/workflows.routes.js';
import { WorkflowEngine, InMemoryWorkflowStore } from '@forgeos/workflow-engine';
import { policyRoutes } from './policy/policy.routes.js';
import {
  PolicyEngine,
  ApprovalService,
  InMemoryApprovalStore,
  InMemoryAuditLogger,
} from '@forgeos/policy-engine';
import { artifactsRoutes } from './artifacts/artifacts.routes.js';
import { ArtifactRegistry, InMemoryArtifactStorage } from '@forgeos/artifact-registry';
import { ConversationService, IntentClassifier, registerIntentRoutes } from './intent/index.js';
import { registerModelRoutes } from './models/models.routes.js';
import { ModelGateway, MockModelAdapter } from '@forgeos/model-gateway';
import { registerRunnerRoutes } from './runner/runner.routes.js';
import { IRunnerAdapter, LocalProcessRunner } from '@forgeos/runner';
import { GitService, registerGitRoutes } from './git/index.js';
import { QualityEngine } from '@forgeos/quality-engine';
import { registerQualityRoutes } from './quality/quality.routes.js';
import {
  StructuredLogger,
  FailureExplainer,
  LimitEnforcer,
} from '@forgeos/observability';
import { registerObservabilityRoutes } from './observability/observability.routes.js';
import {
  PersistentMemoryService,
  ContextPackager,
} from '@forgeos/persistent-memory';
import { registerMemoryRoutes } from './memory/memory.routes.js';
import { DesignStudioEngine } from '@forgeos/design-studio';
import { registerDesignRoutes } from './design/design.routes.js';

export interface ServerOptions {
  logger?: boolean;
  projectsService?: ProjectsService;
  agentRegistry?: AgentRegistry;
  workflowEngine?: WorkflowEngine;
  policyEngine?: PolicyEngine;
  approvalService?: ApprovalService;
  auditLogger?: InMemoryAuditLogger;
  artifactRegistry?: ArtifactRegistry;
  conversationService?: ConversationService;
  intentClassifier?: IntentClassifier;
  modelGateway?: ModelGateway;
  runner?: IRunnerAdapter;
  gitService?: GitService;
  qualityEngine?: QualityEngine;
  structuredLogger?: StructuredLogger;
  failureExplainer?: FailureExplainer;
  limitEnforcer?: LimitEnforcer;
  memoryService?: PersistentMemoryService;
  contextPackager?: ContextPackager;
  designEngine?: DesignStudioEngine;
}

export async function createServer(opts: ServerOptions = { logger: false }): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'forgeos-orchestrator',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  });

  // Projects Service & Routes (FR-001, FR-002)
  const projectsService =
    opts.projectsService ?? new ProjectsService(new InMemoryProjectStore());

  await app.register(projectsRoutes, {
    prefix: '/api/projects',
    service: projectsService,
  });

  // Agent Registry Routes (FR-020 - FR-024, FR-027)
  await app.register(registryRoutes, {
    prefix: '/api/registry',
    registry: opts.agentRegistry,
  });

  // Workflow Engine Routes (FR-011, FR-016, FR-017, FR-018)
  const workflowEngine =
    opts.workflowEngine ?? new WorkflowEngine(new InMemoryWorkflowStore());

  await app.register(workflowsRoutes, {
    prefix: '/api/workflows',
    engine: workflowEngine,
  });

  // Policy Engine & Approvals Routes (FR-015, FR-025, FR-028, FR-093)
  const auditLogger = opts.auditLogger ?? new InMemoryAuditLogger();
  const policyEngine = opts.policyEngine ?? new PolicyEngine(auditLogger);
  const approvalService =
    opts.approvalService ?? new ApprovalService(new InMemoryApprovalStore());

  await app.register(policyRoutes, {
    prefix: '/api/policy',
    policyEngine,
    approvalService,
    auditLogger,
  });

  // Artifact Registry Routes (FR-030 - FR-036)
  const artifactRegistry =
    opts.artifactRegistry ?? new ArtifactRegistry(new InMemoryArtifactStorage());

  await app.register(artifactsRoutes, {
    prefix: '/api/artifacts',
    registry: artifactRegistry,
  });

  // Intent & Conversation Routes (FR-003, FR-004, FR-005, FR-006, FR-007, FR-010, FR-012)
  const conversationService = opts.conversationService ?? new ConversationService();
  const intentClassifier = opts.intentClassifier ?? new IntentClassifier();

  registerIntentRoutes(app, {
    conversationService,
    intentClassifier,
  });

  // Model Gateway Routes (FR-094)
  let modelGateway = opts.modelGateway;
  if (!modelGateway) {
    modelGateway = new ModelGateway();
    modelGateway.registerAdapter(new MockModelAdapter('mock'));
    modelGateway.registerModel({
      id: 'mock-fast',
      name: 'Default Fast Mock',
      provider: 'mock',
      contextWindow: 128000,
      costPerInputToken: 0.00000015,
      costPerOutputToken: 0.0000006,
      capabilities: ['fast'],
      tier: 'fast',
      priority: 10,
    });
    modelGateway.registerModel({
      id: 'mock-reasoning',
      name: 'Default Deep Reasoning Mock',
      provider: 'mock',
      contextWindow: 200000,
      costPerInputToken: 0.000003,
      costPerOutputToken: 0.000015,
      capabilities: ['reasoning', 'code'],
      tier: 'deep_reasoning',
      priority: 10,
    });
  }

  registerModelRoutes(app, {
    gateway: modelGateway,
  });

  // Runner Routes (FR-042, FR-043, FR-044, FR-047, FR-048)
  const runner = opts.runner ?? new LocalProcessRunner({
    allowedCommands: ['node', 'git', 'pnpm', 'npm', 'tsc', 'vitest'],
  });

  registerRunnerRoutes(app, {
    runner,
  });

  // Git Integration Routes (FR-040, FR-041, FR-046)
  const gitService = opts.gitService ?? new GitService(runner);

  registerGitRoutes(app, {
    gitService,
  });

  // Quality Engine Routes (FR-060, FR-061, FR-063)
  const qualityEngine = opts.qualityEngine ?? new QualityEngine();

  registerQualityRoutes(app, {
    qualityEngine,
    runner,
  });

  // Observability & Tracing Routes (FR-090, FR-091, FR-092)
  const structuredLogger = opts.structuredLogger ?? new StructuredLogger();
  const failureExplainer = opts.failureExplainer ?? new FailureExplainer();
  const limitEnforcer = opts.limitEnforcer ?? new LimitEnforcer({
    maxCostUsd: 10.0,
    maxDurationMs: 600000,
    maxConcurrency: 10,
    maxRetries: 3,
  });

  registerObservabilityRoutes(app, {
    logger: structuredLogger,
    explainer: failureExplainer,
    limitEnforcer,
  });

  // Persistent Memory Routes (MEM-001 - MEM-018)
  const memoryService = opts.memoryService ?? new PersistentMemoryService();
  const contextPackager = opts.contextPackager ?? new ContextPackager(memoryService);

  registerMemoryRoutes(app, {
    memoryService,
    contextPackager,
  });

  // Design Studio Routes (FR-050 - FR-055)
  const designEngine = opts.designEngine ?? new DesignStudioEngine();

  registerDesignRoutes(app, {
    designEngine,
  });

  return app;
}
