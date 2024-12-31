export interface EnhancementOptions {
  style?: string;
  quality?: string;
  details?: string[];
  subject?: 'human' | 'landscape' | 'object' | 'other';
  lighting?: string;
  camera?: string;
  composition?: string;
  aspect?: '1:1' | '16:9' | '3:2' | '4:3';
  weights?: boolean;
}

export class PromptEnhancer {
  static readonly styles = {
    photorealistic: 'professional photography, natural colors, realistic details',
    cinematic: 'professional cinematography, natural lighting, clear focus',
    artistic: 'artistic photography, natural style, authentic look',
    portrait: 'professional portrait, natural pose, clear features',
    fashion: 'fashion photography, natural style, professional quality',
    product: 'product photography, clear details, professional lighting'
  } as const;

  static readonly lighting = {
    studio: 'professional studio lighting, even illumination, clear shadows',
    natural: 'natural lighting, soft illumination, balanced exposure',
    dramatic: 'professional lighting, gentle contrast, clear illumination',
    soft: 'soft lighting, gentle illumination, natural shadows'
  } as const;

  static readonly cameras = {
    dslr: 'professional camera, clear focus, natural depth',
    medium: 'high quality camera, clear details, professional focus',
    cinema: 'cinema camera, professional quality, natural look',
    portrait: 'portrait lens, natural blur, professional focus'
  } as const;

  static readonly compositions = {
    balanced: 'balanced composition, natural framing, clear view',
    centered: 'centered composition, clean framing, clear view',
    dynamic: 'natural composition, clear angle, professional framing',
    closeup: 'close-up composition, clear details, natural framing'
  } as const;

  static readonly qualities = {
    standard: 'high quality, clear details, natural look',
    premium: 'professional quality, clear details, natural appearance',
    maximum: 'best quality, clear details, natural features',
    balanced: 'balanced quality, clear focus, natural details'
  } as const;

  static readonly negativeBase = [
    'blurry',
    'distorted',
    'deformed',
    'unnatural',
    'artificial',
    'low quality',
    'oversaturated',
    'overexposed',
    'underexposed',
    'noisy',
    'grainy',
    'pixelated',
    'watermark',
    'text'
  ].join(', ');

  static readonly details = [
    'natural colors',
    'clear focus',
    'balanced lighting',
    'natural shadows',
    'realistic textures',
    'clear details',
    'natural lighting',
    'soft shadows',
    'balanced exposure',
    'natural atmosphere'
  ] as const;

  static readonly humanEnhancements = [
    'natural facial features',
    'realistic facial proportions',
    'natural skin texture',
    'natural body proportions',
    'clear facial features',
    'natural facial structure',
    'balanced facial features',
    'natural skin tones',
    'clear eyes',
    'natural expression'
  ] as const;

  private static detectHumanSubject(prompt: string): boolean {
    const humanKeywords = [
      'person', 'man', 'woman', 'boy', 'girl', 'people',
      'portrait', 'face', 'human', 'body', 'figure'
    ];
    return humanKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
  }

  static enhancePrompt(basePrompt: string, options: EnhancementOptions): string {
    const enhancements: string[] = [];
    const isHumanSubject = this.detectHumanSubject(basePrompt);

    if (isHumanSubject) {
      enhancements.push(...this.humanEnhancements);
    }

    if (options.style && this.styles[options.style as keyof typeof this.styles]) {
      enhancements.push(this.styles[options.style as keyof typeof this.styles]);
    }

    if (options.quality && this.qualities[options.quality as keyof typeof this.qualities]) {
      enhancements.push(this.qualities[options.quality as keyof typeof this.qualities]);
    }

    // Add selected details
    if (options.details && options.details.length > 0) {
      const validDetails = options.details.filter(
        detail => this.details.includes(detail as typeof this.details[number])
      );
      enhancements.push(...validDetails);
    }

    // Add negative prompts for human subjects to prevent common issues
    if (isHumanSubject) {
      return `${basePrompt}, ${enhancements.join(', ')} 
        ### Negative prompt: unnatural features, distorted proportions, 
        blurred features, unrealistic face, asymmetrical features, 
        unnatural skin, artificial lighting, oversaturated colors`;
    }

    return enhancements.length > 0 
      ? `${basePrompt}, ${enhancements.join(', ')}` 
      : basePrompt;
  }
} 