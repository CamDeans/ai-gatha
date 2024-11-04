/**
 * MongoDB client configuration and connection management
 * Handles different environments (development/production)
 */
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI;

// Updated options to handle SSL/TLS issues
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
  tlsInsecure: false,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  authSource: 'admin',
  directConnection: false,
  minVersion: 'TLS1_2',
  maxVersion: 'TLS1_3',
  replicaSet: 'atlas-6ae4rv-shard-0',
  authMechanism: 'SCRAM-SHA-1'
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
      uriPrefix: uri.substring(0, 20) + '...',
      environment: process.env.NODE_ENV,
      options: {
        ssl: options.ssl,
        tls: options.tls,
        replicaSet: options.replicaSet,
        authMechanism: options.authMechanism
      }
    });

    const client = new MongoClient(uri, options);
    cachedClient = await client.connect();
    
    // Test the connection
    await cachedClient.db().command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    
    return cachedClient;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedClient = null; // Reset cached client on error
    throw error;
  }
}
