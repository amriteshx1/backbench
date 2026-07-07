#!/usr/bin/env node
/**
 * Generates the Backbench challenge catalog (44 new + skips existing).
 * Run: node scripts/generate-challenge-catalog.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CHALLENGES_ROOT = path.join(ROOT, "challenges");

const STANDARD_PACKAGE_JSON = {
  name: "challenge-template",
  private: true,
  type: "module",
  scripts: { dev: "tsx watch src/server.ts" },
  dependencies: { express: "^5.1.0" },
  devDependencies: {
    "@types/express": "^5.0.3",
    tsx: "^4.20.5",
    typescript: "^5.9.2",
  },
};

function serverTs(importPath, mountPath) {
  return `import express from "express";
import { router } from "${importPath}";

const app = express();
app.use(express.json());
app.use("${mountPath}", router);

app.listen(3001, () => {
  console.log("Challenge template server running on http://localhost:3001");
});
`;
}

function evaluateMjs(targetFile, checks) {
  const checkBlocks = checks
    .map((check) => {
      if (check.type === "no_todo") {
        return `    {
      id: "${check.id}",
      passed: !content.toLowerCase().includes("todo"),
      message: "Solution should not contain TODO markers.",
    }`;
      }
      return `    {
      id: "${check.id}",
      passed: hasRegex(content, /${check.pattern}/s),
      message: "${check.message.replace(/"/g, '\\"')}",
    }`;
    })
    .join(",\n");

  return `import fs from "node:fs/promises";

function hasRegex(content, regex) {
  return regex.test(content);
}

async function main() {
  const targetPath = "${targetFile}";
  const content = await fs.readFile(targetPath, "utf8");

  const checks = [
${checkBlocks}
  ];

  const passedTests = checks.filter((check) => check.passed).length;
  const totalTests = checks.length;
  const failedChecks = checks.filter((check) => !check.passed);
  const status = passedTests === totalTests ? "PASSED" : "FAILED";
  const score = Math.round((passedTests / totalTests) * 100);

  const result = {
    status,
    score,
    passedTests,
    totalTests,
    errorType: status === "FAILED" ? "ASSERTION_FAILED" : null,
    errorMessage:
      status === "FAILED"
        ? \`Failed checks: \${failedChecks.map((check) => check.id).join(", ")}\`
        : null,
    testResultsJson: { checks },
    durationMs: 40,
    memoryMb: 16,
  };

  console.log(\`RESULT_JSON:\${JSON.stringify(result)}\`);
}

main().catch((error) => {
  const result = {
    status: "ERROR",
    score: 0,
    passedTests: 0,
    totalTests: 0,
    errorType: "HIDDEN_TEST_RUNTIME_ERROR",
    errorMessage: error instanceof Error ? error.message : "Unknown hidden test error",
    testResultsJson: null,
    durationMs: null,
    memoryMb: null,
  };
  console.error("Hidden test runtime error:", error);
  console.log(\`RESULT_JSON:\${JSON.stringify(result)}\`);
  process.exitCode = 0;
});
`;
}

/** @type {Array<Record<string, unknown>>} */
const CHALLENGES = [
  // ── EASY (14 new, orderIndex 2–15) ──────────────────────────────────────
  {
    slug: "express-user-login",
    title: "Build User Login Endpoint",
    difficulty: "easy",
    category: "express-api",
    description: "Implement POST /auth/login with credential validation and 401 on failure.",
    tags: ["express", "auth", "http"],
    orderIndex: 2,
    mount: "/auth",
    import: "./auth.routes.js",
    file: "src/auth.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Build User Login Endpoint

Implement \`POST /auth/login\`.

## Requirements
- Accept JSON: \`email\`, \`password\`
- Return \`400\` if fields missing
- Return \`401\` for invalid credentials
- Return \`200\` with \`{ token: "..." }\` on success
- Use in-memory users array for lookup`,
    starter: `import { Router } from "express";

type User = { email: string; password: string };
const users: User[] = [{ email: "demo@backbench.dev", password: "secret123" }];
export const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  // TODO: validate input, check credentials, return 401 or 200 with token
  return res.status(200).json({ token: "placeholder" });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "returns_401", type: "regex", pattern: "status\\(\\s*401\\s*\\)", message: "Expected HTTP 401 for invalid credentials." },
      { id: "checks_password", type: "regex", pattern: "password", message: "Expected password comparison in login logic." },
    ],
  },
  {
    slug: "express-health-check",
    title: "Add Health Check Endpoint",
    difficulty: "easy",
    category: "express-api",
    description: "Implement GET /health returning service status JSON.",
    tags: ["express", "observability"],
    orderIndex: 3,
    mount: "/",
    import: "./health.routes.js",
    file: "src/health.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Add Health Check Endpoint

Implement \`GET /health\`.

## Requirements
- Return \`200\` with \`{ status: "ok", uptimeSeconds: number }\`
- \`uptimeSeconds\` should reflect process uptime`,
    starter: `import { Router } from "express";
export const router = Router();

router.get("/health", (_req, res) => {
  // TODO: return status ok and uptimeSeconds from process.uptime()
  return res.status(500).json({ status: "broken" });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "status_ok", type: "regex", pattern: 'status:\\s*"ok"', message: 'Expected status: "ok" in response.' },
      { id: "uses_uptime", type: "regex", pattern: "process\\.uptime\\(\\)", message: "Expected process.uptime() usage." },
    ],
  },
  {
    slug: "express-query-filter",
    title: "Filter Items By Query Parameter",
    difficulty: "easy",
    category: "express-api",
    description: "Implement GET /items?category= filtering on an in-memory list.",
    tags: ["express", "query-params"],
    orderIndex: 4,
    mount: "/",
    import: "./items.routes.js",
    file: "src/items.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Filter Items By Query Parameter

Implement \`GET /items\`.

## Requirements
- Return all items when no query param
- When \`?category=\` is provided, filter by category
- Return \`200\` with JSON array`,
    starter: `import { Router } from "express";
const items = [
  { id: "1", name: "Keyboard", category: "hardware" },
  { id: "2", name: "VS Code", category: "software" },
];
export const router = Router();

router.get("/items", (req, res) => {
  // TODO: filter by req.query.category when present
  return res.status(200).json(items);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_query", type: "regex", pattern: "req\\.query\\.category", message: "Expected req.query.category usage." },
      { id: "uses_filter", type: "regex", pattern: "\\.filter\\(", message: "Expected array filter for category." },
    ],
  },
  {
    slug: "express-path-param",
    title: "Fetch Resource By Path Parameter",
    difficulty: "easy",
    category: "express-api",
    description: "Implement GET /users/:id returning 404 when user not found.",
    tags: ["express", "routing"],
    orderIndex: 5,
    mount: "/",
    import: "./users.routes.js",
    file: "src/users.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Fetch Resource By Path Parameter

Implement \`GET /users/:id\`.

## Requirements
- Return \`200\` with user JSON when found
- Return \`404\` when user id does not exist`,
    starter: `import { Router } from "express";
const users = [{ id: "u1", name: "Ada" }, { id: "u2", name: "Grace" }];
export const router = Router();

router.get("/users/:id", (req, res) => {
  // TODO: find user by req.params.id, return 404 if missing
  return res.status(200).json(users[0]);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_params", type: "regex", pattern: "req\\.params\\.id", message: "Expected req.params.id usage." },
      { id: "returns_404", type: "regex", pattern: "status\\(\\s*404\\s*\\)", message: "Expected HTTP 404 for missing user." },
    ],
  },
  {
    slug: "express-delete-resource",
    title: "Delete Resource Endpoint",
    difficulty: "easy",
    category: "express-api",
    description: "Implement DELETE /tasks/:id with 404 for missing tasks.",
    tags: ["express", "crud"],
    orderIndex: 6,
    mount: "/",
    import: "./tasks.routes.js",
    file: "src/tasks.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Delete Resource Endpoint

Implement \`DELETE /tasks/:id\`.

## Requirements
- Remove task from in-memory store when found
- Return \`404\` if task does not exist
- Return \`204\` on successful delete`,
    starter: `import { Router } from "express";
const tasks = [{ id: "t1", title: "Write tests" }];
export const router = Router();

router.delete("/tasks/:id", (req, res) => {
  // TODO: remove task or return 404, return 204 on success
  return res.status(200).json({ deleted: true });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "returns_404", type: "regex", pattern: "status\\(\\s*404\\s*\\)", message: "Expected HTTP 404 for missing task." },
      { id: "returns_204", type: "regex", pattern: "status\\(\\s*204\\s*\\)", message: "Expected HTTP 204 on successful delete." },
    ],
  },
  {
    slug: "express-update-resource",
    title: "Partial Update Endpoint",
    difficulty: "easy",
    category: "express-api",
    description: "Implement PATCH /products/:id for partial updates.",
    tags: ["express", "crud"],
    orderIndex: 7,
    mount: "/",
    import: "./products.routes.js",
    file: "src/products.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Partial Update Endpoint

Implement \`PATCH /products/:id\`.

## Requirements
- Merge request body fields into existing product
- Return \`404\` if product not found
- Return \`200\` with updated product`,
    starter: `import { Router } from "express";
const products = [{ id: "p1", name: "Laptop", price: 999 }];
export const router = Router();

router.patch("/products/:id", (req, res) => {
  // TODO: find product, merge req.body, return 404 or 200
  return res.status(200).json(products[0]);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_spread", type: "regex", pattern: "\\.\\.\\.", message: "Expected spread/merge for partial update." },
      { id: "returns_404", type: "regex", pattern: "status\\(\\s*404\\s*\\)", message: "Expected HTTP 404 for missing product." },
    ],
  },
  {
    slug: "express-list-pagination",
    title: "Paginate List Results",
    difficulty: "easy",
    category: "express-api",
    description: "Implement GET /posts?page=&limit= with slice-based pagination.",
    tags: ["express", "pagination"],
    orderIndex: 8,
    mount: "/",
    import: "./posts.routes.js",
    file: "src/posts.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Paginate List Results

Implement \`GET /posts\`.

## Requirements
- Accept \`page\` (default 1) and \`limit\` (default 10) query params
- Return sliced results plus \`total\`, \`page\`, \`limit\``,
    starter: `import { Router } from "express";
const posts = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1), title: \`Post \${i + 1}\` }));
export const router = Router();

router.get("/posts", (req, res) => {
  // TODO: parse page/limit, slice posts, return paginated response
  return res.status(200).json({ items: posts, total: posts.length });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_slice", type: "regex", pattern: "\\.slice\\(", message: "Expected slice for pagination." },
      { id: "parses_page", type: "regex", pattern: "req\\.query\\.page", message: "Expected page query param parsing." },
    ],
  },
  {
    slug: "express-email-validation",
    title: "Validate Email Format",
    difficulty: "easy",
    category: "validation",
    description: "Return 400 when email format is invalid on POST /contacts.",
    tags: ["validation", "express"],
    orderIndex: 9,
    mount: "/",
    import: "./contacts.routes.js",
    file: "src/contacts.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Validate Email Format

Implement \`POST /contacts\`.

## Requirements
- Accept \`name\` and \`email\`
- Return \`400\` if email format is invalid (use regex or includes @)
- Return \`201\` with created contact on success`,
    starter: `import { Router } from "express";
export const router = Router();

router.post("/contacts", (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };
  // TODO: validate email format, return 400 if invalid, 201 on success
  return res.status(201).json({ id: "c1", name, email });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "email_check", type: "regex", pattern: "email", message: "Expected email validation logic." },
      { id: "returns_400", type: "regex", pattern: "status\\(\\s*400\\s*\\)", message: "Expected HTTP 400 for invalid email." },
    ],
  },
  {
    slug: "express-password-strength",
    title: "Enforce Minimum Password Length",
    difficulty: "easy",
    category: "validation",
    description: "Reject passwords shorter than 8 characters on registration.",
    tags: ["validation", "security"],
    orderIndex: 10,
    mount: "/",
    import: "./register.routes.js",
    file: "src/register.routes.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Enforce Minimum Password Length

Implement \`POST /register\`.

## Requirements
- Return \`400\` if password length is less than 8
- Return \`201\` on valid registration`,
    starter: `import { Router } from "express";
export const router = Router();

router.post("/register", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  // TODO: enforce password.length >= 8, return 400 or 201
  return res.status(201).json({ id: "1", email });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "length_check", type: "regex", pattern: "password\\.length", message: "Expected password.length check." },
      { id: "min_eight", type: "regex", pattern: "[<>=!]+\\s*8", message: "Expected minimum length of 8." },
    ],
  },
  {
    slug: "express-request-id",
    title: "Attach Request ID Middleware",
    difficulty: "easy",
    category: "middleware",
    description: "Add middleware that sets X-Request-Id on every response.",
    tags: ["middleware", "observability"],
    orderIndex: 11,
    mount: "/",
    import: "./middleware.js",
    file: "src/middleware.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Attach Request ID Middleware

Implement \`requestIdMiddleware\`.

## Requirements
- Generate a UUID for each request
- Set response header \`X-Request-Id\`
- Attach \`req.requestId\` for downstream handlers
- Export middleware and a sample GET /ping route`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { requestId?: string; }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: generate id, set header X-Request-Id, attach to req, call next()
  next();
}

export const router = Router();
router.get("/ping", (req, res) => {
  return res.status(200).json({ requestId: req.requestId ?? "missing" });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "sets_header", type: "regex", pattern: "setHeader\\(\\s*[\"']X-Request-Id", message: "Expected X-Request-Id header." },
      { id: "uses_uuid", type: "regex", pattern: "randomUUID", message: "Expected crypto.randomUUID() for request id." },
    ],
  },
  {
    slug: "express-cors-middleware",
    title: "Basic CORS Middleware",
    difficulty: "easy",
    category: "middleware",
    description: "Allow cross-origin requests with Access-Control-Allow-Origin header.",
    tags: ["middleware", "cors"],
    orderIndex: 12,
    mount: "/",
    import: "./cors.middleware.js",
    file: "src/cors.middleware.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Basic CORS Middleware

Implement \`corsMiddleware\`.

## Requirements
- Set \`Access-Control-Allow-Origin: *\` on responses
- Handle OPTIONS preflight with 204
- Export middleware`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: set CORS headers, handle OPTIONS with 204
  next();
}

