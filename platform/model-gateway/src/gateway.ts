import {
  IModelAdapter,
  ModelProvider,
  ModelSpec,
  CompletionRequest,
  CompletionResponse,
  GatewayMetrics,
  ModelTier,
} from './types.js';

export class ModelGateway {
  private adapters = new Map<ModelProvider, IModelAdapter>();
  private models = new Map<string, ModelSpec>();

  private metrics: GatewayMetrics = {
    totalCalls: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    callsByProvider: {},
    callsByTier: {},
  };

  public registerAdapter(adapter: IModelAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  public registerModel(spec: ModelSpec): void {
    this.models.set(spec.id, spec);
  }

  public getModel(id: string): ModelSpec | undefined {
    return this.models.get(id);
  }

  public listModels(): ModelSpec[] {
    return Array.from(this.models.values());
  }

  public getMetrics(): GatewayMetrics {
    return {
      ...this.metrics,
      callsByProvider: { ...this.metrics.callsByProvider },
      callsByTier: { ...this.metrics.callsByTier },
    };
  }

  public async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const candidateModels = this.resolveCandidateModels(request);

    if (candidateModels.length === 0) {
      throw new Error(`No eligible models found for request (tier: ${request.tier || 'unspecified'}, model: ${request.model || 'unspecified'})`);
    }

    let lastError: Error | null = null;

    // Try candidates in priority order (automatic failover)
    for (const modelSpec of candidateModels) {
      const adapter = this.adapters.get(modelSpec.provider);
      if (!adapter) {
        continue;
      }

      try {
        const response = await adapter.complete(request, modelSpec);
        this.recordMetrics(response, modelSpec.tier);
        return response;
      } catch (err: any) {
        lastError = err;
        // Proceed to next fallback candidate
        continue;
      }
    }

    throw new Error(`All candidate models/providers failed. Last error: ${lastError?.message || 'unknown'}`);
  }

  private resolveCandidateModels(request: CompletionRequest): ModelSpec[] {
    const allModels = Array.from(this.models.values());

    // 1. If explicit model requested
    if (request.model) {
      const exact = this.models.get(request.model);
      if (exact) return [exact];
    }

    // 2. Filter by tier
    const targetTier: ModelTier = request.tier || 'balanced';
    let filtered = allModels.filter((m) => m.tier === targetTier);

    // If no models for target tier, fallback to any available model
    if (filtered.length === 0) {
      filtered = allModels;
    }

    // Sort by priority descending (higher number = preferred)
    return filtered.sort((a, b) => b.priority - a.priority);
  }

  private recordMetrics(response: CompletionResponse, tier: ModelTier): void {
    this.metrics.totalCalls += 1;
    this.metrics.totalTokens += response.usage.totalTokens;
    this.metrics.totalCostUsd = Number((this.metrics.totalCostUsd + response.costEstimateUsd).toFixed(8));

    this.metrics.callsByProvider[response.provider] =
      (this.metrics.callsByProvider[response.provider] || 0) + 1;

    this.metrics.callsByTier[tier] =
      (this.metrics.callsByTier[tier] || 0) + 1;
  }
}
