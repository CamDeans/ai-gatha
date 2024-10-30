export interface EnhancementOptions {
  style?: string;
  quality?: string;
  lighting?: string;
  perspective?: string;
  mood?: string;
  details?: string[];
}

export class PromptEnhancer {
  static styles = {
    hyperrealistic: 'hyperrealistic, photorealistic, ultra realistic, 8k uhd, high detail skin texture',
    photographic: 'professional photography, raw photo, high end camera, 8k uhd, sharp focus',
    cinematic: 'cinematic lighting, movie quality, high budget production, 8k film grain',
    detailed: 'highly detailed, intricate details, sharp textures, 8k resolution'
  };

  static qualities = {
    ultra: 'ultra high quality, masterpiece, best quality, professional, award winning',
    high: 'high quality, sharp focus, fine details, professional grade',
    premium: 'premium quality, perfect composition, expert crafted',
    detailed: 'intricate details, perfect sharpness, high definition'
  };

  static lighting = {
    studio: 'professional studio lighting, perfect exposure, high-end photography lighting',
    natural: 'natural sunlight, golden hour, perfect exposure, volumetric lighting',
    dramatic: 'dramatic lighting, cinematic lighting, perfect shadows, professional lighting setup',
    soft: 'soft diffused lighting, perfect exposure, professional photography lighting'
  };

  static perspectives = {
    closeup: 'extreme close-up, macro photography, highly detailed, sharp focus',
    portrait: 'professional portrait, perfect composition, studio quality, high fashion',
    wide: 'wide angle, perfect composition, professional photography, high detail',
    aerial: 'aerial view, drone photography, perfect composition, high altitude'
  };

  static moods = {
    professional: 'professional, high-end, premium quality, commercial grade',
    elegant: 'elegant, sophisticated, luxurious, high fashion',
    modern: 'modern, contemporary, cutting edge, trendsetting',
    natural: 'natural, authentic, genuine, true to life'
  };

  static detailEnhancements = [
    'ultra detailed skin texture',
    'photorealistic details',
    'professional retouching',
    'perfect lighting',
    'sharp focus',
    'high detail',
    '8k uhd',
    'raw photo',
    'high end production',
    'award winning quality'
  ];

  static enhancePrompt(prompt: string, options: EnhancementOptions = {}): string {
    const enhancements: string[] = [];

    if (options.style) {
      enhancements.push(this.styles[options.style as keyof typeof this.styles]);
    }

    if (options.quality) {
      enhancements.push(this.qualities[options.quality as keyof typeof this.qualities]);
    }

    if (options.lighting) {
      enhancements.push(this.lighting[options.lighting as keyof typeof this.lighting]);
    }

    if (options.perspective) {
      enhancements.push(this.perspectives[options.perspective as keyof typeof this.perspectives]);
    }

    if (options.mood) {
      enhancements.push(this.moods[options.mood as keyof typeof this.moods]);
    }

    if (options.details && options.details.length > 0) {
      enhancements.push(...options.details);
    }

    return enhancements.length > 0 ? `${prompt}, ${enhancements.join(', ')}` : prompt;
  }
} 