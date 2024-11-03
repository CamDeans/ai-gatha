/**
 * API Route for user registration
 * Handles new user creation with password hashing
 */
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { ApiError } from '@/lib/api-error';
import { MongoClient } from 'mongodb';

const MONGODB_TIMEOUT = 30000; // Increase timeout to 30 seconds for production

export async function POST(req: Request) {
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    // Parse request body first to fail fast if invalid
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields' 
      }, { 
        status: 400 
      });
    }

    // Set up timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Operation timed out'));
      }, MONGODB_TIMEOUT);
    });

    // Connect to MongoDB with timeout
    const client = await Promise.race([
      clientPromise,
      timeoutPromise
    ]) as MongoClient;

    const db = client.db('deansight');

    // Check for existing user
    const existingUser = await db
      .collection('users')
      .findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Email already registered' 
      }, { 
        status: 400 
      });
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    await db.collection('users').insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Account created successfully' 
    }, { 
      status: 201 
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Clear timeout if it exists
    if (timeoutId) clearTimeout(timeoutId);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message === 'Operation timed out') {
        return NextResponse.json({ 
          success: false,
          error: 'Request timed out. Please try again.' 
        }, { 
          status: 504 
        });
      }

      return NextResponse.json({ 
        success: false,
        error: 'Failed to create account' 
      }, { 
        status: 500 
      });
    }

    return NextResponse.json({ 
      success: false,
      error: 'An unexpected error occurred' 
    }, { 
      status: 500 
    });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
} 