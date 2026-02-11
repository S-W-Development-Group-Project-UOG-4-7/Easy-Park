import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { extractRoles, normalizeRole, type RoleValue } from '@/lib/user-roles';

export type CounterAccess = {
  userId: string;
  email: string;
  roles: RoleValue[];
  isAdmin: boolean;
  isCounter: boolean;
};

export async function resolveCounterAccess(request: NextRequest): Promise<CounterAccess | null> {
  const authUser = getAuthUser(request);
  if (!authUser) return null;

  const user = authUser.userId
    ? await prisma.users.findUnique({
        where: { id: authUser.userId },
        include: { roles: { include: { role: true } } },
      })
    : authUser.email
      ? await prisma.users.findUnique({
          where: { email: authUser.email.toLowerCase() },
          include: { roles: { include: { role: true } } },
        })
      : null;

  if (!user) return null;

  const roleSet = new Set<RoleValue>(extractRoles(user));
  const tokenRole = normalizeRole(authUser.role);
  if (tokenRole) roleSet.add(tokenRole);

  const isAdmin = roleSet.has('ADMIN');
  const isCounter = roleSet.has('COUNTER');
  if (!isAdmin && !isCounter) return null;

  return {
    userId: user.id,
    email: user.email,
    roles: Array.from(roleSet),
    isAdmin,
    isCounter,
  };
}
