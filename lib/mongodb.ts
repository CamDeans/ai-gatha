/**
 * MongoDB client configuration and connection management
 */
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI;

// Simplified options for better reliability
const options = {
  maxPoolSize: 1,
  minPoolSize: 1,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
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
    
    // Connect with timeout
    const connectionPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), options.connectTimeoutMS)
    );

    cachedClient = await Promise.race([connectionPromise, timeoutPromise]) as MongoClient;
    
    // Test connection
    await cachedClient.db().command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    
    return cachedClient;
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
