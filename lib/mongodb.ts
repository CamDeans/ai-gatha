/**
 * MongoDB client configuration and connection management
 * Handles different environments (development/production)
 */
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI;

// Updated options with shorter timeouts for serverless environment
const options = {
  maxPoolSize: 1, // Reduced for serverless
  minPoolSize: 1, // Reduced for serverless
  maxIdleTimeMS: 5000, // Reduced from 60000
  connectTimeoutMS: 5000, // Reduced from 10000
  socketTimeoutMS: 5000, // Reduced from 10000
  serverSelectionTimeoutMS: 5000, // Reduced from 10000
  waitQueueTimeoutMS: 5000, // Reduced from 10000
  ssl: true,
  tls: true,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  authSource: 'admin',
  directConnection: false,
  replicaSet: 'atlas-6ae4rv-shard-0',
  authMechanism: 'SCRAM-SHA-1'
} as const

// Create cached connection variable
let cachedClient: MongoClient | null = null;

export default async function connectToDatabase(): Promise<MongoClient> {
  if (cachedClient) {
    // Test cached connection before returning
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
        ssl: options.ssl,
        tls: options.tls,
        replicaSet: options.replicaSet,
        authMechanism: options.authMechanism,
        timeouts: {
          connect: options.connectTimeoutMS,
          socket: options.socketTimeoutMS,
          serverSelection: options.serverSelectionTimeoutMS
        }
      }
    });

    // Create new client with connection timeout
    const client = new MongoClient(uri, options);
    
    // Add connection timeout
    const connectionPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), options.connectTimeoutMS);
    });

    // Race between connection and timeout
    cachedClient = await Promise.race([connectionPromise, timeoutPromise]) as MongoClient;
    
    // Test the connection
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
