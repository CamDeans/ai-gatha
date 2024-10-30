/**
 * Type declarations for environment variables
 * Ensures type safety when accessing process.env
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      NODE_ENV: 'development' | 'production';
      RUNPOD_API_KEY: string;
      RUNPOD_ENDPOINT_ID: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      S3_BUCKET_NAME: string;
    }
  }
}

export {} 