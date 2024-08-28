/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-explicit-any */
class ApiError extends Error {
  statusCode: number;
  data?: any;
  success: boolean;
  errors: any[];
  
  constructor(
    statusCode: number,
    message: string,
    errors: any[] = [],
    data?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
    this.success = false;
    this.errors = errors;
  
    // Capture the stack trace in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
  
export default ApiError;
  