/**
 * MongoDB client configuration and connection management
 * Handles different environments (development/production)
 */
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI;

// Updated options without directConnection for SRV URIs
const options = {
  maxPoolSize: 1,
  minPoolSize: 1,
  maxIdleTimeMS: 3000,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 3000,
  serverSelectionTimeoutMS: 3000,
  waitQueueTimeoutMS: 3000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  ssl: true,
  tls: true,
  authSource: 'admin',
  replicaSet: 'atlas-6ae4rv-shard-0',
  authMechanism: 'SCRAM-SHA-1'
} as const

// Create cached connection variable
let cachedClient: MongoClient | null = null;

export default async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    // Quick ping to test connection
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

    // Create new client with connection timeout
    const client = new MongoClient(uri, options);
    
    // Connect with timeout
    const connectionWithTimeout = Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), options.connectTimeoutMS)
      )
    ]);

    cachedClient = await connectionWithTimeout as MongoClient;
    
    // Quick test
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
