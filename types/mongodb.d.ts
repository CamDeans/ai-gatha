import { ObjectId } from 'mongodb';

export interface MongoImage {
  _id: ObjectId;
  userId: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
  metadata?: {
    model: string;
    settings?: Record<string, any>;
  };
}

export interface MongoUser {
  _id: ObjectId;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
} 