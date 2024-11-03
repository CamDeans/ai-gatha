/**
 * API Route for user registration
 * Handles new user creation with password hashing
 */
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

// Shorter timeout for individual operations
const OPERATION_TIMEOUT = 5000; // 5 seconds

export async function POST(req: Request) {
  let client: MongoClient | null = null;

  try {
    // Parse request body first
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Connect to MongoDB
    try {
      client = await Promise.race([
        clientPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), OPERATION_TIMEOUT)
        )
      ]) as MongoClient;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Service temporarily unavailable' 
      }, { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = client.db('deansight');
    const usersCollection = db.collection('users');

    // Check for existing user - with shorter timeout
    const existingUser = await Promise.race([
      usersCollection.findOne({ email: email.toLowerCase() }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), OPERATION_TIMEOUT)
      )
    ]);

    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        error: 'Email already registered' 
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password with lower cost for speed
    const hashedPassword = await hash(password, 8); // Reduced from 10 to 8 for speed

    // Create user - with shorter timeout
    await Promise.race([
      usersCollection.insertOne({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        createdAt: new Date(),
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), OPERATION_TIMEOUT)
      )
    ]);

    return NextResponse.json({ 
      success: true,
      message: 'Account created successfully' 
    }, { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error) {
      // Handle timeout errors
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          success: false,
          error: 'Service is busy. Please try again.' 
        }, { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Generic error response
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create account' 
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 