export const router = Router();
router.get("/api/data", (_req, res) => res.status(200).json({ ok: true }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "cors_header", type: "regex", pattern: "Access-Control-Allow-Origin", message: "Expected CORS allow-origin header." },
      { id: "options_204", type: "regex", pattern: "OPTIONS", message: "Expected OPTIONS preflight handling." },
    ],
  },
  {
    slug: "express-not-found",
    title: "Global 404 Handler",
    difficulty: "easy",
    category: "error-handling",
    description: "Add catch-all middleware returning JSON 404 for unknown routes.",
    tags: ["express", "error-handling"],
    orderIndex: 13,
    mount: "/",
    import: "./not-found.js",
    file: "src/not-found.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Global 404 Handler

Implement \`notFoundHandler\`.

## Requirements
- Return \`404\` JSON \`{ message: "Not found" }\` for unmatched routes
- Export handler middleware`,
    starter: `import { Router, type Request, type Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  // TODO: return 404 JSON with message Not found
  return res.status(500).json({ message: "error" });
}

export const router = Router();
router.get("/known", (_req, res) => res.status(200).json({ ok: true }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "returns_404", type: "regex", pattern: "status\\(\\s*404\\s*\\)", message: "Expected HTTP 404." },
      { id: "not_found_msg", type: "regex", pattern: "Not found", message: 'Expected "Not found" message.' },
    ],
  },
  {
    slug: "express-error-handler",
    title: "Centralized Error Handler",
    difficulty: "easy",
    category: "error-handling",
    description: "Implement Express error middleware returning consistent JSON errors.",
    tags: ["express", "error-handling"],
    orderIndex: 14,
    mount: "/",
    import: "./error-handler.js",
    file: "src/error-handler.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Centralized Error Handler

Implement \`errorHandler\`.

## Requirements
- Accept \`(err, req, res, next)\` signature
- Return \`500\` with \`{ message: err.message }\`
- Log error to console`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // TODO: log error, return 500 with err.message
  return res.status(200).json({ ok: true });
}

