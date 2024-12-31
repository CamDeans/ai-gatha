'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptEnhancer } from '@/lib/prompts/enhancer';

interface Settings {
  style: keyof typeof PromptEnhancer.styles | '';
  lighting: keyof typeof PromptEnhancer.lighting | '';
  camera: keyof typeof PromptEnhancer.cameras | '';
  composition: keyof typeof PromptEnhancer.compositions | '';
  quality: keyof typeof PromptEnhancer.qualities | '';
  weights: boolean;
  emphasis: number;
  aspect: '1:1' | '16:9' | '3:2' | '4:3';
}

interface AdvancedControlsProps {
  onUpdate: (prompt: string) => void;
  basePrompt: string;
}

export default function AdvancedControls({ onUpdate, basePrompt }: AdvancedControlsProps) {
  const [settings, setSettings] = useState<Settings>({
    style: '',
    lighting: '',
    camera: '',
    composition: '',
    quality: 'standard',
    weights: true,
    emphasis: 1.0,
    aspect: '1:1'
  });

  const handleSettingChange = <T extends keyof Settings>(key: T, value: Settings[T]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    generateEnhancedPrompt({ ...settings, [key]: value });
  };

  const generateEnhancedPrompt = (currentSettings: Settings) => {
    const enhancedPrompt = [basePrompt];
    
    if (currentSettings.style) {
      enhancedPrompt.push(PromptEnhancer.styles[currentSettings.style]);
    }
    
    if (currentSettings.lighting) {
      enhancedPrompt.push(PromptEnhancer.lighting[currentSettings.lighting]);
    }
    
    if (currentSettings.camera) {
      enhancedPrompt.push(PromptEnhancer.cameras[currentSettings.camera]);
    }
    
    if (currentSettings.composition) {
      enhancedPrompt.push(PromptEnhancer.compositions[currentSettings.composition]);
    }

    if (currentSettings.quality) {
      const quality = PromptEnhancer.qualities[currentSettings.quality];
      if (currentSettings.weights) {
        const enhancedQuality = quality.replace(
          /:([\d.]+)/g,
          (match, weight) => `:${parseFloat(weight) * currentSettings.emphasis}`
        );
        enhancedPrompt.push(enhancedQuality);
      } else {
        enhancedPrompt.push(quality);
      }
    }

    const finalPrompt = `${enhancedPrompt.join(', ')}
      ### Negative prompt: ${PromptEnhancer.negativeBase}
      ### Parameters: Steps: 35, Sampler: DPM++ 2M Karras, CFG scale: 7, Size: ${currentSettings.aspect === '1:1' ? '1024x1024' : '1024x768'}, Model: sd_xl_base_1.0, Denoising strength: 0.7`;

    onUpdate(finalPrompt);
  };

  return (
    <Tabs defaultValue="style" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="style">Style</TabsTrigger>
        <TabsTrigger value="technical">Technical</TabsTrigger>
        <TabsTrigger value="composition">Composition</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="style" className="space-y-4">
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PromptEnhancer.styles) as Array<keyof typeof PromptEnhancer.styles>).map((key) => (
              <Button
                key={key}
                variant={settings.style === key ? 'default' : 'outline'}
                onClick={() => handleSettingChange('style', key)}
                className="justify-start"
              >
                {key}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="technical" className="space-y-4">
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Quality Preset</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PromptEnhancer.qualities) as Array<keyof typeof PromptEnhancer.qualities>).map((key) => (
                  <Button
                    key={key}
                    variant={settings.quality === key ? 'default' : 'outline'}
                    onClick={() => handleSettingChange('quality', key)}
                    className="justify-start"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lighting</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PromptEnhancer.lighting) as Array<keyof typeof PromptEnhancer.lighting>).map((key) => (
                  <Button
                    key={key}
                    variant={settings.lighting === key ? 'default' : 'outline'}
                    onClick={() => handleSettingChange('lighting', key)}
                    className="justify-start"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Camera</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PromptEnhancer.cameras) as Array<keyof typeof PromptEnhancer.cameras>).map((key) => (
                  <Button
                    key={key}
                    variant={settings.camera === key ? 'default' : 'outline'}
                    onClick={() => handleSettingChange('camera', key)}
                    className="justify-start"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="composition" className="space-y-4">
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PromptEnhancer.compositions) as Array<keyof typeof PromptEnhancer.compositions>).map((key) => (
              <Button
                key={key}
                variant={settings.composition === key ? 'default' : 'outline'}
                onClick={() => handleSettingChange('composition', key)}
                className="justify-start"
              >
                {key}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label>Quality Emphasis</Label>
          <Slider
            value={[settings.emphasis]}
            onValueChange={([value]: number[]) => handleSettingChange('emphasis', value)}
            min={0.5}
            max={1.5}
            step={0.1}
            className="w-[200px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.weights}
            onCheckedChange={(checked: boolean) => handleSettingChange('weights', checked)}
          />
          <Label>Use Prompt Weights</Label>
        </div>
      </div>
    </Tabs>
  );
} 