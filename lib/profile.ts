import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

const PROFILE_INCLUDE = {
  roles: { include: { role: true } },
  vehicles: { orderBy: { createdAt: 'desc' }, take: 1 },
} satisfies Prisma.usersInclude;

export type ProfileUserFields = {
  fullName?: unknown;
  phone?: unknown;
  nic?: unknown;
  residentialAddress?: unknown;
};

export type ProfileVehicleFields = {
  vehicleNumber?: unknown;
  type?: unknown;
  model?: unknown;
  color?: unknown;
};

function toNullableText(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

export async function getProfile(userId: string) {
  return prisma.users.findUnique({
    where: { id: userId },
    include: PROFILE_INCLUDE,
  });
}

export async function updateProfile(
  userId: string,
  userFields: ProfileUserFields,
  vehicleFields: ProfileVehicleFields
) {
  const hasUserField =
    userFields.fullName !== undefined ||
    userFields.phone !== undefined ||
    userFields.nic !== undefined ||
    userFields.residentialAddress !== undefined;

  const hasVehicleField =
    vehicleFields.vehicleNumber !== undefined ||
    vehicleFields.type !== undefined ||
    vehicleFields.model !== undefined ||
    vehicleFields.color !== undefined;

  await prisma.$transaction(async (tx) => {
    if (hasUserField) {
      await tx.users.update({
        where: { id: userId },
        data: {
          ...(userFields.fullName !== undefined ? { fullName: String(userFields.fullName) } : {}),
          ...(userFields.phone !== undefined ? { phone: toNullableText(userFields.phone) } : {}),
          ...(userFields.nic !== undefined ? { nic: toNullableText(userFields.nic) } : {}),
          ...(userFields.residentialAddress !== undefined
            ? { residentialAddress: toNullableText(userFields.residentialAddress) }
            : {}),
        },
      });
    }

    if (hasVehicleField) {
      const vehicleNumber = toNullableText(vehicleFields.vehicleNumber);
      const type = toNullableText(vehicleFields.type);
      const model = toNullableText(vehicleFields.model);
      const color = toNullableText(vehicleFields.color);

      const hasAnyVehicleData = Boolean(vehicleNumber || type || model || color);

      const existingVehicle = await tx.vehicles.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (!hasAnyVehicleData) {
        if (existingVehicle) {
          await tx.vehicles.delete({ where: { id: existingVehicle.id } });
        }
        return;
      }

      if (!vehicleNumber) {
        throw new Error('Vehicle number is required when saving vehicle details');
      }

      await tx.vehicles.upsert({
        where: { id: existingVehicle?.id ?? randomUUID() },
        update: {
          vehicleNumber,
          type,
          model,
          color,
        },
        create: {
          userId,
          vehicleNumber,
          type,
          model,
          color,
        },
      });
    }
  });

  return getProfile(userId);
}
