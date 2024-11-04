/**
 * MongoDB client configuration and connection management
 * Handles different environments (development/production)
 */
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

// Ensure URI starts with mongodb:// or mongodb+srv://
const uri = process.env.MONGODB_URI.startsWith('mongodb://') || process.env.MONGODB_URI.startsWith('mongodb+srv://')
  ? process.env.MONGODB_URI
  : `mongodb+srv://${process.env.MONGODB_URI}`;

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 20000,
  serverSelectionTimeoutMS: 10000,
  waitQueueTimeoutMS: 10000,
  ssl: true,
  tls: true,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  authSource: 'admin',
  directConnection: false
} as const

// Create cached connection variable
let cachedClient: MongoClient | null = null;

export default async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    console.log('Connecting to MongoDB...', { 
      hasUri: !!process.env.MONGODB_URI,
      uriPrefix: uri.substring(0, 20) + '...' // Log prefix for debugging
    });

    const client = new MongoClient(uri, options);
    cachedClient = await client.connect();
    return cachedClient;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
