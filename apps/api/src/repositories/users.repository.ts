import { prisma } from "@backbench/db";
import type { UpdateProfileInput } from "../schemas/users.schema.js";

export const usersRepository = {
  getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const { avatarUrl, ...profileInput } = input;

    await prisma.$transaction(async (tx) => {
      if (avatarUrl !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { avatarUrl },
        });
      }

      await tx.profile.update({
        where: { userId },
        data: profileInput,
      });
    });

    return this.getMe(userId);
  },
};