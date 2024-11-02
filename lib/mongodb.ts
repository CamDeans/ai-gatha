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
<<<<<<< HEAD
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
=======
  connectTimeoutMS: 1000000, // Timeout after 10s
  retryWrites: true,
  retryReads: true,
>>>>>>> 1140bc5e9f1b0d445977b38dec50adcf47326eed
}

let client
let clientPromise: Promise<MongoClient>

<<<<<<< HEAD
if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
=======
if (process.env.NODE_ENV === 'production') {
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalThis._mongoClientPromise = client.connect()
>>>>>>> 1140bc5e9f1b0d445977b38dec50adcf47326eed
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

<<<<<<< HEAD
// Add error handling
clientPromise.catch(error => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

export default clientPromise 
=======
export default clientPromise 
>>>>>>> 1140bc5e9f1b0d445977b38dec50adcf47326eed