export const router = Router();
router.get("/boom", () => { throw new Error("Boom"); });
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "returns_500", type: "regex", pattern: "status\\(\\s*500\\s*\\)", message: "Expected HTTP 500." },
      { id: "uses_message", type: "regex", pattern: "err\\.message", message: "Expected err.message in response." },
    ],
  },
  {
    slug: "express-content-type-json",
    title: "Reject Non-JSON Content-Type",
    difficulty: "easy",
    category: "middleware",
    description: "Middleware that returns 415 for non-application/json POST bodies.",
    tags: ["middleware", "validation"],
    orderIndex: 15,
    mount: "/",
    import: "./json-only.middleware.js",
    file: "src/json-only.middleware.ts",
    limits: { timeLimitMs: 2000, memoryLimitMb: 256 },
    readme: `# Reject Non-JSON Content-Type

Implement \`jsonOnlyMiddleware\`.

## Requirements
- For POST/PUT/PATCH, require Content-Type application/json
- Return \`415\` otherwise
- Call next() when valid`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

export function jsonOnlyMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: check content-type for write methods, return 415 or next()
  next();
}

export const router = Router();
router.post("/data", (_req, res) => res.status(201).json({ saved: true }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "checks_content_type", type: "regex", pattern: "content-type", message: "Expected content-type check." },
      { id: "returns_415", type: "regex", pattern: "status\\(\\s*415\\s*\\)", message: "Expected HTTP 415." },
    ],
  },

  // ── MEDIUM (15, orderIndex 16–30) ─────────────────────────────────────
  {
    slug: "jwt-token-issue",
    title: "Issue JWT Access Tokens",
    difficulty: "medium",
    category: "auth",
    description: "Sign JWT tokens with expiry on successful login.",
    tags: ["jwt", "auth"],
    orderIndex: 16,
    mount: "/auth",
    import: "./jwt.routes.js",
    file: "src/jwt.routes.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Issue JWT Access Tokens

Implement token signing on \`POST /auth/token\`.

## Requirements
- Accept \`userId\`
- Sign JWT with secret \`backbench-secret\` and \`expiresIn: "1h"\`
- Return \`{ accessToken }\``,
    starter: `import { Router } from "express";
import jwt from "jsonwebtoken";
export const router = Router();

router.post("/token", (req, res) => {
  const { userId } = req.body as { userId?: string };
  // TODO: sign JWT with secret backbench-secret, expiresIn 1h
  return res.status(200).json({ accessToken: "placeholder" });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_sign", type: "regex", pattern: "jwt\\.sign", message: "Expected jwt.sign usage." },
      { id: "expires_in", type: "regex", pattern: "expiresIn", message: "Expected expiresIn option." },
    ],
  },
  {
    slug: "jwt-token-verify",
    title: "Verify JWT Middleware",
    difficulty: "medium",
    category: "auth",
    description: "Middleware that verifies Bearer tokens and attaches userId.",
    tags: ["jwt", "middleware"],
    orderIndex: 17,
    mount: "/",
    import: "./auth.middleware.js",
    file: "src/auth.middleware.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Verify JWT Middleware

Implement \`authMiddleware\`.

## Requirements
- Read Authorization Bearer token
- Verify with secret \`backbench-secret\`
- Attach \`req.userId\` from payload
- Return \`401\` on invalid/missing token`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request { userId?: string; }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: extract Bearer token, verify JWT, set req.userId or return 401
  next();
}

export const router = Router();
router.get("/me", (req, res) => res.status(200).json({ userId: req.userId }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_verify", type: "regex", pattern: "jwt\\.verify", message: "Expected jwt.verify." },
      { id: "returns_401", type: "regex", pattern: "status\\(\\s*401\\s*\\)", message: "Expected HTTP 401." },
    ],
  },
  {
    slug: "rate-limit-basic",
    title: "In-Memory Rate Limiter",
    difficulty: "medium",
    category: "middleware",
    description: "Limit requests per IP to 10 per minute.",
    tags: ["rate-limit", "middleware"],
    orderIndex: 18,
    mount: "/",
    import: "./rate-limit.js",
    file: "src/rate-limit.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# In-Memory Rate Limiter

Implement \`rateLimitMiddleware\`.

## Requirements
- Track request count per IP in a Map
- Allow max 10 requests per 60-second window
- Return \`429\` when exceeded`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: track IP, enforce 10 req/min, return 429 when exceeded
  next();
}

