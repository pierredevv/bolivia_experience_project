import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        const response = exceptionResponse as any;
        message = response.message || message;
        errors = Array.isArray(response.message) ? response.message : undefined;
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message: errors ? "Validation error" : message,
        ...(errors && { details: errors }),
      },
      timestamp: new Date().toISOString(),
    });
  }
}
