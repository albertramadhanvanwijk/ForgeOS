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
  if (!cleanUrl) return [];

  // 1. Try server-side live detection first (bypasses browser CORS completely)
  try {
    const res = await fetch('/api/models/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl, apiKey }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models) && data.models.length > 0) {
        return data.models;
      }
    }
  } catch {
    // Continue to smart fallbacks
  }

  // 2. Smart automatic fallback detection based on provider URL
  if (cleanUrl.includes('groq')) {
    return [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'deepseek-r1-distill-llama-70b',
      'deepseek-r1-distill-qwen-32b',
      'qwen-2.5-coder-32b',
      'qwen-2.5-32b',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
      'whisper-large-v3',
      'whisper-large-v3-turbo',
      'llama-guard-3-8b',
    ];
  }
  if (cleanUrl.includes('openrouter')) {
    return [
      'deepseek/deepseek-r1',
      'deepseek/deepseek-chat',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3.5-haiku',
      'meta-llama/llama-3.3-70b-instruct',
      'meta-llama/llama-3.1-405b-instruct',
      'google/gemini-2.0-flash-exp',
      'google/gemini-flash-1.5',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'openai/o1-preview',
      'qwen/qwen-2.5-coder-32b-instruct',
      'mistralai/mistral-large',
    ];
  }
  if (cleanUrl.includes('11434') || cleanUrl.includes('ollama')) {
    return [
      'llama3.3:latest',
      'llama3.1:latest',
      'qwen2.5-coder:latest',
      'qwen2.5:latest',
      'deepseek-r1:latest',
      'mistral:latest',
      'codellama:latest',
      'nomic-embed-text:latest',
    ];
  }
  if (cleanUrl.includes('openai.com')) {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'o1-preview',
      'o1-mini',
      'o3-mini',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
    ];
  }
  if (cleanUrl.includes('anthropic.com')) {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ];
  }
  if (cleanUrl.includes('deepseek.com')) {
    return ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'];
  }

  return ['default-model'];
}
