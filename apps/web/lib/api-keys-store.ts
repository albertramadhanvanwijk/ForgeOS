'use client';

export interface CustomEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  availableModels: string[];
}

export interface ApiKeysConfig {
  customEndpoints: CustomEndpoint[];
}

export const DEFAULT_CUSTOM_ENDPOINTS: CustomEndpoint[] = [];

export const DEFAULT_API_KEYS: ApiKeysConfig = {
  customEndpoints: DEFAULT_CUSTOM_ENDPOINTS,
};

const STORAGE_KEY = 'forgeos_custom_endpoints_v2';

export function getStoredApiKeys(): ApiKeysConfig {
  if (typeof window === 'undefined') return DEFAULT_API_KEYS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_API_KEYS;
    const parsed = JSON.parse(raw);
    return {
      customEndpoints: Array.isArray(parsed.customEndpoints) ? parsed.customEndpoints : [],
    };
  } catch {
    return DEFAULT_API_KEYS;
  }
}

export function saveStoredApiKeys(keys: ApiKeysConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch (err) {
    console.error('Failed to save API keys to localStorage', err);
  }
}

// Auto-detect models based on provider base URL or query /models endpoint
export async function detectModelsForEndpoint(baseUrl: string, apiKey?: string): Promise<string[]> {
  const cleanUrl = (baseUrl || '').trim().toLowerCase();

  // Try live fetch first if URL is valid
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    try {
      const target = cleanUrl.endsWith('/models') ? cleanUrl : `${cleanUrl.replace(/\/+$/, '')}/models`;
      const headers: Record<string, string> = {};
      if (apiKey?.trim()) {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(target, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          return json.data.map((m: any) => m.id || m.name).filter(Boolean);
        }
        if (Array.isArray(json.models) && json.models.length > 0) {
          return json.models.map((m: any) => m.name || m.model).filter(Boolean);
        }
      }
    } catch {
      // Fall through to smart preset resolution if fetch is blocked by CORS or server offline
    }
  }

  // Smart automatic model detection based on provider URL
  if (cleanUrl.includes('openrouter')) {
    return [
      'deepseek/deepseek-r1',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemini-2.0-flash-exp',
      'openai/gpt-4o',
      'qwen/qwen-2.5-coder-32b-instruct',
    ];
  }
  if (cleanUrl.includes('groq')) {
    return [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'deepseek-r1-distill-llama-70b',
      'mixtral-8x7b-32768',
    ];
  }
  if (cleanUrl.includes('11434') || cleanUrl.includes('ollama')) {
    return [
      'llama3.1:latest',
      'qwen2.5-coder:latest',
      'deepseek-r1:latest',
      'mistral:latest',
      'codellama:latest',
    ];
  }
  if (cleanUrl.includes('openai.com')) {
    return ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'];
  }
  if (cleanUrl.includes('anthropic.com')) {
    return ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'];
  }
  if (cleanUrl.includes('deepseek.com')) {
    return ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'];
  }

  return ['default-model'];
}
