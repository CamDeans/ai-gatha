/**
 * RunPod API client configuration and helper functions
 */
import { ImageGenerationSettings, defaultSettings, enhancePrompt } from './settings';
import { RunPodProvider } from './config';

interface RunPodResponse {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output: {
    image: string;
  }[] | null;
  error?: string;
}

function sanitizeHeaders(apiKey: string): HeadersInit {
  // Ensure the API key is ASCII-only
  const sanitizedKey = apiKey.replace(/[^\x20-\x7E]/g, '').trim();
  
  // Log headers for debugging (mask the API key)
  console.log('RunPod Headers:', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sanitizedKey.slice(0, 4)}...${sanitizedKey.slice(-4)}`,
  });

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sanitizedKey}`,
  };
}

async function handleResponse(response: Response) {
  try {
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    console.log('RunPod Response:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      responseText: responseText.slice(0, 200),
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.status === 401) {
      throw new Error('Invalid or expired API key. Please check your RunPod API key in settings.');
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
      try {
        if (contentType?.includes('application/json')) {
          const error = JSON.parse(responseText);
          errorMessage = error.error || errorMessage;
        } else {
          errorMessage = responseText || errorMessage;
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }

    if (!contentType?.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing JSON response:', e, 'Response text:', responseText);
      throw new Error('Invalid JSON response from RunPod API');
    }
  } catch (error) {
    console.error('RunPod API Error:', error);
    throw error;
  }
}

function isValidRunPodApiKey(apiKey: string): boolean {
  const trimmedKey = apiKey.trim();
  
  // Log validation details (masking the key)
  console.log('API Key Validation:', {
    length: trimmedKey.length,
    format: trimmedKey.replace(/./g, '*'),
    containsOnlyValid: /^[A-Za-z0-9_-]+$/.test(trimmedKey),
    firstFourChars: trimmedKey.slice(0, 4),
    lastFourChars: trimmedKey.slice(-4),
  });

  // RunPod API keys can be any length and may include other characters
  return trimmedKey.length > 0;
}

export async function generateWithRunPod(
  prompt: string,
  config: RunPodProvider,
  settings: Partial<ImageGenerationSettings> = {}
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('RunPod API key not configured');
  }

  if (!config.endpointUrl) {
    throw new Error('RunPod endpoint URL not configured');
  }

  // Log the raw API key details (masked)
  const maskedKey = config.apiKey.replace(/./g, '*');
  console.log('RunPod API Key Details:', {
    length: config.apiKey.length,
    format: maskedKey,
    firstFour: config.apiKey.slice(0, 4),
    lastFour: config.apiKey.slice(-4),
  });

  const mergedSettings = {
    ...defaultSettings,
    ...settings,
    prompt: prompt
  };

  console.log('RunPod Request:', {
    endpointUrl: config.endpointUrl,
    hasApiKey: !!config.apiKey,
    apiKeyLength: config.apiKey.length,
    prompt: mergedSettings.prompt,
    settings: {
      width: mergedSettings.width,
      height: mergedSettings.height,
      num_inference_steps: mergedSettings.num_inference_steps,
      guidance_scale: mergedSettings.guidance_scale,
    }
  });

  // Initial request to start generation
  const headers = sanitizeHeaders(config.apiKey);
  const requestBody = {
    input: {
      prompt: mergedSettings.prompt,
      negative_prompt: mergedSettings.negative_prompt,
      num_inference_steps: mergedSettings.num_inference_steps,
      guidance_scale: mergedSettings.guidance_scale,
      width: mergedSettings.width,
      height: mergedSettings.height,
      seed: mergedSettings.seed || -1,
      num_outputs: mergedSettings.num_outputs
    },
  };

  console.log('RunPod Request Body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(config.endpointUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  const initialData = await handleResponse(response);
  console.log('Initial RunPod response:', initialData);
  
  if (!initialData.id) {
    throw new Error('No task ID received from RunPod API');
  }

  const taskId = initialData.id;

  // Poll for results
  const statusUrl = `${config.endpointUrl.replace('/run', '/status/')}${taskId}`;
  let attempts = 0;
  const maxAttempts = 180; // 3 minutes timeout
  const pollInterval = 2000; // 2 seconds between polls
  
  while (attempts < maxAttempts) {
    console.log(`Checking status (attempt ${attempts + 1}/${maxAttempts})`);
    const statusResponse = await fetch(statusUrl, {
      headers,
    });

    const statusData: RunPodResponse = await handleResponse(statusResponse);
    console.log('Status check:', statusData);

    if (statusData.status === 'COMPLETED' && statusData.output && statusData.output.length > 0) {
      const base64Image = statusData.output[0].image;
      if (base64Image.startsWith('data:image')) {
        return base64Image;
      }
      return `data:image/jpeg;base64,${base64Image}`;
    }

    if (statusData.status === 'FAILED') {
      throw new Error(statusData.error || 'Image generation failed');
    }

    // Wait between polls
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
  }

  throw new Error('Image generation timed out after 3 minutes');
} 