export interface ImageGenerationSettings {
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  num_outputs: number;
  num_inference_steps: number;
  guidance_scale: number;
  scheduler: 'DDIM' | 'K_EULER' | 'DPMSolverMultistep';
  seed?: number;
  style_preset?: string;
}

export const defaultSettings: Omit<ImageGenerationSettings, 'prompt'> = {
  width: 768,
  height: 768,
  num_outputs: 1,
  num_inference_steps: 40,
  guidance_scale: 8.5,
  scheduler: 'K_EULER',
  negative_prompt: "ugly, blurry, low quality, low resolution, disfigured, deformed, watermark, signature, poorly drawn, amateur, bad anatomy, distorted, text, duplicate, error, pattern, grainy, noisy"
}

export const stylePresets = {
  'enhance': 'enhance, high quality, best quality, masterpiece, professional',
  'photographic': 'photographic, realistic, photo-realistic, high detail, 8k uhd',
  'digital-art': 'digital art, concept art, illustration, highly detailed',
  'anime': 'anime style, manga style, japanese animation',
  'cinematic': 'cinematic, movie still, film grain, dramatic lighting',
  'fantasy': 'fantasy art, magical, mystical, ethereal',
  'abstract': 'abstract art, non-representational, experimental',
  '3d-render': '3d render, octane render, unreal engine, volumetric lighting'
}

export const schedulers = [
  { value: 'DDIM', label: 'DDIM (Balanced)' },
  { value: 'K_EULER', label: 'Euler (Fast)' },
  { value: 'DPMSolverMultistep', label: 'DPM++ (High Quality)' }
]

export function enhancePrompt(prompt: string, stylePreset?: string): string {
  if (!stylePreset || !stylePresets[stylePreset as keyof typeof stylePresets]) {
    return prompt;
  }
  return `${prompt}, ${stylePresets[stylePreset as keyof typeof stylePresets]}`;
} 