export const router = Router();
router.get("/api", (_req, res) => res.status(200).json({ ok: true }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_map", type: "regex", pattern: "hits\\.", message: "Expected hits Map usage." },
      { id: "returns_429", type: "regex", pattern: "status\\(\\s*429\\s*\\)", message: "Expected HTTP 429." },
    ],
  },
  {
    slug: "cache-ttl",
    title: "TTL In-Memory Cache",
    difficulty: "medium",
    category: "caching",
    description: "Implement get/set cache with TTL expiry.",
    tags: ["caching", "performance"],
    orderIndex: 19,
    mount: "/",
    import: "./cache.js",
    file: "src/cache.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# TTL In-Memory Cache

Implement \`Cache\` class with \`get(key)\` and \`set(key, value, ttlMs)\`.

## Requirements
- Return null for expired or missing keys
- Store expiry timestamp per entry`,
    starter: `type Entry = { value: unknown; expiresAt: number };

export class Cache {
  private store = new Map<string, Entry>();

  get(key: string): unknown | null {
    // TODO: return value if not expired, else null
    return null;
  }

  set(key: string, value: unknown, ttlMs: number): void {
    // TODO: store value with expiresAt = Date.now() + ttlMs
  }
}

import { Router } from "express";
export const router = Router();
const cache = new Cache();
router.get("/cached", (_req, res) => res.status(200).json({ value: cache.get("x") }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "checks_expiry", type: "regex", pattern: "expiresAt", message: "Expected expiresAt tracking." },
      { id: "uses_date_now", type: "regex", pattern: "Date\\.now\\(\\)", message: "Expected Date.now() for TTL." },
    ],
  },
  {
    slug: "idempotency-key",
    title: "Idempotent POST Handler",
    difficulty: "medium",
    category: "api-design",
    description: "Store and replay responses for Idempotency-Key header.",
    tags: ["idempotency", "payments"],
    orderIndex: 20,
    mount: "/",
    import: "./idempotency.js",
    file: "src/idempotency.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Idempotent POST Handler

Implement idempotency for \`POST /payments\`.

## Requirements
- Read \`Idempotency-Key\` header
- Return cached response for duplicate keys
- Store response after first successful create`,
    starter: `import { Router } from "express";
const store = new Map<string, unknown>();

export const router = Router();

router.post("/payments", (req, res) => {
  const key = req.header("Idempotency-Key");
  // TODO: return cached response if key exists, else create and cache
  return res.status(201).json({ id: "pay_1", amount: 100 });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "reads_header", type: "regex", pattern: "Idempotency-Key", message: "Expected Idempotency-Key header." },
      { id: "uses_store", type: "regex", pattern: "store\\.", message: "Expected idempotency store usage." },
    ],
  },
  {
    slug: "webhook-receiver",
    title: "Webhook Signature Verification",
    difficulty: "medium",
    category: "integrations",
    description: "Verify HMAC signature on incoming webhook payloads.",
    tags: ["webhooks", "security"],
    orderIndex: 21,
    mount: "/",
    import: "./webhook.js",
    file: "src/webhook.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Webhook Signature Verification

Implement \`POST /webhooks\`.

## Requirements
- Read \`X-Signature\` header
- Compute HMAC-SHA256 of raw body with secret \`whsec_test\`
- Return \`401\` if signature mismatch
- Return \`200\` on valid signature`,
    starter: `import { Router } from "express";
import crypto from "node:crypto";

export const router = Router();

router.post("/webhooks", (req, res) => {
  const signature = req.header("X-Signature");
  // TODO: compute HMAC-SHA256 of JSON body, compare, return 401 or 200
  return res.status(200).json({ received: true });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_hmac", type: "regex", pattern: "createHmac", message: "Expected crypto.createHmac." },
      { id: "returns_401", type: "regex", pattern: "status\\(\\s*401\\s*\\)", message: "Expected HTTP 401 on bad signature." },
    ],
  },
  {
    slug: "soft-delete",
    title: "Soft Delete Pattern",
    difficulty: "medium",
    category: "database",
    description: "Mark records deletedAt instead of removing from store.",
    tags: ["database", "crud"],
    orderIndex: 22,
    mount: "/",
    import: "./soft-delete.js",
    file: "src/soft-delete.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Soft Delete Pattern

Implement soft delete for users.

## Requirements
- \`DELETE /users/:id\` sets \`deletedAt\` timestamp
- \`GET /users\` excludes soft-deleted records
- Return \`404\` if user not found`,
    starter: `import { Router } from "express";
type User = { id: string; name: string; deletedAt?: string };
const users: User[] = [{ id: "u1", name: "Ada" }];
export const router = Router();

router.delete("/users/:id", (req, res) => {
  // TODO: set deletedAt instead of removing, return 404 if missing
  return res.status(204).send();
});

router.get("/users", (_req, res) => {
  // TODO: filter out deleted users
  return res.status(200).json(users);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "sets_deleted_at", type: "regex", pattern: "deletedAt", message: "Expected deletedAt field." },
      { id: "filters_deleted", type: "regex", pattern: "filter\\(", message: "Expected filter for active users." },
    ],
  },
  {
    slug: "role-based-access",
    title: "Role-Based Route Guard",
    difficulty: "medium",
    category: "auth",
    description: "Middleware restricting routes to admin role.",
    tags: ["auth", "rbac"],
    orderIndex: 23,
    mount: "/",
    import: "./rbac.js",
    file: "src/rbac.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Role-Based Route Guard

Implement \`requireRole(role)\` factory.

## Requirements
- Check \`req.user.role\`
- Return \`403\` if role does not match
- Call next() when authorized`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { user?: { role: string }; }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: check req.user.role, return 403 or next()
    next();
  };
}

export const router = Router();
router.get("/admin", requireRole("admin"), (_req, res) => res.status(200).json({ secret: true }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "checks_role", type: "regex", pattern: "req\\.user", message: "Expected req.user role check." },
      { id: "returns_403", type: "regex", pattern: "status\\(\\s*403\\s*\\)", message: "Expected HTTP 403." },
    ],
  },
  {
    slug: "refresh-token-flow",
    title: "Refresh Token Rotation",
    difficulty: "medium",
    category: "auth",
    description: "Issue new access+refresh token pair and invalidate old refresh token.",
    tags: ["auth", "tokens"],
    orderIndex: 24,
    mount: "/auth",
    import: "./refresh.js",
    file: "src/refresh.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Refresh Token Rotation

Implement \`POST /auth/refresh\`.

## Requirements
- Accept \`refreshToken\` in body
- Validate against in-memory store
- Issue new accessToken + refreshToken
- Invalidate old refresh token (rotation)`,
    starter: `import { Router } from "express";
const refreshStore = new Set<string>();
export const router = Router();

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  // TODO: validate, rotate tokens, invalidate old refresh token
  return res.status(200).json({ accessToken: "new", refreshToken: "new-r" });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_store", type: "regex", pattern: "refreshStore", message: "Expected refresh token store." },
      { id: "deletes_old", type: "regex", pattern: "delete\\(", message: "Expected old token invalidation." },
    ],
  },
  {
    slug: "api-key-auth",
    title: "API Key Authentication",
    difficulty: "medium",
    category: "auth",
    description: "Validate X-API-Key header against allowed keys set.",
    tags: ["auth", "api-keys"],
    orderIndex: 25,
    mount: "/",
    import: "./api-key.js",
    file: "src/api-key.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# API Key Authentication

Implement \`apiKeyMiddleware\`.

## Requirements
- Read \`X-API-Key\` header
- Validate against Set of allowed keys
- Return \`401\` if missing or invalid`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";
const allowedKeys = new Set(["key_live_abc", "key_test_xyz"]);

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: validate X-API-Key header against allowedKeys
  next();
}

