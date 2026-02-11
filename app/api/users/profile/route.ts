import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, hashPassword, verifyPassword } from '@/lib/auth';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { extractRoles, getPrimaryRole, toLegacyRole } from '@/lib/user-roles';
import { getProfile, updateProfile } from '@/lib/profile';

async function getCurrentUser(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) {
    const profile = await getProfile(authUser.userId);
    if (profile) return profile;
  }
  if (authUser.email) {
    const byEmail = await prisma.users.findUnique({
      where: { email: authUser.email.toLowerCase() },
      select: { id: true },
    });
    if (!byEmail) return null;
    return getProfile(byEmail.id);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const user = await getCurrentUser(authUser);
    if (!user) return unauthorizedResponse('User not found');

    return successResponse({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      contactNo: user.phone,
      nic: user.nic,
      residentialAddress: user.residentialAddress,
      vehicleNumber: user.vehicles[0]?.vehicleNumber || null,
      vehicle: user.vehicles[0]
        ? {
            vehicleNumber: user.vehicles[0].vehicleNumber,
            type: user.vehicles[0].type,
            model: user.vehicles[0].model,
            color: user.vehicles[0].color,
          }
        : null,
      role: toLegacyRole(getPrimaryRole(extractRoles(user))),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return serverErrorResponse('Failed to fetch profile');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const body = await request.json();
    const fullName = body?.fullName;
    const contactNo = body?.contactNo ?? body?.phone;
    const nic = body?.nic;
    const residentialAddress = body?.residentialAddress ?? body?.address;

    const existingUser = await getCurrentUser(authUser);
    if (!existingUser) return unauthorizedResponse('User not found');

    const updated = await updateProfile(
      existingUser.id,
      {
        fullName,
        phone: contactNo,
        nic,
        residentialAddress,
      },
      {
        vehicleNumber: body?.vehicleNumber ?? body?.vehicle_number,
        type: body?.vehicleType ?? body?.type,
        model: body?.vehicleModel ?? body?.model,
        color: body?.vehicleColor ?? body?.color,
      }
    );

    return successResponse(
      {
        id: updated?.id,
        email: updated?.email,
        fullName: updated?.fullName,
        contactNo: updated?.phone,
        nic: updated?.nic,
        residentialAddress: updated?.residentialAddress,
        vehicleNumber: updated?.vehicles[0]?.vehicleNumber || null,
        vehicle: updated?.vehicles[0]
          ? {
              vehicleNumber: updated.vehicles[0].vehicleNumber,
              type: updated.vehicles[0].type,
              model: updated.vehicles[0].model,
              color: updated.vehicles[0].color,
            }
          : null,
      },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return serverErrorResponse('Failed to update profile');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const body = await request.json();
    const currentPassword = String(body?.currentPassword || '');
    const newPassword = String(body?.newPassword || '');

    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required');
    }
    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters');
    }

    const user = await getCurrentUser(authUser);
    if (!user) return unauthorizedResponse('User not found');

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return successResponse(null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return serverErrorResponse('Failed to change password');
  }
}
