import { promptTemplates, PromptTemplate } from './database'
import { EnhancementOptions } from './enhancer'

interface PromptSuggestion {
  prompt: string;
  confidence: number;
  template: PromptTemplate;
}

export class PromptEngineer {
  static readonly styles = {
    photorealistic: 'photorealistic, highly detailed',
    artistic: 'artistic, creative, expressive',
    cinematic: 'cinematic, dramatic lighting, movie still',
    anime: 'anime style, manga art',
    digital: 'digital art, concept art',
    vintage: 'vintage, retro style, aged'
  } as const;

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

  private static readonly humanKeywords = [
    'person', 'man', 'woman', 'boy', 'girl', 'people',
    'portrait', 'face', 'human', 'body', 'figure'
  ] as const;

  private static readonly faceEnhancements = [
    'RAW photo, highly detailed skin, 8k uhd, dslr',
    'professional portrait photography',
    'detailed eyes, detailed pupils, detailed iris',
    'subsurface scattering, realistic skin texture',
    'masterpiece, best quality, ultra realistic',
    'photorealistic, hyperdetailed, hyperrealistic',
    'professional lighting, rembrandt lighting',
    'sharp focus, HDR, 8K resolution',
    'symmetrical eyes, detailed facial features'
  ] as const;

  private static readonly negativePrompt = [
    'deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime',
    'deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs',
    'disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation',
    '(worst quality, low quality, normal quality:1.4)',
    'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits',
    'cropped, worst quality, low quality, jpeg artifacts, signature, watermark, username, blurry',
    'missing arms, long neck, Humpbacked, deformed face, cross-eyed, weird eyes, stretched face',
    'out of frame, mutation, poorly drawn, floating, disconnected, discontinuous, malformed hands, malformed fingers'
  ].join(', ');

  private static analyzeInput(input: string): string[] {
    // Enhanced term extraction with natural language processing concepts
    const terms = input.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(term => term.length > 2)
      .map(term => term.trim());

    // Add common synonyms and related terms
    const expandedTerms = new Set(terms);
    terms.forEach(term => {
      const synonyms = this.getSynonyms(term);
      synonyms.forEach(syn => expandedTerms.add(syn));
    });

    return Array.from(expandedTerms);
  }

  private static matchTemplate(terms: string[], template: PromptTemplate): number {
    let score = 0;
    const allTerms = [
      ...template.tags,
      template.category.toLowerCase(),
      template.style.toLowerCase(),
      ...(template.modifiers || [])
    ];
    
    // Enhanced scoring system
    terms.forEach(term => {
      if (allTerms.some(t => t.includes(term) || term.includes(t))) {
        score += 1;
      }
    });

    // Apply template weight if available
    if (template.weight) {
      score *= template.weight;
    }

    return score / Math.max(terms.length, 1);
  }

  private static getSynonyms(term: string): string[] {
    // Enhanced synonym mapping
    const synonymMap: Record<string, string[]> = {
      'photo': ['photograph', 'picture', 'image', 'shot'],
      'painting': ['artwork', 'illustration', 'drawing', 'canvas'],
      'portrait': ['headshot', 'bust', 'profile', 'face'],
      'landscape': ['scenery', 'vista', 'panorama', 'nature'],
      'modern': ['contemporary', 'current', 'present-day'],
      'old': ['vintage', 'antique', 'aged', 'retro'],
      'bright': ['luminous', 'radiant', 'glowing', 'vivid'],
      'dark': ['shadowy', 'dim', 'moody', 'gloomy']
    };
    
    return synonymMap[term] || [];
  }

  private static detectHumanSubject(prompt: string): boolean {
    return this.humanKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
  }

