'use client'

import { useEffect, useState } from 'react'

interface TestImage {
  _id: string;
  prompt: string;
  imageUrl: string;
}

export default function TestGallery() {
  const [data, setData] = useState<{
    success: boolean;
    message: string;
    images?: TestImage[];
  }>({
    success: false,
    message: 'Loading...'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching data...');
        const response = await fetch('/api/gallery/test');
        const result = await response.json();
        console.log('Received data:', result);
        setData({
          success: true,
          message: 'Data loaded',
          images: result
        });
      } catch (error) {
        console.error('Error:', error);
        setData({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to load data'
        });
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Gallery Test Page</h1>
      <div className="mb-4">
        <strong>Status: </strong>
        <span className={data.success ? 'text-green-600' : 'text-red-600'}>
          {data.message}
        </span>
      </div>
      {data.images && (
        <div className="grid grid-cols-1 gap-4">
          {data.images.map(image => (
            <div key={image._id} className="border p-4 rounded">
              <p><strong>ID:</strong> {image._id}</p>
              <p><strong>Prompt:</strong> {image.prompt}</p>
              <p><strong>URL:</strong> {image.imageUrl}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 