export const router = Router();
router.get("/protected", apiKeyMiddleware, (_req, res) => res.status(200).json({ data: "secret" }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "reads_header", type: "regex", pattern: "X-API-Key", message: "Expected X-API-Key header." },
      { id: "returns_401", type: "regex", pattern: "status\\(\\s*401\\s*\\)", message: "Expected HTTP 401." },
    ],
  },
  {
    slug: "request-validation-schema",
    title: "Schema-Based Request Validation",
    difficulty: "medium",
    category: "validation",
    description: "Validate request body fields with explicit schema checks.",
    tags: ["validation", "zod-like"],
    orderIndex: 26,
    mount: "/",
    import: "./validate.js",
    file: "src/validate.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Schema-Based Request Validation

Implement \`validateBody(schema)\` middleware.

## Requirements
- Schema defines required string fields
- Return \`400\` with field errors array on failure
- Attach validated body to \`req.validatedBody\``,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

type Schema = Record<string, "string">;

declare module "express-serve-static-core" {
  interface Request { validatedBody?: Record<string, string>; }
}

export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: validate req.body against schema, return 400 with errors or next()
    next();
  };
}

export const router = Router();
router.post("/items", validateBody({ name: "string" }), (req, res) => {
  return res.status(201).json(req.validatedBody);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "returns_400", type: "regex", pattern: "status\\(\\s*400\\s*\\)", message: "Expected HTTP 400 on validation failure." },
      { id: "validated_body", type: "regex", pattern: "validatedBody", message: "Expected validatedBody attachment." },
    ],
  },
  {
    slug: "cursor-pagination",
    title: "Cursor-Based Pagination",
    difficulty: "medium",
    category: "api-design",
    description: "Paginate feed using opaque cursor tokens instead of page numbers.",
    tags: ["pagination", "api-design"],
    orderIndex: 27,
    mount: "/",
    import: "./cursor.js",
    file: "src/cursor.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Cursor-Based Pagination

Implement \`GET /feed\`.

## Requirements
- Accept \`cursor\` and \`limit\` query params
- Return \`{ items, nextCursor }\`
- \`nextCursor\` is null when no more items`,
    starter: `import { Router } from "express";
const feed = Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1), text: \`Item \${i + 1}\` }));
export const router = Router();

router.get("/feed", (req, res) => {
  // TODO: decode cursor, slice feed, return nextCursor
  return res.status(200).json({ items: feed.slice(0, 10), nextCursor: null });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "uses_cursor", type: "regex", pattern: "cursor", message: "Expected cursor param handling." },
      { id: "next_cursor", type: "regex", pattern: "nextCursor", message: "Expected nextCursor in response." },
    ],
  },
  {
    slug: "bulk-create",
    title: "Bulk Create Endpoint",
    difficulty: "medium",
    category: "express-api",
    description: "Accept array of items and validate each before insert.",
    tags: ["express", "bulk"],
    orderIndex: 28,
    mount: "/",
    import: "./bulk.js",
    file: "src/bulk.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Bulk Create Endpoint

Implement \`POST /items/bulk\`.

## Requirements
- Accept \`{ items: Array<{ name: string }> }\`
- Return \`400\` if any item missing name
- Return \`201\` with created count`,
    starter: `import { Router } from "express";
export const router = Router();

router.post("/items/bulk", (req, res) => {
  const { items } = req.body as { items?: Array<{ name?: string }> };
  // TODO: validate all items have name, return 400 or 201 with count
  return res.status(201).json({ created: 0 });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "validates_items", type: "regex", pattern: "items", message: "Expected items validation." },
      { id: "uses_every", type: "regex", pattern: "every\\(", message: "Expected every() for bulk validation." },
    ],
  },
  {
    slug: "optimistic-locking",
    title: "Optimistic Concurrency Control",
    difficulty: "medium",
    category: "database",
    description: "Reject updates when version header does not match current version.",
    tags: ["concurrency", "database"],
    orderIndex: 29,
    mount: "/",
    import: "./optimistic.js",
    file: "src/optimistic.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Optimistic Concurrency Control

Implement \`PUT /records/:id\`.

## Requirements
- Require \`If-Match\` header with version number
- Return \`409\` on version mismatch
- Increment version on successful update`,
    starter: `import { Router } from "express";
const records = [{ id: "r1", data: "hello", version: 1 }];
export const router = Router();

router.put("/records/:id", (req, res) => {
  const ifMatch = req.header("If-Match");
  // TODO: compare version, return 409 on mismatch, increment on success
  return res.status(200).json(records[0]);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "if_match", type: "regex", pattern: "If-Match", message: "Expected If-Match header." },
      { id: "returns_409", type: "regex", pattern: "status\\(\\s*409\\s*\\)", message: "Expected HTTP 409 on conflict." },
    ],
  },
  {
    slug: "audit-log-middleware",
    title: "Audit Log Middleware",
    difficulty: "medium",
    category: "observability",
    description: "Log mutating requests with userId, method, path, and timestamp.",
    tags: ["logging", "audit"],
    orderIndex: 30,
    mount: "/",
    import: "./audit.js",
    file: "src/audit.ts",
    limits: { timeLimitMs: 3000, memoryLimitMb: 512 },
    readme: `# Audit Log Middleware

Implement \`auditMiddleware\`.

## Requirements
- Log POST/PUT/PATCH/DELETE to in-memory audit array
- Each entry: userId, method, path, timestamp
- Attach audit log via module export \`getAuditLog()\``,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

type AuditEntry = { userId: string; method: string; path: string; timestamp: string };
const auditLog: AuditEntry[] = [];

export function getAuditLog() { return auditLog; }

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: for mutating methods, push audit entry with req.userId
  next();
}

