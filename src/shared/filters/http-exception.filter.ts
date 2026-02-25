/**
 * HTTP Exception Filter
 * Handles HTTP exceptions specifically
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message
          : exceptionResponse,
    };

    this.logger.warn(`HTTP ${status} Error: ${JSON.stringify(errorResponse)}`);

    response.status(status).json(errorResponse);
  }
}
