interface RefinementSuggestion {
  type: 'style' | 'detail' | 'composition' | 'lighting' | 'mood';
  suggestion: string;
  example: string;
}

export class PromptRefiner {
  private static styleModifiers = [
    'photorealistic', 'cinematic', 'artistic', 'minimalist', 
    'surreal', 'abstract', 'vintage', 'futuristic'
  ];

  private static detailModifiers = [
    'highly detailed', 'intricate', '8k resolution', 'sharp focus',
    'ultra HD', 'masterpiece', 'professional', 'award-winning'
  ];

  private static compositionModifiers = [
    'wide angle', 'close-up', 'panoramic', 'aerial view',
    'symmetrical', 'rule of thirds', 'dynamic composition'
  ];

  private static lightingModifiers = [
    'soft lighting', 'dramatic lighting', 'natural light', 'golden hour',
    'backlit', 'studio lighting', 'volumetric lighting'
  ];

  private static moodModifiers = [
    'peaceful', 'dramatic', 'mysterious', 'energetic',
    'serene', 'dark', 'vibrant', 'melancholic'
  ];

  static refinePrompt(prompt: string): RefinementSuggestion[] {
    const suggestions: RefinementSuggestion[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Check if prompt lacks style specification
    if (!this.styleModifiers.some(style => lowerPrompt.includes(style.toLowerCase()))) {
      suggestions.push({
        type: 'style',
        suggestion: 'Add a specific style',
        example: `${prompt}, ${this.styleModifiers[Math.floor(Math.random() * this.styleModifiers.length)]} style`
      });
    }

    // Check if prompt lacks detail specification
    if (!this.detailModifiers.some(detail => lowerPrompt.includes(detail.toLowerCase()))) {
      suggestions.push({
        type: 'detail',
        suggestion: 'Add detail level',
        example: `${this.detailModifiers[Math.floor(Math.random() * this.detailModifiers.length)]}, ${prompt}`
      });
    }

    // Check if prompt lacks composition guidance
    if (!this.compositionModifiers.some(comp => lowerPrompt.includes(comp.toLowerCase()))) {
      suggestions.push({
        type: 'composition',
        suggestion: 'Specify composition',
        example: `${prompt}, ${this.compositionModifiers[Math.floor(Math.random() * this.compositionModifiers.length)]}`
      });
    }

    // Check if prompt lacks lighting specification
    if (!this.lightingModifiers.some(light => lowerPrompt.includes(light.toLowerCase()))) {
      suggestions.push({
        type: 'lighting',
        suggestion: 'Add lighting details',
        example: `${prompt}, ${this.lightingModifiers[Math.floor(Math.random() * this.lightingModifiers.length)]}`
      });
    }

    // Check if prompt lacks mood specification
    if (!this.moodModifiers.some(mood => lowerPrompt.includes(mood.toLowerCase()))) {
      suggestions.push({
        type: 'mood',
        suggestion: 'Add mood',
        example: `${prompt}, ${this.moodModifiers[Math.floor(Math.random() * this.moodModifiers.length)]} atmosphere`
      });
    }

    return suggestions;
  }
} 