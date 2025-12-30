import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const response = successResponse(null, 'Signed out successfully');
  
  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
