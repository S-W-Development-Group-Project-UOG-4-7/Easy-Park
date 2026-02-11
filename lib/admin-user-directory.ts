import { RoleName } from '@prisma/client';
import prisma from '@/lib/prisma';

export type AdminDirectoryUser = {
  id: string;
  fullName: string;
  email: string;
  role: RoleName | null;
  phone: string | null;
  nic: string | null;
  residentialAddress: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function mapDirectoryUser(user: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  nic: string | null;
  residentialAddress: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    role: {
      name: RoleName;
    };
  }>;
}): AdminDirectoryUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.roles[0]?.role.name ?? null,
    phone: user.phone,
    nic: user.nic,
    residentialAddress: user.residentialAddress,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function listUsersByRoleNames(roleNames: RoleName[]): Promise<AdminDirectoryUser[]> {
  const users = await prisma.users.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: { in: roleNames },
          },
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      nic: true,
      residentialAddress: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        where: {
          role: {
            name: { in: roleNames },
          },
        },
        orderBy: {
          roleId: 'asc',
        },
        take: 1,
        select: {
          role: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map(mapDirectoryUser).filter((user) => user.role !== null);
}

export async function getUserByIdWithPrimaryRole(userId: string) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      nic: true,
      residentialAddress: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        orderBy: {
          roleId: 'asc',
        },
        take: 1,
        select: {
          role: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user) return null;
  return mapDirectoryUser(user);
}
