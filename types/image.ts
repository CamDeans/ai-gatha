export interface ImageSettings {
  width: number;
  height: number;
  model: string;
}

export interface GeneratedImage {
  _id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  settings: ImageSettings;
} 