export const router = Router();
router.post("/orders", auditMiddleware, (_req, res) => res.status(201).json({ id: "o1" }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "pushes_audit", type: "regex", pattern: "auditLog\\.push", message: "Expected auditLog.push." },
      { id: "checks_method", type: "regex", pattern: "POST|PUT|PATCH|DELETE", message: "Expected mutating method check." },
    ],
  },

  // ── HARD (15, orderIndex 31–45) ─────────────────────────────────────
  {
    slug: "distributed-lock",
    title: "Redis-Style Distributed Lock",
    difficulty: "hard",
    category: "distributed-systems",
    description: "Implement acquire/release lock with TTL using in-memory simulation.",
    tags: ["locks", "redis"],
    orderIndex: 31,
    mount: "/",
    import: "./lock.js",
    file: "src/lock.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Redis-Style Distributed Lock

Implement \`LockManager\` with \`acquire(key, ttlMs)\` and \`release(key, token)\`.

## Requirements
- acquire returns unique token or null if locked
- release only succeeds with matching token
- Locks expire after TTL`,
    starter: `type LockEntry = { token: string; expiresAt: number };
const locks = new Map<string, LockEntry>();

export class LockManager {
  acquire(key: string, ttlMs: number): string | null {
    // TODO: return token if acquired, null if held and not expired
    return null;
  }

  release(key: string, token: string): boolean {
    // TODO: release only if token matches
    return false;
  }
}

import { Router } from "express";
export const router = Router();
const locks_ = new LockManager();
router.post("/lock/:key", (req, res) => {
  const token = locks_.acquire(req.params.key, 5000);
  return res.status(token ? 200 : 409).json({ token });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "token_check", type: "regex", pattern: "token", message: "Expected token-based lock release." },
      { id: "expiry", type: "regex", pattern: "expiresAt", message: "Expected TTL expiry on locks." },
    ],
  },
  {
    slug: "saga-compensation",
    title: "Saga With Compensation",
    difficulty: "hard",
    category: "distributed-systems",
    description: "Run multi-step saga and compensate on step failure.",
    tags: ["saga", "transactions"],
    orderIndex: 32,
    mount: "/",
    import: "./saga.js",
    file: "src/saga.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Saga With Compensation

Implement \`runOrderSaga(orderId)\`.

## Requirements
- Steps: reserveInventory, chargePayment, sendConfirmation
- On failure, run compensation for completed steps in reverse
- Return success/failure result object`,
    starter: `type StepResult = { ok: boolean };

const completed: string[] = [];

export async function runOrderSaga(orderId: string): Promise<{ success: boolean }> {
  // TODO: run steps in order, compensate in reverse on failure
  return { success: false };
}

import { Router } from "express";
export const router = Router();
router.post("/orders/:id/saga", async (req, res) => {
  const result = await runOrderSaga(req.params.id);
  return res.status(result.success ? 200 : 500).json(result);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "compensate", type: "regex", pattern: "compensat", message: "Expected compensation logic." },
      { id: "reverse", type: "regex", pattern: "reverse\\(\\)|\\.pop\\(\\)|completed", message: "Expected reverse-order compensation." },
    ],
  },
  {
    slug: "circuit-breaker",
    title: "Circuit Breaker Pattern",
    difficulty: "hard",
    category: "resilience",
    description: "Open circuit after failure threshold, half-open probe, then close.",
    tags: ["resilience", "circuit-breaker"],
    orderIndex: 33,
    mount: "/",
    import: "./circuit-breaker.js",
    file: "src/circuit-breaker.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Circuit Breaker Pattern

Implement \`CircuitBreaker\` class.

## Requirements
- States: CLOSED, OPEN, HALF_OPEN
- Open after 3 consecutive failures
- Reject calls when OPEN
- Allow probe call in HALF_OPEN`,
    starter: `type State = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker {
  private state: State = "CLOSED";
  private failures = 0;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // TODO: implement state machine, throw when OPEN, track failures
    return fn();
  }

  getState(): State { return this.state; }
}

import { Router } from "express";
export const router = Router();
const breaker = new CircuitBreaker();
router.get("/upstream", async (_req, res) => {
  try {
    const data = await breaker.execute(async () => ({ ok: true }));
    return res.status(200).json(data);
  } catch { return res.status(503).json({ message: "Circuit open" }); }
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "open_state", type: "regex", pattern: "OPEN", message: "Expected OPEN state handling." },
      { id: "failure_count", type: "regex", pattern: "failures", message: "Expected failure counting." },
    ],
  },
  {
    slug: "outbox-pattern",
    title: "Transactional Outbox",
    difficulty: "hard",
    category: "distributed-systems",
    description: "Write domain event to outbox table in same transaction as entity.",
    tags: ["outbox", "events"],
    orderIndex: 34,
    mount: "/",
    import: "./outbox.js",
    file: "src/outbox.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Transactional Outbox

Implement \`createUserWithOutbox(user)\`.

## Requirements
- Save user to in-memory users array
- Append event \`UserCreated\` to outbox in same operation
- Both succeed or neither (simulate transaction)`,
    starter: `type User = { id: string; email: string };
type OutboxEvent = { id: string; type: string; payload: unknown; processed: boolean };

const users: User[] = [];
const outbox: OutboxEvent[] = [];

export function createUserWithOutbox(email: string): User {
  // TODO: atomically add user + UserCreated outbox event
  return { id: "u1", email };
}

import { Router } from "express";
export const router = Router();
router.post("/users", (req, res) => {
  const user = createUserWithOutbox(req.body.email);
  return res.status(201).json(user);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "outbox_push", type: "regex", pattern: "outbox\\.push", message: "Expected outbox event write." },
      { id: "user_created", type: "regex", pattern: "UserCreated", message: "Expected UserCreated event type." },
    ],
  },
  {
    slug: "retry-backoff",
    title: "Retry With Exponential Backoff",
    difficulty: "hard",
    category: "resilience",
    description: "Retry flaky operation with exponential delay and max attempts.",
    tags: ["retry", "resilience"],
    orderIndex: 35,
    mount: "/",
    import: "./retry.js",
    file: "src/retry.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Retry With Exponential Backoff

Implement \`retryWithBackoff(fn, options)\`.

## Requirements
- Retry up to \`maxAttempts\` (default 3)
- Delay = baseDelayMs * 2^attempt
- Throw last error when exhausted`,
    starter: `type RetryOptions = { maxAttempts?: number; baseDelayMs?: number };

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  // TODO: retry with exponential backoff, throw on exhaustion
  return fn();
}

import { Router } from "express";
export const router = Router();
router.get("/flaky", async (_req, res) => {
  const result = await retryWithBackoff(async () => "ok", { maxAttempts: 3 });
  return res.status(200).json({ result });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "loop_retry", type: "regex", pattern: "for|while", message: "Expected retry loop." },
      { id: "exponential", type: "regex", pattern: "\\*\\s*2|\\*\\*\\s*2|Math\\.pow", message: "Expected exponential backoff." },
    ],
  },
  {
    slug: "dead-letter-queue",
    title: "Dead Letter Queue Handler",
    difficulty: "hard",
    category: "queues",
    description: "Move failed jobs to DLQ after max retries.",
    tags: ["queues", "dlq"],
    orderIndex: 36,
    mount: "/",
    import: "./dlq.js",
    file: "src/dlq.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Dead Letter Queue Handler

Implement \`JobProcessor\`.

## Requirements
- \`process(job)\` retries up to 3 times
- On exhaustion, move job to \`deadLetterQueue\` array
- Return processing result`,
    starter: `type Job = { id: string; payload: unknown };
const deadLetterQueue: Job[] = [];

export class JobProcessor {
  async process(job: Job, handler: (j: Job) => Promise<void>): Promise<{ dlq: boolean }> {
    // TODO: retry handler, push to deadLetterQueue on failure after 3 attempts
    return { dlq: false };
  }
}

import { Router } from "express";
export const router = Router();
const processor = new JobProcessor();
router.post("/jobs", async (req, res) => {
  const result = await processor.process(req.body, async () => { throw new Error("fail"); });
  return res.status(200).json(result);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "dlq_push", type: "regex", pattern: "deadLetterQueue\\.push", message: "Expected DLQ push." },
      { id: "retry_loop", type: "regex", pattern: "for|while|attempts", message: "Expected retry attempts." },
    ],
  },
  {
    slug: "multi-tenant-isolation",
    title: "Multi-Tenant Data Isolation",
    difficulty: "hard",
    category: "architecture",
    description: "Scope all queries by tenantId from request context.",
    tags: ["multi-tenant", "security"],
    orderIndex: 37,
    mount: "/",
    import: "./tenant.js",
    file: "src/tenant.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Multi-Tenant Data Isolation

Implement tenant middleware and scoped repository.

## Requirements
- \`tenantMiddleware\` reads \`X-Tenant-Id\`, sets \`req.tenantId\`
- \`findDocuments(tenantId)\` returns only matching tenant docs
- Return \`400\` if tenant header missing`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { tenantId?: string; }
}

