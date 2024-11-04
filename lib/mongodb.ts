/**
 * MongoDB client configuration and connection management
 * Handles different environments (development/production)
 */
import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
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
let cachedPromise: Promise<MongoClient> | null = null;

export default async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient) {
    return cachedClient;
  }

  // If we have a cached promise, use it
  if (!cachedPromise) {
    const client = new MongoClient(uri, options);
    cachedPromise = client.connect()
      .then(client => {
        cachedClient = client;
        return client;
      })
      .catch(error => {
        console.error('MongoDB connection error:', error);
        cachedPromise = null;
        throw error;
      });
  }

  try {
    cachedClient = await cachedPromise;
    return cachedClient;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Clear cache if connection fails
    cachedClient = null;
    cachedPromise = null;
    throw error;
  }
}
