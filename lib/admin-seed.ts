import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

const globalForAdminSeed = globalThis as unknown as {
  __adminSeeded?: boolean;
};

export async function ensureAdminSeeded() {
  if (globalForAdminSeed.__adminSeeded) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  if (!existing) {
    const hashedPassword = await hashPassword(password);
    await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName: 'Admin',
        role: 'ADMIN',
        updatedAt: new Date(),
      },
    });
  }

  globalForAdminSeed.__adminSeeded = true;
}
