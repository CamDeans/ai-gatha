/**
 * API Route for user registration
 * Handles new user creation with password hashing
 */
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('deansight');

    // Check if user already exists
    const existingUser = await db
      .collection('users')
      .findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    const result = await db
      .collection('users')
      .insertOne({
        email,
        password: hashedPassword,
        name: name || null,
        createdAt: new Date(),
      });

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 