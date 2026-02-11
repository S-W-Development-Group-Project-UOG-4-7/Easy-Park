import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { RoleName } from '@prisma/client';

export type RoleValue = `${RoleName}`;

export const DEFAULT_ROLE_PRIORITY: RoleValue[] = [
  'ADMIN',
  'LANDOWNER',
  'COUNTER',
  'WASHER',
  'CUSTOMER',
];

export function normalizeRole(value: unknown): RoleValue | null {
  const raw = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (raw === 'LAND_OWNER') return 'LANDOWNER';
  if (raw === 'LANDOWNER') return 'LANDOWNER';
  if (raw === 'ADMIN' || raw === 'CUSTOMER' || raw === 'WASHER' || raw === 'COUNTER') {
    return raw as RoleValue;
  }
  return null;
}

export function toLegacyRole(role: RoleValue): string {
  return role === 'LANDOWNER' ? 'LAND_OWNER' : role;
}

export function getPrimaryRole(roles: RoleValue[]): RoleValue {
  for (const role of DEFAULT_ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return 'CUSTOMER';
}

export function hasAnyRole(roles: RoleValue[], required: RoleValue[]) {
  return required.some((role) => roles.includes(role));
}

export async function ensureRoleRecord(role: RoleValue) {
  return prisma.roles.upsert({
    where: { name: role as RoleName },
    update: {},
    create: { name: role as RoleName },
    select: { id: true, name: true },
  });
}

export async function assignRoleToUser(userId: string, role: RoleValue) {
  const roleRecord = await ensureRoleRecord(role);
  await prisma.user_roles.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: roleRecord.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: roleRecord.id,
    },
  });
}

export async function getUserWithRolesById(userId: string) {
  return prisma.users.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      vehicles: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
}

export async function getUserWithRolesByEmail(email: string) {
  return prisma.users.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      vehicles: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
}

export function extractRoles(user: {
  roles: Array<{ role: { name: RoleName } }>;
}): RoleValue[] {
  return user.roles.map((entry) => entry.role.name as RoleValue);
}

export function mapUserForClient(user: {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  nic: string | null;
  residentialAddress: string | null;
  createdAt: Date;
  roles: Array<{ role: { name: RoleName } }>;
  vehicles: Array<{
    vehicleNumber: string;
    type: string | null;
    model: string | null;
    color: string | null;
  }>;
}) {
  const roles = extractRoles(user);
  const primaryRole = getPrimaryRole(roles);
  const firstVehicle = user.vehicles[0];
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    contactNo: user.phone,
    phone: user.phone,
    nic: user.nic,
    address: user.residentialAddress,
    residentialAddress: user.residentialAddress,
    role: toLegacyRole(primaryRole),
    roles: roles.map(toLegacyRole),
    vehicleNumber: firstVehicle?.vehicleNumber || null,
    vehicle: firstVehicle
      ? {
          registrationNumber: firstVehicle.vehicleNumber,
          type: firstVehicle.type,
          model: firstVehicle.model,
          color: firstVehicle.color,
        }
      : null,
    createdAt: user.createdAt,
  };
}

export async function getRequestUserWithRoles(request: NextRequest) {
  const tokenUser = getAuthUser(request);
  if (!tokenUser) return null;
  if (tokenUser.userId) {
    const byId = await getUserWithRolesById(tokenUser.userId);
    if (byId) return byId;
  }
  if (tokenUser.email) {
    return getUserWithRolesByEmail(tokenUser.email);
  }
  return null;
}
