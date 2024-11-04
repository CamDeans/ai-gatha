/**
 * MongoDB client configuration and connection management
 */
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI;

// Simplified options for serverless environment
const options = {
  maxPoolSize: 1,
  minPoolSize: 1,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  ssl: true,
  tls: true,
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-1'
} as const

let cachedClient: MongoClient | null = null;

export default async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    try {
      await cachedClient.db().command({ ping: 1 });
      return cachedClient;
    } catch (error) {
      console.log('Cached connection failed, creating new connection');
      await cachedClient.close();
      cachedClient = null;
    }
  }

  try {
    console.log('Connecting to MongoDB...', { 
      hasUri: !!process.env.MONGODB_URI,
      uriPrefix: uri.substring(0, 20) + '...',
      environment: process.env.NODE_ENV,
      options: {
        maxPoolSize: options.maxPoolSize,
        timeouts: {
          connect: options.connectTimeoutMS,
          socket: options.socketTimeoutMS,
          serverSelection: options.serverSelectionTimeoutMS
        }
      }
    });

    const client = new MongoClient(uri, options);
    
    // Connect with retries
    for (let i = 0; i < 3; i++) {
      try {
        cachedClient = await client.connect();
        await cachedClient.db().command({ ping: 1 });
        console.log('Successfully connected to MongoDB');
        return cachedClient;
      } catch (error) {
        console.error(`Connection attempt ${i + 1} failed:`, error);
        if (i === 2) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Failed to connect after retries');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedClient = null;
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('MongoDB connection timeout. Please try again.');
      }
      if (error.message.includes('authentication failed')) {
        throw new Error('MongoDB authentication failed. Check credentials.');
      }
    }
    throw error;
  }
}
