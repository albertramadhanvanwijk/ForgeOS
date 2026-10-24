import { FastifyInstance } from 'fastify';
import {
  ModelGateway,
  CompletionRequest,
  HttpModelAdapter,
  ModelSpec,
} from '@forgeos/model-gateway';

export interface CustomEndpointConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  availableModels: string[];
}

export interface ModelRoutesOptions {
  gateway: ModelGateway;
}

// In-memory store for custom endpoint configurations
let savedEndpoints: CustomEndpointConfig[] = [];

export const registerModelRoutes = (app: FastifyInstance, options: ModelRoutesOptions) => {
  const { gateway } = options;

  // List available models and capabilities
  app.get('/api/models', async (_request, reply) => {
    const models = gateway.listModels();
    return reply.status(200).send(models);
  });

  // GET /api/models/metrics — Get gateway token and cost metrics (FR-092, FR-094)
  app.get('/api/models/metrics', async (_request, reply) => {
    const metrics = gateway.getMetrics();
    return reply.status(200).send(metrics);
  });

  // POST /api/models/detect — Server-side model detection (bypasses browser CORS completely)
  app.post('/api/models/detect', async (request, reply) => {
    const { baseUrl, apiKey } = (request.body as { baseUrl?: string; apiKey?: string }) || {};
    if (!baseUrl || !baseUrl.trim()) {
      return reply.status(400).send({ error: 'Missing required field: baseUrl' });
    }

    const cleanUrl = baseUrl.trim().replace(/\/+$/, '');
    const headers: Record<string, string> = {
      'User-Agent': 'ForgeOS/1.0',
    };
    if (apiKey && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    }

    const candidates = [
      cleanUrl.endsWith('/models') ? cleanUrl : `${cleanUrl}/models`,
      cleanUrl.endsWith('/api/tags') ? cleanUrl : `${cleanUrl}/api/tags`,
      cleanUrl.includes('/v1') ? null : `${cleanUrl}/v1/models`,
    ].filter(Boolean) as string[];

    const detectedModels = new Set<string>();
    let lastError = '';

    for (const targetUrl of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(targetUrl, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = (await res.json()) as any;
          // Format A: { data: [ { id: "..." } ] } (OpenAI, Groq, OpenRouter, vLLM, LM Studio)
          if (Array.isArray(json.data)) {
            for (const item of json.data) {
              if (item && item.id) detectedModels.add(String(item.id));
              else if (typeof item === 'string') detectedModels.add(item);
            }
          }
          // Format B: { models: [ { name: "..." } ] } (Ollama)
          if (Array.isArray(json.models)) {
            for (const item of json.models) {
              if (item && (item.name || item.model)) detectedModels.add(String(item.name || item.model));
              else if (typeof item === 'string') detectedModels.add(item);
            }
          }
          // Format C: Direct array [ "...", ... ]
          if (Array.isArray(json)) {
            for (const item of json) {
              if (typeof item === 'string') detectedModels.add(item);
              else if (item && item.id) detectedModels.add(String(item.id));
            }
          }

          if (detectedModels.size > 0) {
            break;
          }
        } else {
          lastError = `HTTP ${res.status}: ${res.statusText}`;
        }
      } catch (err: any) {
        lastError = err.message || 'Fetch error';
      }
    }

    const modelsList = Array.from(detectedModels).sort();

    return reply.status(200).send({
      success: modelsList.length > 0,
      count: modelsList.length,
      models: modelsList,
      error: modelsList.length === 0 ? lastError : undefined,
    });
  });

  // GET /api/models/config — Retrieve currently configured endpoints
  app.get('/api/models/config', async (_request, reply) => {
    return reply.status(200).send({
      customEndpoints: savedEndpoints,
      activeModels: gateway.listModels().map((m) => m.id),
    });
  });

  // POST /api/models/config — Save endpoints and register live adapters
  app.post('/api/models/config', async (request, reply) => {
    const body = request.body as { customEndpoints?: CustomEndpointConfig[] };
    if (!body || !Array.isArray(body.customEndpoints)) {
      return reply.status(400).send({ error: 'Expected { customEndpoints: [...] }' });
    }

    savedEndpoints = body.customEndpoints;
    let registeredCount = 0;

    for (const ep of savedEndpoints) {
      if (!ep.baseUrl) continue;
      const providerId = ep.id || `custom-${Date.now()}`;

      // Register live HTTP adapter
      const adapter = new HttpModelAdapter({
        baseUrl: ep.baseUrl,
        apiKey: ep.apiKey,
        providerName: providerId,
      });
      gateway.registerAdapter(adapter);

      // Register all models available on this endpoint
      for (const modelId of ep.availableModels || []) {
        const spec: ModelSpec = {
          id: modelId,
          name: `${modelId} (${ep.name || 'Custom'})`,
          provider: providerId,
          contextWindow: 128000,
          costPerInputToken: 0.0000005,
          costPerOutputToken: 0.0000015,
          capabilities: ['fast', 'code', 'reasoning'],
          tier: 'balanced',
          priority: 50, // Higher priority than mock fallback
        };
        gateway.registerModel(spec);
        registeredCount++;
      }
    }

    return reply.status(200).send({
      success: true,
      message: `Configured ${savedEndpoints.length} endpoint(s) with ${registeredCount} live model(s)`,
      endpoints: savedEndpoints,
      models: gateway.listModels(),
    });
  });

  // Route completion request
  app.post('/api/models/complete', async (request, reply) => {
    const body = request.body as CompletionRequest;
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return reply.status(400).send({ error: 'Missing required field: messages' });
    }

    try {
      const response = await gateway.complete(body);
      return reply.status(200).send(response);
    } catch (err: any) {
      return reply.status(502).send({ error: err.message });
    }
  });

  // POST /api/models/chat — Interactive live agent chat endpoint
  app.post('/api/models/chat', async (request, reply) => {
    const body = request.body as {
      message: string;
      history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      model?: string;
      systemPrompt?: string;
    };

    if (!body || !body.message) {
      return reply.status(400).send({ error: 'Missing required field: message' });
    }

    const messages = [
      {
        role: 'system' as const,
        content:
          body.systemPrompt ||
          'You are ForgeOS Autonomous Core Intelligence. You produce production-grade clean code, architecture patterns, and structured actionable solutions.',
      },
      ...(body.history || []).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      {
        role: 'user' as const,
        content: body.message,
      },
    ];

    try {
      const response = await gateway.complete({
        model: body.model,
        messages,
      });

      return reply.status(200).send({
        reply: response.content,
        modelUsed: response.modelUsed,
        provider: response.provider,
        usage: response.usage,
        latencyMs: response.latencyMs,
      });
    } catch (err: any) {
      return reply.status(500).send({
        error: err.message || 'LLM execution failed',
      });
    }
  });
};