const documents = [
  { id: "d1", tenantId: "t1", title: "Doc A" },
  { id: "d2", tenantId: "t2", title: "Doc B" },
];

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: read X-Tenant-Id, return 400 if missing, set req.tenantId
  next();
}

export function findDocuments(tenantId: string) {
  // TODO: filter documents by tenantId
  return documents;
}

export const router = Router();
router.get("/documents", tenantMiddleware, (req, res) => {
  return res.status(200).json(findDocuments(req.tenantId!));
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "tenant_header", type: "regex", pattern: "X-Tenant-Id", message: "Expected X-Tenant-Id header." },
      { id: "tenant_filter", type: "regex", pattern: "tenantId", message: "Expected tenantId filtering." },
    ],
  },
  {
    slug: "event-store-lite",
    title: "Append-Only Event Store",
    difficulty: "hard",
    category: "event-sourcing",
    description: "Append events and rebuild aggregate state from stream.",
    tags: ["event-sourcing", "cqrs"],
    orderIndex: 38,
    mount: "/",
    import: "./event-store.js",
    file: "src/event-store.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Append-Only Event Store

Implement \`EventStore\`.

## Requirements
- \`append(streamId, event)\` adds to stream
- \`load(streamId)\` returns all events in order
- \`projectBalance(events)\` folds AccountCredited/AccountDebited`,
    starter: `type Event = { type: string; amount: number };
const streams = new Map<string, Event[]>();

export class EventStore {
  append(streamId: string, event: Event): void {
    // TODO: append event to stream array
  }

  load(streamId: string): Event[] {
    // TODO: return events for stream
    return [];
  }
}

export function projectBalance(events: Event[]): number {
  // TODO: fold events into balance
  return 0;
}

import { Router } from "express";
export const router = Router();
const store = new EventStore();
router.get("/accounts/:id/balance", (req, res) => {
  const events = store.load(req.params.id);
  return res.status(200).json({ balance: projectBalance(events) });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "append", type: "regex", pattern: "\\.push\\(", message: "Expected event append." },
      { id: "project", type: "regex", pattern: "reduce|for", message: "Expected balance projection." },
    ],
  },
  {
    slug: "transaction-boundary",
    title: "Simulated DB Transaction",
    difficulty: "hard",
    category: "database",
    description: "Run operations in transaction scope with rollback on error.",
    tags: ["transactions", "database"],
    orderIndex: 39,
    mount: "/",
    import: "./transaction.js",
    file: "src/transaction.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Simulated DB Transaction

Implement \`runInTransaction(fn)\`.

## Requirements
- Clone working state before fn
- Commit on success, rollback snapshot on thrown error
- Return fn result or rethrow`,
    starter: `let accounts = [{ id: "a1", balance: 100 }];

export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  // TODO: snapshot accounts, rollback on error, commit on success
  return fn();
}

import { Router } from "express";
export const router = Router();
router.post("/transfer", async (_req, res) => {
  await runInTransaction(async () => { accounts[0].balance -= 50; });
  return res.status(200).json({ accounts });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "snapshot", type: "regex", pattern: "structuredClone|JSON\\.parse\\(JSON\\.stringify|snapshot|copy", message: "Expected state snapshot." },
      { id: "rollback", type: "regex", pattern: "catch|rollback|restore", message: "Expected rollback on error." },
    ],
  },
  {
    slug: "read-replica-routing",
    title: "Read/Write Query Routing",
    difficulty: "hard",
    category: "database",
    description: "Route SELECT to replica, writes to primary.",
    tags: ["database", "replication"],
    orderIndex: 40,
    mount: "/",
    import: "./router.js",
    file: "src/router.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Read/Write Query Routing

Implement \`QueryRouter\`.

## Requirements
- \`execute(sql)\` routes SELECT to replica
- INSERT/UPDATE/DELETE go to primary
- Track which target was used`,
    starter: `type Target = "primary" | "replica";

export class QueryRouter {
  lastTarget: Target | null = null;

  execute(sql: string): { target: Target; sql: string } {
    // TODO: route SELECT to replica, writes to primary
    return { target: "primary", sql };
  }
}

import { Router } from "express";
export const router = Router();
const queryRouter = new QueryRouter();
router.post("/query", (req, res) => {
  const result = queryRouter.execute(req.body.sql);
  return res.status(200).json(result);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "select_replica", type: "regex", pattern: "replica", message: "Expected replica routing." },
      { id: "select_check", type: "regex", pattern: "SELECT|startsWith|toUpperCase", message: "Expected SELECT detection." },
    ],
  },
  {
    slug: "cache-aside",
    title: "Cache-Aside Pattern",
    difficulty: "hard",
    category: "caching",
    description: "Read through cache with loader fallback and cache populate.",
    tags: ["caching", "patterns"],
    orderIndex: 41,
    mount: "/",
    import: "./cache-aside.js",
    file: "src/cache-aside.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Cache-Aside Pattern

Implement \`getCached(key, loader, ttlMs)\`.

## Requirements
- Return cached value if present and not expired
- Call loader on miss, store result with TTL
- Return loaded value`,
    starter: `type CacheEntry = { value: unknown; expiresAt: number };
const cache = new Map<string, CacheEntry>();

export async function getCached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  // TODO: cache-aside read-through with TTL
  return loader();
}

import { Router } from "express";
export const router = Router();
router.get("/users/:id", async (req, res) => {
  const user = await getCached(\`user:\${req.params.id}\`, async () => ({ id: req.params.id }), 60000);
  return res.status(200).json(user);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "cache_get", type: "regex", pattern: "cache\\.get|cache\\.has", message: "Expected cache lookup." },
      { id: "cache_set", type: "regex", pattern: "cache\\.set", message: "Expected cache populate on miss." },
    ],
  },
  {
    slug: "job-scheduler",
    title: "Delayed Job Scheduler",
    difficulty: "hard",
    category: "queues",
    description: "Schedule jobs to run after delay using in-memory timer queue.",
    tags: ["scheduler", "queues"],
    orderIndex: 42,
    mount: "/",
    import: "./scheduler.js",
    file: "src/scheduler.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Delayed Job Scheduler

Implement \`Scheduler\`.

## Requirements
- \`schedule(job, delayMs)\` queues job for future execution
- \`pendingCount()\` returns queued job count
- Jobs execute via setTimeout`,
    starter: `type Job = { id: string; run: () => void };
const pending: Job[] = [];

export class Scheduler {
  schedule(job: Job, delayMs: number): void {
    // TODO: push to pending, setTimeout to run and remove from pending
  }

  pendingCount(): number {
    return pending.length;
  }
}

import { Router } from "express";
export const router = Router();
const scheduler = new Scheduler();
router.post("/schedule", (req, res) => {
  scheduler.schedule({ id: "j1", run: () => {} }, req.body.delayMs ?? 1000);
  return res.status(202).json({ pending: scheduler.pendingCount() });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "set_timeout", type: "regex", pattern: "setTimeout", message: "Expected setTimeout scheduling." },
      { id: "pending", type: "regex", pattern: "pending", message: "Expected pending queue tracking." },
    ],
  },
  {
    slug: "webhook-retry-delivery",
    title: "Webhook Delivery With Retries",
    difficulty: "hard",
    category: "integrations",
    description: "Deliver webhooks with retry schedule and delivery log.",
    tags: ["webhooks", "retry"],
    orderIndex: 43,
    mount: "/",
    import: "./webhook-delivery.js",
    file: "src/webhook-delivery.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Webhook Delivery With Retries

Implement \`deliverWebhook(url, payload)\`.

## Requirements
- Attempt delivery up to 3 times
- Log each attempt with status to deliveryLog array
- Return final success boolean`,
    starter: `type DeliveryAttempt = { url: string; attempt: number; success: boolean };
const deliveryLog: DeliveryAttempt[] = [];

export async function deliverWebhook(
  url: string,
  payload: unknown,
  sender: (url: string, body: unknown) => Promise<boolean>,
): Promise<boolean> {
  // TODO: retry up to 3 times, log each attempt
  return false;
}

import { Router } from "express";
export const router = Router();
router.post("/deliver", async (req, res) => {
  const ok = await deliverWebhook(req.body.url, req.body.payload, async () => false);
  return res.status(200).json({ success: ok, log: deliveryLog });
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "delivery_log", type: "regex", pattern: "deliveryLog\\.push", message: "Expected delivery log." },
      { id: "retry", type: "regex", pattern: "for|while|attempt", message: "Expected retry attempts." },
    ],
  },
  {
    slug: "conflict-resolution",
    title: "Last-Write-Wins Conflict Resolution",
    difficulty: "hard",
    category: "distributed-systems",
    description: "Merge concurrent document updates using updatedAt timestamp.",
    tags: ["crdt", "sync"],
    orderIndex: 44,
    mount: "/",
    import: "./conflict.js",
    file: "src/conflict.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 512 },
    readme: `# Last-Write-Wins Conflict Resolution

Implement \`mergeDocument(local, remote)\`.

## Requirements
- Compare \`updatedAt\` timestamps
- Return newer version
- If equal, prefer remote`,
    starter: `type Doc = { id: string; content: string; updatedAt: string };

export function mergeDocument(local: Doc, remote: Doc): Doc {
  // TODO: last-write-wins by updatedAt, prefer remote on tie
  return local;
}

import { Router } from "express";
export const router = Router();
router.post("/sync", (req, res) => {
  const merged = mergeDocument(req.body.local, req.body.remote);
  return res.status(200).json(merged);
});
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "updated_at", type: "regex", pattern: "updatedAt", message: "Expected updatedAt comparison." },
      { id: "date_compare", type: "regex", pattern: "Date|getTime|>", message: "Expected timestamp comparison." },
    ],
  },
  {
    slug: "quota-enforcement",
    title: "API Quota Enforcement",
    difficulty: "hard",
    category: "api-design",
    description: "Track daily usage per API key and block when quota exceeded.",
    tags: ["quota", "billing"],
    orderIndex: 45,
    mount: "/",
    import: "./quota.js",
    file: "src/quota.ts",
    limits: { timeLimitMs: 5000, memoryLimitMb: 768 },
    readme: `# API Quota Enforcement

Implement \`quotaMiddleware(dailyLimit)\`.

## Requirements
- Track request count per API key per day
- Reset counter when day changes
- Return \`429\` with \`Retry-After\` when quota exceeded`,
    starter: `import { Router, type Request, type Response, type NextFunction } from "express";

type Usage = { count: number; day: string };
const usageByKey = new Map<string, Usage>();

export function quotaMiddleware(dailyLimit: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.header("X-API-Key") ?? "anonymous";
    // TODO: track daily usage, return 429 with Retry-After when exceeded
    next();
  };
}

export const router = Router();
router.get("/api/data", quotaMiddleware(1000), (_req, res) => res.status(200).json({ ok: true }));
`,
    checks: [
      { id: "no_todo", type: "no_todo" },
      { id: "returns_429", type: "regex", pattern: "status\\(\\s*429\\s*\\)", message: "Expected HTTP 429." },
      { id: "retry_after", type: "regex", pattern: "Retry-After", message: "Expected Retry-After header." },
    ],
  },
];

