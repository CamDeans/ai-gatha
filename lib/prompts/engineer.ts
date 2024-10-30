import { promptTemplates, PromptTemplate } from './database'

interface PromptSuggestion {
  prompt: string;
  confidence: number;
  template: PromptTemplate;
}

export class PromptEngineer {
  private static analyzeInput(input: string): string[] {
    // Extract key terms and concepts from user input
    const terms = input.toLowerCase().split(' ')
    return terms.filter(term => term.length > 3)
  }

  private static matchTemplate(terms: string[], template: PromptTemplate): number {
    let score = 0
    const allTerms = [...template.tags, template.category.toLowerCase(), template.style.toLowerCase()]
    
    terms.forEach(term => {
      if (allTerms.some(t => t.includes(term) || term.includes(t))) {
        score += 1
      }
    })

    return score / terms.length
  }

  static generatePromptSuggestions(userInput: string): PromptSuggestion[] {
    const terms = this.analyzeInput(userInput)
    const suggestions: PromptSuggestion[] = []

    promptTemplates.forEach(template => {
      const confidence = this.matchTemplate(terms, template)
      if (confidence > 0.2) { // Minimum confidence threshold
        suggestions.push({
          prompt: this.fillTemplate(template.template, userInput),
          confidence,
          template
        })
      }
    })

    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
  }

  private static fillTemplate(template: string, userInput: string): string {
    // Basic template filling - this could be made more sophisticated
    return template.replace(/{([^}]+)}/g, userInput.trim())
  }
} 