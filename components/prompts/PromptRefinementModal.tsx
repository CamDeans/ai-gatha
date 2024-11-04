'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PromptRefiner } from "@/lib/prompts/refiner";
import { useEffect, useState } from "react";

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
  onSelectRefinement
}: PromptRefinementModalProps) {
  const [suggestions, setSuggestions] = useState<ReturnType<typeof PromptRefiner.refinePrompt>>([]);

  useEffect(() => {
    if (isOpen && currentPrompt) {
      setSuggestions(PromptRefiner.refinePrompt(currentPrompt));
    }
  }, [isOpen, currentPrompt]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refine Your Prompt</DialogTitle>
          <DialogDescription>
            Select a refinement to enhance your prompt
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="space-y-2">
                <button
                  onClick={() => {
                    onSelectRefinement(suggestion.example);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  <span className="text-sm font-medium">{suggestion.example}</span>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {suggestion.suggestion}
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 