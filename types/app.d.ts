interface User {
  id: string;
  email: string;
  name?: string;
}

interface Image {
  id: string;
  userId: string;
  prompt: string;
  imageData: string;
  createdAt: Date;
  tags?: string[];
  metadata?: {
    model: string;
    settings?: Record<string, any>;
  };
}

interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  imageSize: '512x512' | '768x768' | '1024x1024';
  defaultModel: 'stable-diffusion' | 'dall-e' | 'midjourney';
  promptHistory: boolean;
  createdAt: Date;
  updatedAt: Date;
} 