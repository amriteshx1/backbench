import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import type { AuthUser, SubmissionRealtimeEvent } from "@backbench/shared";
import { verifyAccessToken } from "../lib/jwt.js";

let io: SocketIOServer | null = null;

function extractToken(input: string | undefined): string | null {
  if (!input) return null;
  if (input.startsWith("Bearer ")) {
    return input.slice("Bearer ".length).trim();
  }
  return input.trim();
}

function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function initializeRealtimeServer(httpServer: HttpServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    try {
      const authToken = socket.handshake.auth?.token as string | undefined;
      const headerToken = socket.handshake.headers.authorization;
      const token = extractToken(authToken) ?? extractToken(headerToken);
      if (!token) {
        return next(new Error("Missing realtime token"));
      }

      const authUser = verifyAccessToken(token) as AuthUser;
      socket.data.authUser = authUser;
      return next();
    } catch {
      return next(new Error("Invalid realtime token"));
    }
  });

  io.on("connection", (socket) => {
    const authUser = socket.data.authUser as AuthUser | undefined;
    if (!authUser) {
      socket.disconnect();
      return;
    }

    socket.join(userRoom(authUser.userId));
  });

  return io;
}

export function emitSubmissionRealtimeEvent(event: SubmissionRealtimeEvent): void {
  if (!io) return;
  io.to(userRoom(event.userId)).emit(event.event, event);
}