  static validatePrompt(prompt: string): { isValid: boolean; issues: string[]; suggestions: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (!prompt?.trim()) {
      issues.push('Prompt cannot be empty');
      return { isValid: false, issues, suggestions };
    }

    if (prompt.length < 3) {
      issues.push('Prompt is too short');
      suggestions.push('Add more descriptive details');
    }

    if (prompt.length > 500) {
      issues.push('Prompt is too long (max 500 characters)');
      suggestions.push('Try to be more concise');
    }

    // Check for potential issues and provide suggestions
    if (!prompt.includes('style')) {
      suggestions.push('Consider adding an art style');
    }

    if (!prompt.includes('lighting')) {
      suggestions.push('Consider describing the lighting');
    }

    if (!prompt.includes('color')) {
      suggestions.push('Consider adding color information');
    }

    // Check for banned content
    const bannedTerms = ['nsfw', 'nude', 'explicit', 'violent'];
    for (const term of bannedTerms) {
      if (prompt.toLowerCase().includes(term)) {
        issues.push(`Prompt contains inappropriate content: ${term}`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  private static fillTemplate(template: string, userInput: string): string {
    // Replace placeholders with relevant parts of user input
    let filledTemplate = template;
    const placeholders = template.match(/{([^}]+)}/g) || [];
    
    placeholders.forEach((placeholder, index) => {
      // Remove brackets and get the placeholder name
      const placeholderName = placeholder.replace(/[{}]/g, '').trim();
      
      // Replace placeholder with user input or a sensible default
      filledTemplate = filledTemplate.replace(
        placeholder,
        index === 0 ? userInput : placeholderName
      );
    });

    return filledTemplate;
  }

  static generatePromptSuggestions(userInput: string): PromptSuggestion[] {
    if (!userInput?.trim()) {
      return [];
    }

    const terms = this.analyzeInput(userInput);
    const suggestions: PromptSuggestion[] = [];
    const isHumanSubject = this.detectHumanSubject(userInput);

    promptTemplates.forEach(template => {
      const confidence = this.matchTemplate(terms, template);
      if (confidence > 0.05) {
        let enhancedPrompt = this.enhancePrompt(
          this.fillTemplate(template.template, userInput),
          { 
            style: template.style,
            quality: 'premium',
            details: template.modifiers || []
          }
        );

        // Add face-specific refinements for human subjects
        if (isHumanSubject) {
          enhancedPrompt = `(RAW photo:1.2), (realistic:1.4), ${enhancedPrompt}`;
        }

        suggestions.push({
          prompt: enhancedPrompt,
          confidence,
          template
        });
      }
    });

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private static enhancePrompt(prompt: string, options: EnhancementOptions): string {
    const enhancements: string[] = [];
    const isHumanSubject = this.detectHumanSubject(prompt);

    if (isHumanSubject) {
      // Add face-specific enhancements for human subjects
      enhancements.push(...this.faceEnhancements);
      
      // Add technical parameters for better face generation
      enhancements.push(
        '(high detailed skin:1.2)',
        '(8k uhd, best quality, ultra realistic:1.2)',
        '(realistic, photorealistic:1.4)',
        '(masterpiece, top quality, best quality, official art, beautiful and aesthetic:1.2)',
        '(detailed facial features:1.3)',
        '(perfect eyes, detailed eyes, perfect face:1.4)',
        'dramatic lighting, subsurface scattering'
      );
    }

    // Add style enhancements
    if (options.style && this.styles[options.style as keyof typeof this.styles]) {
      enhancements.push(this.styles[options.style as keyof typeof this.styles]);
    }

    // Add quality enhancements
    if (options.quality) {
      enhancements.push(
        '(masterpiece:1.4)',
        '(best quality:1.4)',
        '(ultra realistic:1.2)',
        '(photorealistic:1.2)',
        '8k resolution',
        'HDR'
      );
    }

    // Add selected details
    if (options.details && options.details.length > 0) {
      const validDetails = options.details.filter(
        (detail: string) => this.details.includes(detail as typeof this.details[number])
      );
      enhancements.push(...validDetails);
    }

    // Construct the final prompt with proper weighting and emphasis
    const enhancedPrompt = `${prompt}, ${enhancements.join(', ')}`;

    // Add negative prompts for human subjects to prevent common issues
    if (isHumanSubject) {
      return `${enhancedPrompt} 
        ### Negative prompt: ${this.negativePrompt}
        ### Parameters: Steps: 30, Sampler: DPM++ 2M Karras, CFG scale: 7.5, Size: 1024x1024, Model hash: sd_xl_refiner_1.0, Denoising strength: 0.7`;
    }

    return enhancedPrompt;
  }
} 