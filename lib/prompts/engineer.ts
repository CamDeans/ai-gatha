import { promptTemplates, PromptTemplate } from './database'

interface PromptSuggestion {
  prompt: string;
  confidence: number;
  template: PromptTemplate;
}

export class PromptEngineer {
  private static analyzeInput(input: string): string[] {
    // Extract key terms and concepts from user input
    return input.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(' ')
      .filter(term => term.length > 2); // Filter out short words
  }

  private static matchTemplate(terms: string[], template: PromptTemplate): number {
    let score = 0;
    const allTerms = [
      ...template.tags,
      template.category.toLowerCase(),
      template.style.toLowerCase()
    ];
    
    terms.forEach(term => {
      if (allTerms.some(t => t.includes(term) || term.includes(t))) {
        score += 1;
      }
    });

    // Normalize score between 0 and 1
    return score / Math.max(terms.length, 1);
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

    promptTemplates.forEach(template => {
      const confidence = this.matchTemplate(terms, template);
      if (confidence > 0.1) { // Lower threshold from 0.2 to 0.1
        suggestions.push({
          prompt: this.fillTemplate(template.template, userInput),
          confidence,
          template
        });
      }
    });

    // Sort by confidence and take top 5
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }
} 