import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { RoleName } from '@prisma/client';

const globalForAdminSeed = globalThis as unknown as {
  __adminSeeded?: boolean;
};

export async function ensureAdminSeeded() {
  if (globalForAdminSeed.__adminSeeded) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const adminRole = await prisma.roles.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN },
    select: { id: true },
  });

  const existing = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  let adminUserId = existing?.id;
  if (!adminUserId) {
    const hashedPassword = await hashPassword(password);
    const created = await prisma.users.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        fullName: 'System Admin',
      },
      select: { id: true },
    });
    adminUserId = created.id;
  }

  await prisma.user_roles.upsert({
    where: {
      userId_roleId: {
        userId: adminUserId,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUserId,
      roleId: adminRole.id,
    },
  });

  globalForAdminSeed.__adminSeeded = true;
}
