/**
 * AWS S3 Storage Configuration
 * Handles image upload and retrieval
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  base64Image: string,
  key: string
): Promise<string> {
  const buffer = Buffer.from(base64Image, 'base64');
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'private',
    })
  );

  // Generate a signed URL that expires in 1 hour
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 3600 }
  );

  return url;
} 