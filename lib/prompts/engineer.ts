import { promptTemplates, PromptTemplate } from './database'
import { EnhancementOptions } from './enhancer'

interface PromptSuggestion {
  prompt: string;
  confidence: number;
  template: PromptTemplate;
}

export class PromptEngineer {
  static readonly styles = {
    photorealistic: 'professional photography, natural colors, clear focus',
    artistic: 'candid photography, natural environment, genuine moment',
    cinematic: 'professional headshot, clean background, studio quality',
    anime: 'modern portrait, natural pose, authentic expression',
    digital: 'professional quality, well-composed, balanced lighting',
    vintage: 'high-end photography, clear focus, natural colors'
  } as const;

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
    'natural perspective'
  ] as const;

  private static readonly humanKeywords = [
    'person', 'man', 'woman', 'boy', 'girl', 'people',
    'portrait', 'face', 'human', 'body', 'figure'
  ] as const;

  private static readonly faceEnhancements = [
    'natural pose, authentic expression',
    'professional photography, natural colors',
    'clear features, balanced composition',
    'natural appearance, genuine quality',
    'professional quality, clear focus',
    'balanced lighting, clean background',
    'authentic look, natural presence',
    'clear details, professional setup',
    'natural perspective, genuine moment',
    'professional composition, natural environment'
  ] as const;

  private static readonly negativePrompt = [
    'unnatural features, artificial appearance',
    'blurred features, unrealistic look',
    'unbalanced composition, poor lighting',
    'artificial colors, busy background',
    'distorted proportions, messy presentation',
    'complex shapes, cluttered layout',
    'oversaturated, overexposed, underexposed',
    'noisy, grainy, pixelated',
    'low quality, artificial elements',
    'complex background, distracting elements'
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
      'photo': ['professional', 'photography', 'picture', 'image'],
      'painting': ['artwork', 'artistic', 'natural', 'genuine'],
      'portrait': ['headshot', 'professional', 'natural', 'authentic'],
      'landscape': ['environment', 'natural', 'balanced', 'clear'],
      'modern': ['professional', 'contemporary', 'balanced', 'clean'],
      'old': ['vintage', 'authentic', 'genuine', 'natural'],
      'bright': ['clear', 'balanced', 'natural', 'professional'],
      'dark': ['balanced', 'natural', 'authentic', 'genuine']
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
    if (!prompt.includes('professional')) {
      suggestions.push('Consider adding professional quality');
    }

    if (!prompt.includes('natural')) {
      suggestions.push('Consider adding natural elements');
    }

    if (!prompt.includes('balanced')) {
      suggestions.push('Consider describing the composition');
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
          enhancedPrompt = `professional photography, natural colors, ${enhancedPrompt}`;
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
        'professional quality, natural appearance',
        'balanced composition, clear focus',
        'authentic expression, genuine moment',
        'natural environment, clean background',
        'professional setup, balanced lighting'
      );
    }

    // Add style enhancements
    if (options.style && this.styles[options.style as keyof typeof this.styles]) {
      enhancements.push(this.styles[options.style as keyof typeof this.styles]);
    }

    // Add quality enhancements
    if (options.quality) {
      enhancements.push(
        'professional quality',
        'natural appearance',
        'authentic look',
        'clear details',
        'balanced composition'
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