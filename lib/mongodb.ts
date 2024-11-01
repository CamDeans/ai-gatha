/**
 * MongoDB client configuration and connection management
 * Handles different environments (development/production)
 */
import { MongoClient } from 'mongodb'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {
  connectTimeoutMS: 10000, // Timeout after 10s
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'production') {
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalThis._mongoClientPromise = client.connect()
  }
  clientPromise = globalThis._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise 
