import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { canAccessWasherRoutes, resolveWasherUser } from '@/app/api/washer/utils';

type BulkAction = 'accept' | 'confirm' | 'cancel';

interface BulkUpdateResult {
  success: Array<{ id: string; status: string }>;
  failed: Array<{ id: string; reason: string }>;
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await resolveWasherUser(request);
    if (!auth) return unauthorizedResponse();
    if (!canAccessWasherRoutes(auth.role)) {
      return errorResponse('Access denied. Insufficient permissions.', 403);
    }

    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids.map(String) : [];
    const action = String(body?.action || '') as BulkAction;

    if (ids.length === 0) {
      return errorResponse('Missing or invalid required field: ids (must be a non-empty array)');
    }
    if (!['accept', 'confirm', 'cancel'].includes(action)) {
      return errorResponse('Missing or invalid required field: action (must be "accept", "confirm", or "cancel")');
    }

    const result: BulkUpdateResult = {
      success: [],
      failed: [],
    };

    for (const id of ids) {
      try {
        const job = await prisma.wash_jobs.findUnique({
          where: { id },
          include: {
            bookingSlot: {
              include: { booking: { select: { id: true, status: true } } },
            },
          },
        });
        if (!job) {
          result.failed.push({ id, reason: 'Booking not found' });
          continue;
        }

        if (job.bookingSlot.booking.status === 'CANCELLED' && action !== 'cancel') {
          result.failed.push({ id, reason: 'Cannot modify a cancelled booking' });
          continue;
        }

        if (action === 'accept') {
          if (job.status !== 'PENDING') {
            result.failed.push({ id, reason: `Cannot accept booking with status "${job.status}"` });
            continue;
          }
          await prisma.wash_jobs.update({
            where: { id },
            data: { status: 'ACCEPTED', washerId: auth.userId, acceptedAt: new Date() },
          });
          result.success.push({ id, status: 'ACCEPTED' });
          continue;
        }

        if (action === 'confirm') {
          if (job.status !== 'ACCEPTED') {
            result.failed.push({ id, reason: `Cannot complete booking with status "${job.status}"` });
            continue;
          }
          await prisma.wash_jobs.update({
            where: { id },
            data: { status: 'COMPLETED', washerId: auth.userId, completedAt: new Date() },
          });
          result.success.push({ id, status: 'COMPLETED' });
          continue;
        }

        await prisma.$transaction(async (tx) => {
          await tx.bookings.update({
            where: { id: job.bookingSlot.booking.id },
            data: { status: 'CANCELLED' },
          });
          await tx.booking_status_history.create({
            data: {
              bookingId: job.bookingSlot.booking.id,
              oldStatus: job.bookingSlot.booking.status,
              newStatus: 'CANCELLED',
              changedBy: auth.userId,
              note: 'Cancelled via washer bulk action',
            },
          });
        });
        result.success.push({ id, status: 'CANCELLED' });
      } catch (err) {
        result.failed.push({ id, reason: 'Database error occurred' });
      }
    }

    const message = `Bulk ${action} completed. ${result.success.length} succeeded, ${result.failed.length} failed.`;
    return successResponse(result, message);
  } catch (error) {
    console.error('Error in bulk booking update:', error);
    return serverErrorResponse('Failed to perform bulk booking update');
  }
}
