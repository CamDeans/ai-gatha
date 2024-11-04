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
    //'ultra realistic',
    //'professional photography',
    //'sharp focus',
    '8k uhd',
    'perfect anatomy',
    //'hyperrealistic details'
  ];

  // Each style has a completely different approach
  private static styleModifiers = [
    'cinematic film still, anamorphic lens, movie scene quality, dramatic composition',
    'high fashion editorial, vogue magazine quality, professional model pose',
    'professional portrait photography, studio lighting setup, commercial grade',
    'artistic photography, creative composition, unique perspective'
  ];

  // Each detail variation focuses on different aspects
  private static detailModifiers = [
    'intricate fine details, ultra sharp focus, crystal clear resolution',
    'photorealistic skin textures, natural materials, lifelike details',
    'high-end production value, premium quality finish, flawless execution',
    'masterpiece quality, award-winning photography, perfect clarity'
  ];

  // Each composition offers a distinct view
  private static compositionModifiers = [
    'dynamic angle, dramatic perspective, cinematic framing',
    'symmetrical composition, perfect balance, harmonious layout',
    'close-up detail shot, macro photography, intimate perspective',
    'wide establishing shot, environmental context, grand scale'
  ];

  // Each lighting setup creates a unique mood
  private static lightingModifiers = [
    'dramatic rim lighting, high contrast shadows, moody atmosphere',
    'soft natural sunlight, golden hour glow, warm tones',
    'professional studio lighting, perfect highlights, clean shadows',
    'atmospheric volumetric lighting, cinematic rays, depth lighting'
  ];

  // Each mood creates a distinct emotional response
  private static moodModifiers = [
    'dramatic and intense, powerful emotional impact, striking presence',
    'elegant and sophisticated, refined luxury, timeless beauty',
    'bright and energetic, vibrant atmosphere, dynamic feeling',
    'calm and serene, peaceful ambiance, tranquil mood'
  ];

  static refinePrompt(prompt: string): RefinementSuggestion[] {
    const suggestions: RefinementSuggestion[] = [];
    
    // Add base quality to the prompt
    const basePrompt = `${prompt}, ${this.baseQualityModifiers.join(', ')}`;

    // Create five distinct refinements, each with a unique combination
    const refinements: RefinementOption[] = [
      {
        type: 'style',
        style: this.styleModifiers[0],
        lighting: this.lightingModifiers[0],
        suggestion: 'Cinematic and dramatic version',
      },
      {
        type: 'style',
        style: this.styleModifiers[1],
        detail: this.detailModifiers[1],
        suggestion: 'High fashion editorial version',
      },
      {
        type: 'composition',
        composition: this.compositionModifiers[2],
        lighting: this.lightingModifiers[2],
        suggestion: 'Detailed close-up version',
      },
      {
        type: 'mood',
        mood: this.moodModifiers[3],
        composition: this.compositionModifiers[3],
        suggestion: 'Serene wide-angle version',
      },
      {
        type: 'lighting',
        lighting: this.lightingModifiers[1],
        detail: this.detailModifiers[0],
        suggestion: 'Natural light detailed version',
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