import { NextResponse } from 'next/server';

/**
 * Standard API Response Interface
 * Ensures consistency between the Backend and Frontend.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Returns a 200 OK success response.
 * Used for general data retrieval and successful operations.
 */
export function successResponse<T>(
  data: T,
  message: string = 'Success',
  status: number = 200,
  headers?: HeadersInit
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
    },
    { status, headers }
  );
}

/**
 * Returns a 400 Bad Request response.
 * Used for validation errors or invalid user input.
 */
export function errorResponse(message: string, status: number = 400, headers?: HeadersInit) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      message, // Using message instead of error for frontend consistency
      error: message,
    },
    { status, headers }
  );
}

/**
 * Returns a 201 Created response.
 * Used after successful user registration (Sign-up).
 */
export function createdResponse<T>(data: T, message: string = 'Created successfully') {
  return successResponse(data, message, 201);
}

/**
 * Returns a 401 Unauthorized response.
 * This resolves the status seen in your console for /api/auth/me.
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401);
}

/**
 * Returns a 404 Not Found response.
 * Used when a user or resource does not exist in the database.
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return errorResponse(message, 404);
}

/**
 * Returns a 500 Internal Server Error response.
 * Used when a database crash or code error occurs.
 */
export function serverErrorResponse(message: string = 'Internal server error') {
  return errorResponse(message, 500);
}
