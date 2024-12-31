interface RefinementSuggestion {
  type: 'style' | 'detail' | 'composition' | 'lighting' | 'mood';
  suggestion: string;
  example: string;
}

interface RefinementOption {
  type: 'style' | 'detail' | 'composition' | 'lighting' | 'mood';
  style?: string;
  lighting?: string;
  detail?: string;
  composition?: string;
  mood?: string;
  suggestion: string;
}

export class PromptRefiner {
  // Base quality modifiers that will be added to every prompt
  private static baseQualityModifiers = [
    'high quality',
    'detailed',
    'realistic',
    'natural lighting'
  ];

  // Each style has a completely different approach
  private static styleModifiers = [
    'professional photography, natural colors, clear focus',
    'modern portrait, natural pose, authentic expression',
    'professional headshot, clean background, studio quality',
    'candid photography, natural environment, genuine moment',
    'minimalist logo design, clean lines, professional branding'
  ];

  // Each detail variation focuses on different aspects
  private static detailModifiers = [
    'clear details, natural skin texture, realistic features',
    'authentic appearance, natural materials, lifelike',
    'professional quality, well-composed, balanced lighting',
    'high-end photography, clear focus, natural colors',
    'vector style graphics, crisp edges, scalable design'
  ];

  // Each composition offers a distinct view
  private static compositionModifiers = [
    'balanced composition, natural perspective, clear view',
    'centered frame, professional composition, clean background',
    'detailed portrait, natural pose, authentic expression',
    'environmental portrait, natural setting, genuine context',
    'centered logo layout, balanced spacing, professional design'
  ];

  // Each lighting setup creates a unique mood
  private static lightingModifiers = [
    'natural lighting, soft shadows, clear illumination',
    'golden hour lighting, warm natural glow, soft highlights',
    'studio lighting, even illumination, professional setup',
    'ambient lighting, natural atmosphere, balanced exposure',
    'flat lighting, clean presentation, professional display'
  ];

  // Each mood creates a distinct emotional response
  private static moodModifiers = [
    'professional and polished, natural presence, authentic',
    'elegant and natural, genuine quality, authentic look',
    'bright and clear, natural energy, authentic feel',
    'calm and natural, genuine atmosphere, authentic mood',
    'corporate and professional, minimalist style, modern brand'
  ];

  private static detectLogoPrompt(prompt: string): boolean {
    const logoKeywords = [
      'logo', 'brand', 'icon', 'symbol', 'emblem',
      'trademark', 'corporate', 'identity', 'branding'
    ];
    return logoKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
  }

  static refinePrompt(prompt: string): RefinementSuggestion[] {
    const suggestions: RefinementSuggestion[] = [];
    const isLogo = this.detectLogoPrompt(prompt);
    
    // Add base quality to the prompt
    const basePrompt = `${prompt}, ${this.baseQualityModifiers.join(', ')}`;

    // Create refinements based on the type of prompt
    const refinements: RefinementOption[] = isLogo ? [
      {
        type: 'style',
        style: this.styleModifiers[4],
        lighting: this.lightingModifiers[4],
        suggestion: 'Minimalist logo version',
      },
      {
        type: 'style',
        style: this.styleModifiers[4],
        detail: this.detailModifiers[4],
        suggestion: 'Vector style logo version',
      },
      {
        type: 'composition',
        composition: this.compositionModifiers[4],
        lighting: this.lightingModifiers[4],
        suggestion: 'Professional logo layout',
      },
      {
        type: 'mood',
        mood: this.moodModifiers[4],
        composition: this.compositionModifiers[4],
        suggestion: 'Corporate brand version',
      },
      {
        type: 'lighting',
        lighting: this.lightingModifiers[4],
        detail: this.detailModifiers[4],
        suggestion: 'Clean professional version',
      }
    ] : [
      {
        type: 'style',
        style: this.styleModifiers[0],
        lighting: this.lightingModifiers[0],
        suggestion: 'Professional photography version',
      },
      {
        type: 'style',
        style: this.styleModifiers[1],
        detail: this.detailModifiers[1],
        suggestion: 'Modern portrait version',
      },
      {
        type: 'composition',
        composition: this.compositionModifiers[2],
        lighting: this.lightingModifiers[2],
        suggestion: 'Detailed portrait version',
      },
      {
        type: 'mood',
        mood: this.moodModifiers[3],
        composition: this.compositionModifiers[3],
        suggestion: 'Natural environmental version',
      },
      {
        type: 'lighting',
        lighting: this.lightingModifiers[1],
        detail: this.detailModifiers[0],
        suggestion: 'Golden hour version',
      }
    ];

    // Create unique combinations for each refinement
    refinements.forEach(refinement => {
      let enhancedPrompt = basePrompt;
      
      if (refinement.style) {
        enhancedPrompt += `, ${refinement.style}`;
      }
      if (refinement.lighting) {
        enhancedPrompt += `, ${refinement.lighting}`;
      }
      if (refinement.detail) {
        enhancedPrompt += `, ${refinement.detail}`;
      }
      if (refinement.composition) {
        enhancedPrompt += `, ${refinement.composition}`;
      }
      if (refinement.mood) {
        enhancedPrompt += `, ${refinement.mood}`;
      }

      suggestions.push({
        type: refinement.type,
        suggestion: refinement.suggestion,
        example: enhancedPrompt
      });
    });

    return suggestions;
  }
} 