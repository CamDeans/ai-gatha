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
    photorealistic: '(photorealistic:1.4), (hyperrealistic:1.3), RAW photo, 8k uhd',
    cinematic: '(cinematic:1.3), movie quality, film grain, anamorphic',
    artistic: '(artistic:1.2), creative, expressive, stylized',
    portrait: '(professional portrait:1.4), studio quality, editorial photography',
    fashion: '(fashion photography:1.3), high end, editorial, magazine quality',
    product: '(commercial photography:1.3), advertising, professional product shot'
  } as const;

  static readonly lighting = {
    studio: '(professional studio lighting:1.2), perfect exposure, controlled lighting',
    natural: '(natural lighting:1.2), golden hour, soft sunlight, ambient',
    dramatic: '(dramatic lighting:1.3), high contrast, moody, cinematic lighting',
    soft: '(soft lighting:1.2), diffused, flattering, beauty lighting'
  } as const;

  static readonly cameras = {
    dslr: '(shot on DSLR:1.2), Canon EOS R5, 85mm lens, f/1.8',
    medium: '(medium format:1.3), Hasselblad, sharp details, high resolution',
    cinema: '(cinema camera:1.2), ARRI Alexa, cinematic look',
    portrait: '(portrait lens:1.2), 135mm lens, bokeh, shallow depth of field'
  } as const;

  static readonly compositions = {
    balanced: '(rule of thirds:1.1), balanced composition, professional framing',
    centered: '(centered composition:1.1), symmetrical, front view',
    dynamic: '(dynamic composition:1.2), interesting angle, creative framing',
    closeup: '(macro composition:1.2), extreme detail, close-up shot'
  } as const;

  static readonly qualities = {
    standard: '(high quality:1.2), detailed, sharp',
    premium: '(ultra high quality:1.4), (8k uhd:1.2), masterpiece',
    maximum: '(best quality:1.4), (masterpiece:1.4), (ultra realistic:1.3)',
    balanced: '(quality:1.2), (sharp focus:1.1), detailed'
  } as const;

  static readonly negativeBase = [
    '(worst quality:1.4)',
    '(low quality:1.4)',
    '(normal quality:1.1)',
    'lowres',
    'bad anatomy',
    'bad composition',
    'poor lighting',
    'jpeg artifacts',
    'watermark',
    'signature',
    'blurry',
    'amateur',
    'noisy',
    'grainy'
  ].join(', ');

  static readonly details = [
    'vibrant colors',
    'sharp focus',
    'depth of field',
    'dynamic lighting',
    'rich textures',
    'fine details',
    'volumetric lighting',
    'ambient occlusion',
    'ray tracing',
    'global illumination'
  ] as const;

  static readonly humanEnhancements = [
    'perfect anatomy',
    'realistic facial features',
    'detailed skin texture',
    'accurate body proportions',
    'five fingers on each hand',
    'symmetrical facial features',
    'clear facial details',
    'natural skin tones',
    'proper eye alignment',
    'detailed facial structure'
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
        ### Negative prompt: deformed hands, extra fingers, missing fingers, 
        blurred features, distorted face, asymmetrical eyes, deformed body, 
        unrealistic proportions, missing facial features, blurred face`;
    }

    return enhancements.length > 0 
      ? `${basePrompt}, ${enhancements.join(', ')}` 
      : basePrompt;
  }
} 