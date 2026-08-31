import { AppError } from "../lib/app-error.js";
import { usersRepository } from "../repositories/users.repository.js";
import type { UpdateProfileInput } from "../schemas/users.schema.js";
import type { MeResponse } from "@backbench/shared";

export const usersService = {
  async getMe(userId: string): Promise<MeResponse> {
    const user = await usersRepository.getMe(userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            bio: user.profile.bio,
            githubUrl: user.profile.githubUrl,
            solvedCount: user.profile.solvedCount,
          }
        : null,
    };
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<MeResponse> {
    const user = await usersRepository.updateProfile(userId, input);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      profile: user.profile
        ? {
            displayName: user.profile.displayName,
            bio: user.profile.bio,
            githubUrl: user.profile.githubUrl,
            solvedCount: user.profile.solvedCount,
          }
        : null,
    };
  },
};