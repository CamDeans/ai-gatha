import clientPromise from './mongodb';

export async function debugDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('deansight');

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Check images collection
    const imagesCount = await db.collection('images').countDocuments();
    const sampleImage = await db.collection('images').findOne({});
    
    console.log('Database debug info:', {
      imagesCount,
      sampleImageFields: sampleImage ? Object.keys(sampleImage) : null,
      sampleImageId: sampleImage?._id,
      hasImageData: sampleImage?.imageData ? 'yes' : 'no',
      imageDataLength: sampleImage?.imageData?.length
    });

    return {
      success: true,
      collectionsCount: collections.length,
      imagesCount,
      sampleImage: sampleImage ? {
        id: sampleImage._id,
        hasData: !!sampleImage.imageData,
        fields: Object.keys(sampleImage)
      } : null
    };
  } catch (error) {
    console.error('Database debug error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 