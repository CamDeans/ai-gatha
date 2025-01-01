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
    photorealistic: 'professional photography, natural colors, realistic details',
    cinematic: 'professional cinematography, natural lighting, clear focus',
    artistic: 'artistic photography, natural style, authentic look',
    portrait: 'professional portrait, natural pose, clear features',
    fashion: 'fashion photography, natural style, professional quality',
    product: 'product photography, clear details, professional lighting',
    logo: 'minimalist logo design, clean lines, professional branding, vector style, corporate identity, scalable design'
  } as const;

  static readonly lighting = {
    studio: 'professional studio lighting, even illumination, clear shadows',
    natural: 'natural lighting, soft illumination, balanced exposure',
    dramatic: 'professional lighting, gentle contrast, clear illumination',
    soft: 'soft lighting, gentle illumination, natural shadows',
    logo: 'flat lighting, clean shadows, professional presentation'
  } as const;

  static readonly cameras = {
    dslr: 'professional camera, clear focus, natural depth',
    medium: 'high quality camera, clear details, professional focus',
    cinema: 'cinema camera, professional quality, natural look',
    portrait: 'portrait lens, natural blur, professional focus',
    logo: 'front view, clean capture, professional presentation'
  } as const;

  static readonly compositions = {
    balanced: 'balanced composition, natural framing, clear view',
    centered: 'centered composition, clean framing, clear view',
    dynamic: 'natural composition, clear angle, professional framing',
    closeup: 'close-up composition, clear details, natural framing',
    logo: 'centered logo composition, balanced spacing, professional layout'
  } as const;

  static readonly qualities = {
    standard: 'high quality, clear details, natural look',
    premium: 'professional quality, clear details, natural appearance',
    maximum: 'best quality, clear details, natural features',
    balanced: 'balanced quality, clear focus, natural details',
    logo: 'vector quality, crisp edges, professional finish'
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
    'realistic textures',
    'clear details',
    'natural lighting',
    'soft shadows',
    'balanced exposure',
    'natural atmosphere',
    'clean lines',
    'minimalist design',
    'professional branding',
    'scalable graphics',
    'vector style'
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

  static readonly logoEnhancements = [
    'minimalist design',
    'clean lines',
    'professional branding',
    'vector style graphics',
    'scalable design',
    'balanced composition',
    'clear iconography',
    'simple shapes',
    'professional typography',
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
        ### Negative prompt: unnatural features, distorted proportions, 
        blurred features, unrealistic face, asymmetrical features, 
        unnatural skin, artificial lighting, oversaturated colors`;
    }

    if (isLogoSubject) {
      return `${basePrompt}, ${enhancements.join(', ')} 
        ### Negative prompt: complex background, busy design, 
        text heavy, cluttered layout, gradients, 
        photorealistic elements, detailed illustrations, 
        noisy textures, drop shadows`;
    }

    return enhancements.length > 0 
      ? `${basePrompt}, ${enhancements.join(', ')}` 
      : basePrompt;
  }
} 