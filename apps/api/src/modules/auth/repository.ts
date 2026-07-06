import { prisma } from "@backbench/db";

export const authRepository = {
  findByEmailOrUsername(emailOrUsername: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
      include: { profile: true },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  createUser(input: { email: string; username: string; passwordHash: string }) {
    return prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash: input.passwordHash,
        profile: { create: {} },
      },
      include: { profile: true },
    });
  },
};