/**
 * Custom API error class for handling API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Helper function to handle API errors
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return {
      error: error.message,
      statusCode: error.statusCode
    };
  }

  return {
    error: 'Internal server error',
    statusCode: 500
  };
}

/**
 * Helper function to validate required fields
 */
export function validateRequiredFields(data: any, fields: string[]) {
  for (const field of fields) {
    if (!data[field]) {
      throw new ApiError(`Missing required field: ${field}`, 400);
    }
  }
}

/**
 * Helper function to chunk base64 data into smaller pieces
 */
export function chunkBase64(base64Data: string, chunkSize: number = 1024 * 1024): string[] {
  const chunks: string[] = [];
  let index = 0;
  
  while (index < base64Data.length) {
    chunks.push(base64Data.slice(index, index + chunkSize));
    index += chunkSize;
  }
  
  return chunks;
} 