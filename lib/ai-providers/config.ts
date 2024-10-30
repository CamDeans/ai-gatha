/**
 * AI Provider Configuration
 * Manages different AI model providers and their settings
 */

interface BaseProvider {
  name: string;
  id: string;
  apiKey: string | undefined;
}

export interface ReplicateProvider extends BaseProvider {
  name: 'Replicate';
  id: 'replicate';
  modelVersion: string;
}

interface RunPodProvider extends BaseProvider {
  name: 'RunPod';
  id: 'runpod';
  endpointUrl: string;
}

export type AIProvider = ReplicateProvider | RunPodProvider;

export const AI_PROVIDERS = {
  RUNPOD: {
    name: 'RunPod' as const,
    id: 'runpod' as const,
    apiKey: process.env.RUNPOD_API_KEY,
    endpointUrl: `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/run`,
  },
  REPLICATE: {
    name: 'Replicate' as const,
    id: 'replicate' as const,
    apiKey: process.env.REPLICATE_API_TOKEN,
    modelVersion: "prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb",
  },
} as const;

export type AIProviderType = keyof typeof AI_PROVIDERS;