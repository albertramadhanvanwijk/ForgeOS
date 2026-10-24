import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createServer } from '../../platform/orchestrator/src/app.js';

describe('Task 2.1: Conversational Orchestrator API (FR-003 - FR-007, FR-010, FR-012)', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createServer({ logger: false });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('classifies direct intent requests via /api/intent/classify', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/intent/classify',
      payload: {
        prompt: 'Build a new authentication service with OAuth2 support and rate limiting',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.intentType).toBe('create');
    expect(body.suggestedWorkflow).toBe('workflow-greenfield-engineering');
    expect(body.suggestedRoles).toContain('solution-architect');
    expect(body.suggestedRoles).toContain('software-engineer');
    expect(body.extractedGoals.length).toBeGreaterThan(0);
    expect(body.acceptanceCriteria.length).toBeGreaterThan(0);
  });

  it('creates conversations and maintains conversation history under a project', async () => {
    // 1. Create project
    const projRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: {
        name: 'Alpha Project',
        goal: 'Develop next-gen backend',
      },
    });
    const project = JSON.parse(projRes.payload);

    // 2. Create conversation
    const convRes = await app.inject({
      method: 'POST',
      url: `/api/projects/${project.id}/conversations`,
      payload: {
        title: 'Project Inception Conversation',
      },
    });
    expect(convRes.statusCode).toBe(201);
    const conversation = JSON.parse(convRes.payload);
    expect(conversation.id).toBeDefined();
    expect(conversation.projectId).toBe(project.id);

    // 3. Post first user message (ambiguous prompt)
    const msg1Res = await app.inject({
      method: 'POST',
      url: `/api/conversations/${conversation.id}/messages`,
      payload: {
        prompt: 'help',
      },
    });
    expect(msg1Res.statusCode).toBe(200);
    const msg1Body = JSON.parse(msg1Res.payload);
    expect(msg1Body.requiresClarification).toBe(true);
    expect(msg1Body.analysis.clarifyingQuestions.length).toBeGreaterThan(0);

    // 4. Post follow-up clarification message
    const msg2Res = await app.inject({
      method: 'POST',
      url: `/api/conversations/${conversation.id}/messages`,
      payload: {
        prompt: 'Fix the failing checkout API where database connection timeouts occur under load',
      },
    });
    expect(msg2Res.statusCode).toBe(200);
    const msg2Body = JSON.parse(msg2Res.payload);
    expect(msg2Body.requiresClarification).toBe(false);
    expect(msg2Body.analysis.intentType).toBe('troubleshoot');
    expect(msg2Body.adaptivePlan).toBeDefined();
    expect(msg2Body.adaptivePlan.tasks.length).toBeGreaterThan(0);

    // 5. Verify conversation history retrieval
    const historyRes = await app.inject({
      method: 'GET',
      url: `/api/conversations/${conversation.id}/messages`,
    });
    expect(historyRes.statusCode).toBe(200);
    const history = JSON.parse(historyRes.payload);
    // 2 user messages + 2 assistant replies = 4 messages
    expect(history).toHaveLength(4);
    expect(history[0].role).toBe('user');
    expect(history[1].role).toBe('assistant');
    expect(history[2].role).toBe('user');
    expect(history[3].role).toBe('assistant');
  });
});
