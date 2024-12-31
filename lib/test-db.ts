import { connectToDatabase } from './db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const { db } = await connectToDatabase();
    
    // Test images collection
    const imagesCollection = db.collection('images');
    const count = await imagesCollection.countDocuments();
    const sample = await imagesCollection.findOne();
    
    console.log('Database connection successful');
    console.log(`Found ${count} images`);
    console.log('Sample image:', sample ? {
      id: sample._id,
      prompt: sample.prompt,
      hasUrl: !!sample.imageUrl
    } : 'No images found');
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export { testConnection }; 