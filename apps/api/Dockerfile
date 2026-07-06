FROM node:20-alpine

WORKDIR /app

# Copy root configurations and manifests
COPY package*.json ./
COPY tsconfig.json ./

# Copy all workspaces manifests to resolve links
COPY apps/api/package*.json ./apps/api/
COPY apps/worker/package*.json ./apps/worker/
COPY apps/web/package*.json ./apps/web/
COPY packages/config/package*.json ./packages/config/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/db/package*.json ./packages/db/
COPY packages/challenge-registry/package*.json ./packages/challenge-registry/

# Install dependencies at root
RUN npm ci

# Copy actual source code
COPY packages/config ./packages/config
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY packages/challenge-registry ./packages/challenge-registry
COPY apps/api ./apps/api

# Build shared layers first, then the API
RUN npm run build -w @backbench/config || true
RUN npm run build -w @backbench/shared || true
RUN npm run build -w @backbench/db || true
RUN npm run build -w @backbench/challenge-registry || true
RUN npm run build -w @backbench/api

EXPOSE 4000

CMD ["npm", "run", "start", "-w", "@backbench/api"]