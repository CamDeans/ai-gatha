/**
 * RunPod API client configuration and helper functions
 */
import { ImageGenerationSettings, defaultSettings, enhancePrompt } from './settings';
import { AIProvider } from './config';

interface RunPodResponse {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  output: {
    image: string;
  }[] | null;
  error?: string;
}

export async function generateWithRunPod(
  prompt: string,
  config: AIProvider & { endpointUrl: string },
  settings: Partial<ImageGenerationSettings> = {}
): Promise<string> {
  const mergedSettings = {
    ...defaultSettings,
    ...settings,
    prompt: enhancePrompt(prompt, settings.style_preset)
  };

  console.log('RunPod Config:', {
    endpointUrl: config.endpointUrl,
    hasApiKey: !!config.apiKey,
  });

  // Initial request to start generation
  const response = await fetch(config.endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      input: {
        prompt: mergedSettings.prompt,
        negative_prompt: mergedSettings.negative_prompt,
        num_inference_steps: mergedSettings.num_inference_steps,
        guidance_scale: mergedSettings.guidance_scale,
        width: mergedSettings.width,
        height: mergedSettings.height,
        seed: mergedSettings.seed || -1,
        num_outputs: mergedSettings.num_outputs
        // Removed scheduler parameter to use model default
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('RunPod API error:', error);
    throw new Error(JSON.stringify(error.error || 'Failed to generate image'));
  }

  const initialData = await response.json();
  console.log('Initial response:', initialData);
  const taskId = initialData.id;

  // Poll for results
  const statusUrl = config.endpointUrl.replace('/run', '/status/');
  let attempts = 0;
  const maxAttempts = 180; // 3 minutes timeout
  const pollInterval = 2000; // 2 seconds between polls
  
  while (attempts < maxAttempts) {
    const statusResponse = await fetch(`${statusUrl}${taskId}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });

    if (!statusResponse.ok) {
      console.error('Status check failed:', await statusResponse.text());
      throw new Error(`Failed to check generation status: ${statusResponse.statusText}`);
    }

    const statusData: RunPodResponse = await statusResponse.json();
    console.log('Status check:', statusData);

    if (statusData.status === 'COMPLETED' && statusData.output && statusData.output.length > 0) {
      // Convert base64 to data URL
      const base64Image = statusData.output[0].image;
      if (base64Image.startsWith('data:image')) {
        return base64Image;
      }
      return `data:image/jpeg;base64,${base64Image}`;
    }

    if (statusData.status === 'FAILED') {
      throw new Error(statusData.error || 'Image generation failed');
    }

    // Log progress
    console.log(`Generation status: ${statusData.status}, attempt ${attempts + 1}/${maxAttempts}`);

    // Wait between polls
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
  }

  throw new Error('Image generation timed out after 3 minutes');
} 