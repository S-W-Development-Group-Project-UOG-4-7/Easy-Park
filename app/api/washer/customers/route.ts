import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

/**
 * GET /api/washer/customers
 * Fetch all washer customers with optional search
 * 
 * Query Parameters:
 * - search: Search by name, email, or phone
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can access customer data
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Build where clause
    const whereClause: any = {};

    // Search filter
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const customers = await prisma.washerCustomer.findMany({
      where: whereClause,
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Include only recent bookings
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(customers, 'Customers retrieved successfully');
  } catch (error) {
    console.error('Error fetching washer customers:', error);
    return serverErrorResponse('Failed to fetch washer customers');
  }
}

/**
 * POST /api/washer/customers
 * Create a new washer customer
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Only WASHER, ADMIN, and COUNTER roles can create customers
    if (!['WASHER', 'ADMIN', 'COUNTER'].includes(authUser.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const body = await request.json();
    const { name, email, phone, vehicleDetails, otherRelevantInfo } = body;

    // Validate required fields
    if (!name || !email || !phone || !vehicleDetails) {
      return errorResponse('Missing required fields: name, email, phone, vehicleDetails');
    }

    // Check if customer with same email already exists
    const existingCustomer = await prisma.washerCustomer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return errorResponse('A customer with this email already exists', 409);
    }

    // Create the customer
    const customer = await prisma.washerCustomer.create({
      data: {
        name,
        email,
        phone,
        vehicleDetails,
        otherRelevantInfo,
      },
    });

    return createdResponse(customer, 'Customer created successfully');
  } catch (error) {
    console.error('Error creating washer customer:', error);
    return serverErrorResponse('Failed to create washer customer');
  }
}
