/**
 * API Route for user registration
 * Handles new user creation with password hashing
 */
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { ApiError } from '@/lib/api-error';
import { MongoClient } from 'mongodb';

// Add timeout for MongoDB connection
const MONGODB_TIMEOUT = 10000; // 10 seconds

export async function POST(req: Request) {
  try {
    // Add timeout to the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MONGODB_TIMEOUT);

    const { email, password, name } = await req.json();

    // Validate input
    if (!email || !password) {
      clearTimeout(timeoutId);
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Connect to MongoDB with timeout
    const client = await Promise.race([
      clientPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), MONGODB_TIMEOUT)
    ]) as MongoClient;

    const db = client.db('deansight');

    // Check if user already exists
    const existingUser = await db
      .collection('users')
      .findOne({ email: email.toLowerCase() });

    if (existingUser) {
      clearTimeout(timeoutId);
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Email already registered' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    await db.collection('users').insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || null,
      createdAt: new Date(),
    });

    clearTimeout(timeoutId);
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        message: 'Account created successfully' 
      }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Handle specific error types
    if (error instanceof ApiError) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: error.message 
        }),
        { 
          status: error.statusCode,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Handle timeout errors
    if (
      error instanceof Error && 
      (error.name === 'AbortError' || error.message === 'Database connection timeout')
    ) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Request timed out. Please try again.' 
        }),
        { 
          status: 504,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Generic error response
    return new NextResponse(
      JSON.stringify({ 
        success: false,
        error: 'Failed to create account' 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 