'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PromptTemplate } from "@/lib/prompts/database";

export interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: Array<{
    prompt: string;
    confidence: number;
    template: PromptTemplate;
  }>;
  onSelect: (prompt: string) => void;
}

export default function PromptModal({
  isOpen,
  onClose,
  suggestions = [],
  onSelect
}: PromptModalProps) {
  const hasSuggestions = Array.isArray(suggestions) && suggestions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suggested Prompts</DialogTitle>
          <DialogDescription>
            Select a prompt to use as your starting point
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          {!hasSuggestions ? (
            <div className="flex flex-col items-center justify-center p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Try adding more details to your prompt to get better suggestions
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="space-y-2">
                  <button
                    onClick={() => {
                      onSelect(suggestion.prompt);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                  >
                    <span className="text-sm font-medium">{suggestion.prompt}</span>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Category: {suggestion.template.category}
                      <br />
                      Style: {suggestion.template.style}
                      <br />
                      Confidence: {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </button>
                </div>
              ))}

              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 