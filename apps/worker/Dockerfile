FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache docker-cli

COPY package*.json ./
COPY tsconfig.json ./

COPY apps/api/package*.json ./apps/api/
COPY apps/worker/package*.json ./apps/worker/
COPY apps/web/package*.json ./apps/web/
COPY packages/config/package*.json ./packages/config/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/db/package*.json ./packages/db/

RUN npm ci

COPY packages/config ./packages/config
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY challenges ./challenges
COPY docker/runner-images ./docker/runner-images
COPY apps/worker ./apps/worker

RUN npm run build -w @backbench/config || true
RUN npm run build -w @backbench/shared || true
RUN npm run build -w @backbench/db || true
RUN npm run build -w @backbench/worker

EXPOSE 4001

CMD ["npm", "run", "start", "-w", "@backbench/worker"]