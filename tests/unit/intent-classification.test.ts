import { describe, it, expect } from 'vitest';
import {
  IntentClassifier,
  AdaptivePlanner,
} from '../../platform/orchestrator/src/intent/index.js';

describe('Task 2.1: Orchestrator Intent Classification & Adaptive Planning', () => {
  const classifier = new IntentClassifier();
  const planner = new AdaptivePlanner();

  describe('FR-005: Intent Classification (create | modify | investigate | troubleshoot)', () => {
    it('classifies greenfield creation requests correctly', () => {
      const result = classifier.classify({
        prompt: 'Build a new microservice for user notifications with PostgreSQL and Redis',
      });

      expect(result.intentType).toBe('create');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.suggestedWorkflow).toBe('workflow-greenfield-engineering');
      expect(result.suggestedRoles).toContain('solution-architect');
      expect(result.suggestedRoles).toContain('software-engineer');
    });

    it('classifies modification and feature enhancement requests correctly', () => {
      const result = classifier.classify({
        prompt: 'Add multi-factor authentication support to the existing auth service and update endpoints',
      });

      expect(result.intentType).toBe('modify');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.suggestedWorkflow).toBe('workflow-feature-enhancement');
    });

    it('classifies investigation and spike requests correctly', () => {
      const result = classifier.classify({
        prompt: 'Investigate performance bottlenecks in the database query layer and benchmark throughput',
      });

      expect(result.intentType).toBe('investigate');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.suggestedWorkflow).toBe('workflow-spike-investigation');
    });

    it('classifies troubleshooting and bug repair requests correctly', () => {
      const result = classifier.classify({
        prompt: 'Fix the failing checkout API where order transactions throw 500 null pointer exceptions',
      });

      expect(result.intentType).toBe('troubleshoot');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.suggestedWorkflow).toBe('workflow-incident-repair');
      expect(result.suggestedRoles).toContain('software-engineer');
      expect(result.suggestedRoles).toContain('qa-engineer');
    });
  });

  describe('FR-006: Material Ambiguity Detection & Clarifying Questions', () => {
    it('detects vague requests and generates targeted clarifying questions', () => {
      const result = classifier.classify({
        prompt: 'Fix it please',
      });

      expect(result.isAmbiguous).toBe(true);
      expect(result.clarifyingQuestions.length).toBeGreaterThan(0);
      expect(result.clarifyingQuestions.some((q) => q.toLowerCase().includes('error') || q.toLowerCase().includes('what') || q.toLowerCase().includes('which'))).toBe(true);
    });

    it('marks sufficiently detailed requests as non-ambiguous', () => {
      const result = classifier.classify({
        prompt: 'Implement a REST API endpoint POST /api/items that validates input schema and stores records in Postgres',
      });

      expect(result.isAmbiguous).toBe(false);
      expect(result.clarifyingQuestions).toHaveLength(0);
    });
  });

  describe('FR-004 & FR-007: Entity References & Multi-Turn Context', () => {
    it('extracts referenced tasks, artifacts, and projects from prompt', () => {
      const result = classifier.classify({
        prompt: 'Update artifact art-489 in task tsk-102 according to project prj-992 specifications',
      });

      expect(result.contextReferences).toBeDefined();
      expect(result.contextReferences?.artifactIds).toContain('art-489');
      expect(result.contextReferences?.taskIds).toContain('tsk-102');
      expect(result.contextReferences?.projectIds).toContain('prj-992');
    });

    it('resolves ambiguous follow-up messages using conversation history', () => {
      const result = classifier.classify({
        prompt: 'Yes, proceed with the Redis implementation and add unit tests',
        contextHistory: [
          { role: 'user', content: 'We need to fix cache timeouts in the payment service' },
          { role: 'assistant', content: 'Should we switch to Redis cluster or tune TTL settings?' },
        ],
      });

      expect(result.isAmbiguous).toBe(false);
      expect(result.intentType).toBe('troubleshoot');
    });
  });

  describe('FR-010 & FR-012: Goal Translation & Adaptive Workflow DAG Generation', () => {
    it('translates intent into measurable goals and criteria', () => {
      const result = classifier.classify({
        prompt: 'Build user notification microservice with tests and swagger docs',
      });

      expect(result.extractedGoals.length).toBeGreaterThan(0);
      expect(result.acceptanceCriteria.length).toBeGreaterThan(0);
    });

    it('synthesizes executable DAG workflow with ordered dependencies and roles', () => {
      const analysis = classifier.classify({
        prompt: 'Build user notification microservice with tests and swagger docs',
      });

      const plan = planner.generateWorkflowDAG({
        projectId: 'prj-test-1',
        analysis,
      });

      expect(plan.id).toBeDefined();
      expect(plan.tasks.length).toBeGreaterThanOrEqual(3);

      // Verify DAG dependency ordering
      const architectureTask = plan.tasks.find((t) => t.assignedRole === 'solution-architect');
      const engineeringTask = plan.tasks.find((t) => t.assignedRole === 'software-engineer');
      const qaTask = plan.tasks.find((t) => t.assignedRole === 'qa-engineer');

      expect(architectureTask).toBeDefined();
      expect(engineeringTask).toBeDefined();
      expect(qaTask).toBeDefined();

      if (architectureTask && engineeringTask) {
        expect(engineeringTask.dependencies).toContain(architectureTask.id);
      }
      if (engineeringTask && qaTask) {
        expect(qaTask.dependencies).toContain(engineeringTask.id);
      }
    });
  });
});
