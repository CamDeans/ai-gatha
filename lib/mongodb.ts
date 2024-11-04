/**
 * MongoDB client configuration and connection management
 */
import { MongoClient, MongoClientOptions } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI;

// Production-ready MongoDB options
const options: MongoClientOptions = {
  maxPoolSize: 1,
  minPoolSize: 1,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  serverSelectionTimeoutMS: 60000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  tls: true,
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-1'
};

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
      environment: process.env.NODE_ENV
    });

    const client = new MongoClient(uri, options);
    cachedClient = await client.connect();
    
    await cachedClient.db().command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    
    return cachedClient;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedClient = null;
    throw new Error('Failed to connect to database');
  }
}
