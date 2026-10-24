import { describe, it, expect } from 'vitest';
import {
  ModelGateway,
  MockModelAdapter,
  ModelSpec,
} from '../../platform/model-gateway/src/index.js';

describe('Task 2.2: Model Gateway & Multi-Provider Routing (FR-094)', () => {
  const fastModel: ModelSpec = {
    id: 'fast-model-1',
    name: 'Fast Mock Model',
    provider: 'mock',
    contextWindow: 128000,
    costPerInputToken: 0.00000015,
    costPerOutputToken: 0.0000006,
    capabilities: ['fast'],
    tier: 'fast',
    priority: 10,
  };

  const reasoningModel: ModelSpec = {
    id: 'reasoning-model-1',
    name: 'Deep Reasoning Model',
    provider: 'mock',
    contextWindow: 200000,
    costPerInputToken: 0.000003,
    costPerOutputToken: 0.000015,
    capabilities: ['reasoning', 'code'],
    tier: 'deep_reasoning',
    priority: 10,
  };

  it('registers models and routes completions based on requested tier', async () => {
    const adapter = new MockModelAdapter('mock');
    const gateway = new ModelGateway();

    gateway.registerAdapter(adapter);
    gateway.registerModel(fastModel);
    gateway.registerModel(reasoningModel);

    // Fast tier routing
    const fastRes = await gateway.complete({
      tier: 'fast',
      messages: [{ role: 'user', content: 'Classify this intent quickly' }],
    });

    expect(fastRes.modelUsed).toBe('fast-model-1');
    expect(fastRes.provider).toBe('mock');
    expect(fastRes.usage.totalTokens).toBeGreaterThan(0);
    expect(fastRes.costEstimateUsd).toBeGreaterThan(0);

    // Deep reasoning tier routing
    const reasoningRes = await gateway.complete({
      tier: 'deep_reasoning',
      messages: [{ role: 'user', content: 'Design formal distributed consensus protocol' }],
    });

    expect(reasoningRes.modelUsed).toBe('reasoning-model-1');
    expect(reasoningRes.provider).toBe('mock');
  });

  it('tracks cumulative token metrics and total cost', async () => {
    const adapter = new MockModelAdapter('mock');
    const gateway = new ModelGateway();

    gateway.registerAdapter(adapter);
    gateway.registerModel(fastModel);

    await gateway.complete({
      model: 'fast-model-1',
      messages: [{ role: 'user', content: 'Hello' }],
    });

    await gateway.complete({
      model: 'fast-model-1',
      messages: [{ role: 'user', content: 'World' }],
    });

    const metrics = gateway.getMetrics();
    expect(metrics.totalCalls).toBe(2);
    expect(metrics.totalTokens).toBeGreaterThan(0);
    expect(metrics.totalCostUsd).toBeGreaterThan(0);
  });

  it('performs automatic failover when primary adapter encounters failure', async () => {
    // Failing primary adapter
    const failingAdapter = new MockModelAdapter('openai', { shouldFail: true });
    // Healthy secondary adapter
    const healthyAdapter = new MockModelAdapter('anthropic', { shouldFail: false });

    const primaryModel: ModelSpec = {
      id: 'openai-gpt',
      name: 'Primary Model',
      provider: 'openai',
      contextWindow: 128000,
      costPerInputToken: 0.000001,
      costPerOutputToken: 0.000002,
      capabilities: ['fast'],
      tier: 'fast',
      priority: 20, // Higher priority
    };

    const secondaryModel: ModelSpec = {
      id: 'claude-haiku',
      name: 'Fallback Model',
      provider: 'anthropic',
      contextWindow: 200000,
      costPerInputToken: 0.000001,
      costPerOutputToken: 0.000002,
      capabilities: ['fast'],
      tier: 'fast',
      priority: 10,
    };

    const gateway = new ModelGateway();
    gateway.registerAdapter(failingAdapter);
    gateway.registerAdapter(healthyAdapter);
    gateway.registerModel(primaryModel);
    gateway.registerModel(secondaryModel);

    // Request fast tier - primary should fail and fallback to secondary
    const response = await gateway.complete({
      tier: 'fast',
      messages: [{ role: 'user', content: 'Need fast response with fallback' }],
    });

    expect(response.provider).toBe('anthropic');
    expect(response.modelUsed).toBe('claude-haiku');
  });
});
