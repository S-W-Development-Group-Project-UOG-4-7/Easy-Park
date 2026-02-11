import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { mapUserForClient } from '@/lib/user-roles';
import { getProfile, updateProfile } from '@/lib/profile';

async function resolveUser(authUser: { email?: string; userId?: string }) {
  if (authUser.userId) {
    const byId = await getProfile(authUser.userId);
    if (byId) return byId;
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
    if (!authUser) return NextResponse.json({ success: false }, { status: 401 });

    const user = await resolveUser(authUser);
    if (!user) return NextResponse.json({ success: false }, { status: 401 });

    const profile = await getProfile(user.id);
    return NextResponse.json({ success: true, data: profile ? mapUserForClient(profile) : null });
  } catch (error) {
    console.error('Customer profile GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return NextResponse.json({ success: false }, { status: 401 });

    const user = await resolveUser(authUser);
    if (!user) return NextResponse.json({ success: false }, { status: 401 });

    const body = await request.json();
    const fullName = body?.fullName;
    const contactNo = body?.contactNo ?? body?.phone;
    const residentialAddress = body?.residentialAddress ?? body?.address;
    const nic = body?.nic;
    const updated = await updateProfile(
      user.id,
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

    return NextResponse.json({ success: true, data: updated ? mapUserForClient(updated) : null });
  } catch (error) {
    console.error('Customer profile PUT error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    const status = message.includes('Vehicle number is required') ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
