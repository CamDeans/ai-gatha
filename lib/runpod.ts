/**
 * RunPod API integration for image generation
 */

// Configuration
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID || 'a33b9wz83q68ry';
const RUNPOD_BASE_URL = 'https://api.runpod.ai/v2';
const MAX_RETRIES = 180;
const RETRY_DELAY = 1000;

interface RunpodRequest {
  prompt: string;
  apiKey: string;
  // Add other settings as needed
}

interface RunpodResponse {
  success: boolean;
  image?: string;
  error?: string;
  status?: string;
  output?: string[];
}

/**
 * Fetches the status of a RunPod job
 */
async function checkStatus(jobId: string): Promise<RunpodResponse> {
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
async function pollStatus(jobId: string, attempt = 1): Promise<RunpodResponse> {
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
export async function runpodFetch(request: RunpodRequest): Promise<RunpodResponse> {
  const { prompt, apiKey } = request;
  
  try {
    const response = await fetch('https://api.runpod.ai/v2/stable-diffusion-v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: {
          prompt,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate image');
    }

    return {
      success: true,
      image: data.output[0]
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image'
    };
  }
} 