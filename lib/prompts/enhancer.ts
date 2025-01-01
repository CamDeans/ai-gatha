export interface EnhancementOptions {
  style?: string;
  quality?: string;
  details?: string[];
  subject?: 'human' | 'landscape' | 'object' | 'logo' | 'other';
  lighting?: string;
  camera?: string;
  composition?: string;
  aspect?: '1:1' | '16:9' | '3:2' | '4:3';
  weights?: boolean;
}

export class PromptEnhancer {
  static readonly styles = {
    photorealistic: 'professional photography, natural colors, clear focus',
    cinematic: 'professional headshot, clean background, studio quality',
    artistic: 'candid photography, natural environment, genuine moment',
    portrait: 'modern portrait, natural pose, authentic expression',
    fashion: 'professional quality, well-composed, balanced lighting',
    product: 'high-end photography, clear focus, natural colors',
    logo: 'minimalist logo design, clean lines, professional branding'
  } as const;

  static readonly lighting = {
    studio: 'studio lighting, even illumination, professional setup',
    natural: 'natural lighting, soft shadows, clear illumination',
    dramatic: 'golden hour lighting, warm natural glow, soft highlights',
    soft: 'ambient lighting, natural atmosphere, balanced exposure',
    logo: 'flat lighting, clean presentation, professional display'
  } as const;

  static readonly cameras = {
    dslr: 'professional photography, natural colors, clear focus',
    medium: 'balanced composition, natural perspective, clear view',
    cinema: 'centered frame, professional composition, clean background',
    portrait: 'detailed portrait, natural pose, authentic expression',
    logo: 'centered logo layout, balanced spacing, professional design'
  } as const;

  static readonly compositions = {
    balanced: 'balanced composition, natural perspective, clear view',
    centered: 'centered frame, professional composition, clean background',
    dynamic: 'detailed portrait, natural pose, authentic expression',
    closeup: 'environmental portrait, natural setting, genuine context',
    logo: 'centered logo layout, balanced spacing, professional design'
  } as const;

  static readonly qualities = {
    standard: 'professional and polished, natural presence, authentic',
    premium: 'elegant and natural, genuine quality, authentic look',
    maximum: 'bright and clear, natural energy, authentic feel',
    balanced: 'calm and natural, genuine atmosphere, authentic mood',
    logo: 'corporate and professional, minimalist style, modern brand'
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
    'text',
    'complex background',
    'busy design',
    'messy layout'
  ].join(', ');

  static readonly details = [
    'natural colors',
    'clear focus',
    'balanced lighting',
    'natural shadows',
    'authentic appearance',
    'clear details',
    'professional quality',
    'genuine moment',
    'balanced composition',
    'natural perspective',
    'clean background',
    'authentic expression',
    'natural environment',
    'professional setup',
    'balanced exposure'
  ] as const;

  static readonly humanEnhancements = [
    'natural pose',
    'authentic expression',
    'natural appearance',
    'genuine quality',
    'clear features',
    'natural presence',
    'balanced composition',
    'natural colors',
    'clear focus',
    'professional quality'
  ] as const;

  static readonly logoEnhancements = [
    'minimalist logo design',
    'clean lines',
    'professional branding',
    'centered layout',
    'balanced spacing',
    'professional design',
    'clear presentation',
    'simple shapes',
    'modern brand',
    'corporate identity'
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

  private static detectLogoSubject(prompt: string): boolean {
    const logoKeywords = [
      'logo', 'brand', 'icon', 'symbol', 'emblem',
      'trademark', 'corporate', 'identity', 'branding'
    ];
    return logoKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
  }

  static enhancePrompt(basePrompt: string, options: EnhancementOptions): string {
    const enhancements: string[] = [];
    const isHumanSubject = this.detectHumanSubject(basePrompt);
    const isLogoSubject = this.detectLogoSubject(basePrompt);

    if (isHumanSubject) {
      enhancements.push(...this.humanEnhancements);
    }

    if (isLogoSubject) {
      enhancements.push(...this.logoEnhancements);
    }

    if (options.style && this.styles[options.style as keyof typeof this.styles]) {
      enhancements.push(this.styles[options.style as keyof typeof this.styles]);
    }

    if (options.quality && this.qualities[options.quality as keyof typeof this.qualities]) {
      enhancements.push(this.qualities[options.quality as keyof typeof this.qualities]);
    }

    if (options.details && options.details.length > 0) {
      const validDetails = options.details.filter(
        detail => this.details.includes(detail as typeof this.details[number])
      );
      enhancements.push(...validDetails);
    }

    if (isHumanSubject) {
      return `${basePrompt}, ${enhancements.join(', ')} 
        ### Negative prompt: unnatural features, artificial appearance, 
        blurred features, unrealistic look, unbalanced composition, 
        poor lighting, artificial colors, busy background`;
    }

    if (isLogoSubject) {
      return `${basePrompt}, ${enhancements.join(', ')} 
        ### Negative prompt: complex background, busy design, 
        cluttered layout, unbalanced composition, 
        photorealistic elements, complex shapes, 
        messy presentation, distracting elements`;
    }

    return enhancements.length > 0 
      ? `${basePrompt}, ${enhancements.join(', ')}` 
      : basePrompt;
  }
} 