export class ApiResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private data: any;
  public message: string;
  private success: boolean;
  private statusCode: number;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string = 'Success', data: any = null, statusCode: number = 200) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode >= 200 && statusCode < 300;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  toJSON(): object {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      statusCode: this.statusCode,
    };
  }
}

export class ApiError extends Error {
  private statusCode: number;
  private data: null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private errors: any[];
  stack: string = '';
  message: string;

  constructor(
    statusCode: number = 500,
    message: string = 'Something went wrong',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any[] = [],
    stack: string = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = null;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  toJSON(): object {
    return {
      success: false,
      message: this.message,
      errors: this.errors,
      data: this.data,
      statusCode: this.statusCode,
    };
  }
}
