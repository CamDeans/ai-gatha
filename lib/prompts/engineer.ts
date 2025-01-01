import { promptTemplates, PromptTemplate } from './database'

interface PromptSuggestion {
  prompt: string;
  confidence: number;
  template: PromptTemplate;
}

export class PromptEngineer {
  static readonly styles = {
    photorealistic: 'professional photography, clear focus',
    artistic: 'candid photography, genuine moment',
    cinematic: 'professional headshot, studio quality',
    anime: 'modern portrait, authentic expression',
    digital: 'well-composed, balanced lighting',
    vintage: 'high-end photography, clear focus'
  } as const;

  static readonly details = [
    'clear focus',
    'balanced lighting',
    'authentic appearance',
    'clear details',
    'professional quality',
    'genuine moment',
    'balanced composition'
  ] as const;

  private static readonly humanKeywords = [
    'person', 'man', 'woman', 'boy', 'girl', 'people',
    'portrait', 'face', 'human', 'body', 'figure'
  ] as const;

  private static readonly faceEnhancements = [
    'authentic expression',
    'professional photography',
    'clear features',
    'authentic appearance',
    'professional quality',
    'balanced lighting',
    'authentic look',
    'clear details',
    'genuine moment',
    'professional composition'
  ] as const;

  private static readonly negativePrompt = [
    'artificial appearance',
    'unrealistic look',
    'unbalanced composition',
    'poor lighting',
    'artificial colors',
    'busy background',
    'messy presentation',
    'complex shapes',
    'cluttered layout',
    'distracting elements'
  ].join(', ');

  private static analyzeInput(input: string): string[] {
    const terms = input.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(term => term.length > 2)
      .map(term => term.trim());

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
    
    terms.forEach(term => {
      if (allTerms.some(t => t.includes(term) || term.includes(t))) {
        score += 1;
      }
    });

    if (template.weight) {
      score *= template.weight;
    }

    return score / Math.max(terms.length, 1);
  }

  private static getSynonyms(term: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'photo': ['professional', 'photography', 'picture'],
      'painting': ['artwork', 'artistic', 'genuine'],
      'portrait': ['headshot', 'professional'],
      'landscape': ['environment', 'balanced'],
      'modern': ['professional', 'contemporary'],
      'old': ['vintage', 'authentic'],
      'bright': ['clear', 'balanced'],
      'dark': ['balanced', 'authentic']
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

    if (!prompt.includes('professional')) {
      suggestions.push('Consider adding professional quality');
    }

    if (!prompt.includes('balanced')) {
      suggestions.push('Consider describing the composition');
    }

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
    let filledTemplate = template;
    const placeholders = template.match(/{([^}]+)}/g) || [];
    
    placeholders.forEach((placeholder, index) => {
      const placeholderName = placeholder.replace(/[{}]/g, '').trim();
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
        let enhancedPrompt = this.fillTemplate(template.template, userInput);

        if (isHumanSubject) {
          enhancedPrompt = `professional photography, ${enhancedPrompt}`;
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

  private static enhancePrompt(prompt: string, options: any): string {
    const enhancements: string[] = [];
    const isHumanSubject = this.detectHumanSubject(prompt);

    if (isHumanSubject) {
      enhancements.push(...this.faceEnhancements);
      
      enhancements.push(
        'professional quality',
        'balanced composition',
        'authentic expression',
        'clear details',
        'balanced lighting'
      );
    }

    if (options.style && this.styles[options.style as keyof typeof this.styles]) {
      enhancements.push(this.styles[options.style as keyof typeof this.styles]);
    }

    const enhancedPrompt = `${prompt}, ${enhancements.join(', ')}`;

    if (isHumanSubject) {
      return `${enhancedPrompt} 
        ### Negative prompt: ${this.negativePrompt}
        ### Parameters: Steps: 30, Sampler: DPM++ 2M Karras, CFG scale: 7.5, Size: 1024x1024, Model hash: sd_xl_refiner_1.0, Denoising strength: 0.7`;
    }

    return enhancedPrompt;
  }
} 