import {
  IModelAdapter,
  ModelProvider,
  CompletionRequest,
  ModelSpec,
  CompletionResponse,
} from './types.js';

export class MockModelAdapter implements IModelAdapter {
  constructor(
    public readonly provider: ModelProvider = 'mock',
    private readonly options: { shouldFail?: boolean; mockResponse?: string } = {}
  ) {}

  public async isAvailable(): Promise<boolean> {
    return !this.options.shouldFail;
  }

  public async complete(request: CompletionRequest, spec: ModelSpec): Promise<CompletionResponse> {
    if (this.options.shouldFail) {
      throw new Error(`Provider ${this.provider} adapter failed: Service unavailable or rate limited`);
    }

    const promptText = request.messages.map((m) => m.content).join(' ');
    // Simple mock token estimation: ~4 chars per token
    const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
    const responseContent = this.options.mockResponse || `Mock completion for: ${promptText.substring(0, 50)}...`;
    const completionTokens = Math.max(1, Math.ceil(responseContent.length / 4));
    const totalTokens = promptTokens + completionTokens;

    const costEstimateUsd =
      promptTokens * spec.costPerInputToken + completionTokens * spec.costPerOutputToken;

    return {
      content: responseContent,
      modelUsed: spec.id,
      provider: this.provider,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      costEstimateUsd: Number(costEstimateUsd.toFixed(8)),
      latencyMs: 15,
    };
  }
}

export class OpenAIAdapter implements IModelAdapter {
  public readonly provider: ModelProvider = 'openai';

  constructor(private readonly apiKey = process.env.OPENAI_API_KEY) {}

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  public async complete(request: CompletionRequest, spec: ModelSpec): Promise<CompletionResponse> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    // In production, invoke https://api.openai.com/v1/chat/completions
    const promptText = request.messages.map((m) => m.content).join(' ');
    const promptTokens = Math.ceil(promptText.length / 4);
    const completionTokens = 50;
    const totalTokens = promptTokens + completionTokens;

    return {
      content: `[OpenAI ${spec.id}] Response to: ${promptText.substring(0, 40)}`,
      modelUsed: spec.id,
      provider: 'openai',
      usage: { promptTokens, completionTokens, totalTokens },
      costEstimateUsd: promptTokens * spec.costPerInputToken + completionTokens * spec.costPerOutputToken,
      latencyMs: 120,
    };
  }
}

export class AnthropicAdapter implements IModelAdapter {
  public readonly provider: ModelProvider = 'anthropic';

  constructor(private readonly apiKey = process.env.ANTHROPIC_API_KEY) {}

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  public async complete(request: CompletionRequest, spec: ModelSpec): Promise<CompletionResponse> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    const promptText = request.messages.map((m) => m.content).join(' ');
    const promptTokens = Math.ceil(promptText.length / 4);
    const completionTokens = 50;
    const totalTokens = promptTokens + completionTokens;

    return {
      content: `[Anthropic ${spec.id}] Response to: ${promptText.substring(0, 40)}`,
      modelUsed: spec.id,
      provider: 'anthropic',
      usage: { promptTokens, completionTokens, totalTokens },
      costEstimateUsd: promptTokens * spec.costPerInputToken + completionTokens * spec.costPerOutputToken,
      latencyMs: 130,
    };
  }
}

export class GeminiAdapter implements IModelAdapter {
  public readonly provider: ModelProvider = 'gemini';

  constructor(private readonly apiKey = process.env.GEMINI_API_KEY) {}

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  public async complete(request: CompletionRequest, spec: ModelSpec): Promise<CompletionResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    const promptText = request.messages.map((m) => m.content).join(' ');
    const promptTokens = Math.ceil(promptText.length / 4);
    const completionTokens = 50;
    const totalTokens = promptTokens + completionTokens;

    return {
      content: `[Gemini ${spec.id}] Response to: ${promptText.substring(0, 40)}`,
      modelUsed: spec.id,
      provider: 'gemini',
      usage: { promptTokens, completionTokens, totalTokens },
      costEstimateUsd: promptTokens * spec.costPerInputToken + completionTokens * spec.costPerOutputToken,
      latencyMs: 110,
    };
  }
}

export class OllamaAdapter implements IModelAdapter {
  public readonly provider: ModelProvider = 'ollama';

  constructor(private readonly host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434') {}

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async complete(request: CompletionRequest, spec: ModelSpec): Promise<CompletionResponse> {
    const promptText = request.messages.map((m) => m.content).join(' ');
    const promptTokens = Math.ceil(promptText.length / 4);
    const completionTokens = 40;
    const totalTokens = promptTokens + completionTokens;

    return {
      content: `[Ollama ${spec.id}] Response to: ${promptText.substring(0, 40)}`,
      modelUsed: spec.id,
      provider: 'ollama',
      usage: { promptTokens, completionTokens, totalTokens },
      costEstimateUsd: 0.0, // Local runner is free
      latencyMs: 80,
    };
  }
}

export interface HttpModelAdapterOptions {
  baseUrl: string;
  apiKey?: string;
  defaultHeaders?: Record<string, string>;
  providerName?: string;
}

export class HttpModelAdapter implements IModelAdapter {
  public readonly provider: ModelProvider;
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: HttpModelAdapterOptions) {
    this.provider = (options.providerName as ModelProvider) || 'custom';
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.defaultHeaders = options.defaultHeaders || {};
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.baseUrl);
  }

  public async complete(request: CompletionRequest, spec: ModelSpec): Promise<CompletionResponse> {
    const startTime = Date.now();
    const endpoint = this.baseUrl.endsWith('/chat/completions')
      ? this.baseUrl
      : `${this.baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const payload = {
      model: spec.id,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`LLM HTTP request failed (${res.status} ${res.statusText}): ${errText}`);
    }

    const data = (await res.json()) as any;
    const content = data.choices?.[0]?.message?.content ?? '';
    const latencyMs = Date.now() - startTime;

    const promptTokens =
      data.usage?.prompt_tokens ?? Math.ceil(JSON.stringify(request.messages).length / 4);
    const completionTokens =
      data.usage?.completion_tokens ?? Math.ceil(content.length / 4);
    const totalTokens = data.usage?.total_tokens ?? (promptTokens + completionTokens);

    const costEstimateUsd =
      promptTokens * (spec.costPerInputToken || 0) +
      completionTokens * (spec.costPerOutputToken || 0);

    return {
      content,
      modelUsed: data.model || spec.id,
      provider: this.provider,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      costEstimateUsd: Number(costEstimateUsd.toFixed(8)),
      latencyMs,
    };
  }
}
