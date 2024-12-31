'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PromptEngineer } from "@/lib/prompts/engineer";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PromptTemplate } from "@/lib/prompts/database";

interface PromptSuggestion {
  prompt: string;
  confidence: number;
  template: PromptTemplate;
}

interface PromptRefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSelectRefinement: (prompt: string) => void;
}

export default function PromptRefinementModal({
  isOpen,
  onClose,
  currentPrompt,
  onSelectRefinement,
}: PromptRefinementModalProps) {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);

  useEffect(() => {
    if (currentPrompt && isOpen) {
      const refinements = PromptEngineer.generatePromptSuggestions(currentPrompt);
      console.log('Generated refinements:', refinements); // Debug log
      setSuggestions(refinements);
    }
  }, [currentPrompt, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Refine Your Prompt</DialogTitle>
          <DialogDescription>
            Select a refined version of your prompt or use the original
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {suggestions.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No refinement suggestions available for this prompt.
              Try adding more details to your prompt.
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="space-y-2 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {suggestion.template.category} Style
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(suggestion.confidence * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.prompt}
                    </p>
                    {suggestion.template.examples && (
                      <div className="text-xs text-muted-foreground mt-2">
                        <p className="font-medium">Example:</p>
                        <p>{suggestion.template.examples[0]}</p>
                      </div>
                    )}
                    <Button
                      onClick={() => {
                        onSelectRefinement(suggestion.prompt);
                        onClose();
                      }}
                      variant="outline"
                      className="w-full mt-2"
                    >
                      Use This Prompt
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 