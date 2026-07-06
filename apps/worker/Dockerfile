FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

COPY apps/api/package*.json ./apps/api/
COPY apps/worker/package*.json ./apps/worker/
COPY apps/web/package*.json ./apps/web/
COPY packages/config/package*.json ./packages/config/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci

COPY packages/config ./packages/config
COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

RUN npm run build -w @backbench/config || true
RUN npm run build -w @backbench/shared || true
RUN npm run build -w @backbench/worker

EXPOSE 4001

CMD ["npm", "run", "start", "-w", "@backbench/worker"]