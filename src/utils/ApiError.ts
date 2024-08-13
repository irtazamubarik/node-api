class ApiError extends Error {
  statusCode: number;
  type: 'info' | 'warn' | 'error' | 'debug' | 'critical';
  isOperational = false;

  constructor(
    statusCode: number,
    message: string,
    type: 'info' | 'warn' | 'error' | 'debug' | 'critical' = 'info',
    isOperational = true,
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export default ApiError;
