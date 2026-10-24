export type ModelProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'mock';

export type ModelCapability = 'reasoning' | 'fast' | 'vision' | 'code' | 'long_context';

export type ModelTier = 'fast' | 'balanced' | 'deep_reasoning';

export interface ModelSpec {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;
  costPerInputToken: number;
  costPerOutputToken: number;
  capabilities: ModelCapability[];
  tier: ModelTier;
  priority: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface CompletionRequest {
  model?: string;
  tier?: ModelTier;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CompletionResponse {
  content: string;
  modelUsed: string;
  provider: ModelProvider;
  usage: TokenUsage;
  costEstimateUsd: number;
  latencyMs: number;
}

export interface GatewayMetrics {
  totalCalls: number;
  totalTokens: number;
  totalCostUsd: number;
  callsByProvider: Record<string, number>;
  callsByTier: Record<string, number>;
}

export interface IModelAdapter {
  readonly provider: ModelProvider;
  isAvailable(): Promise<boolean>;
  complete(request: CompletionRequest, spec: ModelSpec): Promise<CompletionResponse>;
}
