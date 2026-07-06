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

COPY apps/web ./apps/web

ENV NEXT_PUBLIC_API_URL=http://localhost:4000

RUN npm run build -w @backbench/web

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "@backbench/web"]