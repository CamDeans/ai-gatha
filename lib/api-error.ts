export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        status: this.statusCode
      }
    };
  }
} 