import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDatabase from '@/lib/mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid ID' 
      }, { 
        status: 400 
      });
    }

    const client = await connectToDatabase();
    const db = client.db('deansight');
    
    const result = await db.collection('images').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image not found' 
      }, { 
        status: 404 
      });
    }

    return NextResponse.json({ 
      success: true 
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete image' 
    }, { 
      status: 500 
    });
  }
} 