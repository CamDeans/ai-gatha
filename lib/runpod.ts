/**
 * RunPod API integration for image generation
 */

// Configuration
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID || 'a33b9wz83q68ry';
const RUNPOD_BASE_URL = 'https://api.runpod.ai/v2';
const MAX_RETRIES = 180;
const RETRY_DELAY = 1000;

interface RunPodResponse {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output?: Array<{
    image: string;
    seed: number;
  }>;
  error?: string;
}

/**
 * Fetches the status of a RunPod job
 */
async function checkStatus(jobId: string): Promise<RunPodResponse> {
  const response = await fetch(`${RUNPOD_BASE_URL}/${RUNPOD_ENDPOINT_ID}/status/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${RUNPOD_API_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Polls the status of a RunPod job until completion
 */
async function pollStatus(jobId: string, attempt = 1): Promise<RunPodResponse> {
  if (attempt > MAX_RETRIES) {
    throw new Error('Generation timed out');
  }

  const status = await checkStatus(jobId);
  console.log('Status check:', status);
  console.log(`Generation status: ${status.status}, attempt ${attempt}/${MAX_RETRIES}`);

  switch (status.status) {
    case 'COMPLETED':
      return status;
    case 'FAILED':
      throw new Error(status.error || 'Generation failed');
    case 'IN_QUEUE':
    case 'IN_PROGRESS':
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return pollStatus(jobId, attempt + 1);
    default:
      throw new Error(`Unknown status: ${status.status}`);
  }
}

/**
 * Generates an image using RunPod
 */
export async function runpodFetch(prompt: string): Promise<RunPodResponse> {
  // Log configuration for debugging
  console.log('RunPod Config:', {
    endpointUrl: `${RUNPOD_BASE_URL}/${RUNPOD_ENDPOINT_ID}`,
    hasApiKey: !!RUNPOD_API_KEY
  });

  // Initial request to start generation
  const response = await fetch(`${RUNPOD_BASE_URL}/${RUNPOD_ENDPOINT_ID}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNPOD_API_KEY}`
    },
    body: JSON.stringify({
      input: {
        prompt,
        num_inference_steps: 50,
        guidance_scale: 7.5,
        negative_prompt: 'blurry, bad quality, distorted',
        width: 512,
        height: 512
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Generation request failed: ${response.statusText}`);
  }

  const initialResponse = await response.json();
  console.log('Initial response:', initialResponse);

  // Poll for completion
  return pollStatus(initialResponse.id);
} 