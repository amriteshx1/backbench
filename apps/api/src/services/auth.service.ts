import bcrypt from "bcryptjs";
import { signAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/app-error.js";
import { authRepository } from "../repositories/auth.repository.js";
import type { LoginInput, SignupInput } from "../schemas/auth.schema.js";
import type { AuthResponse } from "@backbench/shared";

export const authService = {
  async signup(input: SignupInput): Promise<AuthResponse> {
    const [emailExists, usernameExists] = await Promise.all([
      authRepository.findByEmail(input.email),
      authRepository.findByUsername(input.username),
    ]);

    if (emailExists) {
      throw new AppError(409, "Email already in use");
    }

    if (usernameExists) {
      throw new AppError(409, "Username already in use");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await authRepository.createUser({
      email: input.email,
      username: input.username,
      passwordHash,
    });

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await authRepository.findByEmailOrUsername(input.emailOrUsername);

    if (!user) {
      throw new AppError(401, "Invalid credentials");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);

    if (!valid) {
      throw new AppError(401, "Invalid credentials");
    }

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  },
};