/**
 * API Route for user registration
 * Handles new user creation with password hashing
 */
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

// Reduce timeout to match Vercel's limits
const MONGODB_TIMEOUT = 8000; // 8 seconds

export async function POST(req: Request) {
  try {
    // Parse request body
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

    // Get MongoDB client - with a shorter timeout
    let client: MongoClient;
    try {
      client = await clientPromise;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Database connection failed' 
      }, { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = client.db('deansight');

    // Check for existing user with timeout
    const existingUser = await Promise.race([
      db.collection('users').findOne({ email: email.toLowerCase() }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timeout')), MONGODB_TIMEOUT)
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

    // Hash password with a lower cost factor for faster processing
    const hashedPassword = await hash(password, 10); // Reduced from 12 to 10

    // Create user with timeout
    await Promise.race([
      db.collection('users').insertOne({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        createdAt: new Date(),
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database operation timeout')), MONGODB_TIMEOUT)
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

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          success: false,
          error: 'Operation timed out. Please try again.' 
        }, { 
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return NextResponse.json({ 
      success: false,
      error: 'Failed to create account' 
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 