async function writeFileEnsuringDir(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function challengeExists(slug, difficulty) {
  const dir = path.join(CHALLENGES_ROOT, difficulty, slug);
  try {
    await fs.access(path.join(dir, "challenge.json"));
    return true;
  } catch {
    return false;
  }
}

async function generateChallenge(spec) {
  const { slug, difficulty, file: targetFile, limits } = spec;
  if (await challengeExists(slug, difficulty)) {
    console.log(`skip (exists): ${difficulty}/${slug}`);
    return;
  }

  const dir = path.join(CHALLENGES_ROOT, difficulty, slug);
  const routeFile = path.basename(targetFile);
  const importPath = `./${routeFile.replace(/\.ts$/, ".js")}`;

  const pkg = {
    ...STANDARD_PACKAGE_JSON,
    name: `challenge-template-${slug}`,
  };

  // Add jsonwebtoken dep for JWT challenges
  if (slug.startsWith("jwt-")) {
    pkg.dependencies = { ...pkg.dependencies, "jsonwebtoken": "^9.0.2" };
    pkg.devDependencies = { ...pkg.devDependencies, "@types/jsonwebtoken": "^9.0.10" };
  }

  await writeFileEnsuringDir(path.join(dir, "challenge.json"), JSON.stringify({
    slug: spec.slug,
    title: spec.title,
    difficulty: spec.difficulty,
    category: spec.category,
    description: spec.description,
    tags: spec.tags,
    maxScore: 100,
    timeLimitMs: limits.timeLimitMs,
    memoryLimitMb: limits.memoryLimitMb,
    status: "published",
    orderIndex: spec.orderIndex,
  }, null, 2) + "\n");

  await writeFileEnsuringDir(path.join(dir, "README.md"), spec.readme.trim() + "\n");
  await writeFileEnsuringDir(path.join(dir, "public-tests", "README.md"), "Public test placeholders for local debugging.\n");
  await writeFileEnsuringDir(path.join(dir, "hidden-tests", "README.md"), "Hidden tests for worker evaluation.\n");
  await writeFileEnsuringDir(path.join(dir, "hidden-tests", "evaluate.mjs"), evaluateMjs(targetFile, spec.checks));
  await writeFileEnsuringDir(path.join(dir, "template", "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  await writeFileEnsuringDir(path.join(dir, "template", "src", "server.ts"), serverTs(importPath, spec.mount));
  await writeFileEnsuringDir(path.join(dir, "template", "src", routeFile), spec.starter.trim() + "\n");

  console.log(`created: ${difficulty}/${slug}`);
}

async function main() {
  let created = 0;
  let skipped = 0;
  for (const spec of CHALLENGES) {
    const existed = await challengeExists(spec.slug, spec.difficulty);
    await generateChallenge(spec);
    if (existed) skipped++;
    else created++;
  }
  console.log(`\nDone. Created ${created}, skipped ${skipped} (existing).`);
  console.log(`Total catalog target: 45 challenges (1 existing + ${CHALLENGES.length} in generator).`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
