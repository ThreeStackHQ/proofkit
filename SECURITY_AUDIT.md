# ProofKit — Security Audit Report
**Sprint:** 4.3  
**Date:** 2026-03-01  
**Auditor:** Sage (automated sub-agent)  
**Scope:** Full codebase — `apps/web`, `packages/widget`, `packages/db`

---

## Executive Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0     |
| HIGH     | 1     |
| MEDIUM   | 2     |
| LOW      | 3     |
| PASS     | 9     |

**Overall verdict:** No critical vulnerabilities found. One high-severity mass-assignment bug (fixed in this PR). Ready for integration testing after review.

---

## ✅ PASSED Checks

### SEC-P01 — Dashboard Authentication Middleware
**Status:** PASS  
`middleware.ts` is present and correctly guards `/dashboard`, `/campaigns`, `/events`, and `/settings` paths. The middleware matcher `/((?!api|_next/static|_next/image|favicon.ico).*)` covers all page routes. Unauthenticated users are redirected to `/login`.

### SEC-P02 — API Route Authentication
**Status:** PASS  
All 10 authenticated API routes call `await auth()` as their first operation and return `401 Unauthorized` if no session is found:
- `GET/POST /api/workspaces`
- `GET /api/workspaces/[id]/stats`
- `GET/DELETE /api/workspaces/[id]/events`
- `GET/POST /api/workspaces/[id]/api-key`
- `GET/POST /api/campaigns`
- `PATCH/DELETE /api/campaigns/[id]`
- `POST /api/stripe/checkout`

### SEC-P03 — Widget CORS Headers (Wildcard)
**Status:** PASS  
`GET /api/widget/[siteId]` correctly sets `Access-Control-Allow-Origin: *` — required for third-party embed use. `POST /api/ingest` and `POST /api/widget/[siteId]/track` both include `OPTIONS` preflight handlers with wildcard CORS headers.

### SEC-P04 — Widget XSS Prevention
**Status:** PASS  
The Vanilla JS widget (`packages/widget/src/widget.ts`) **does not use `innerHTML`**. All dynamic content is inserted via `element.textContent`, which is XSS-safe. Server-supplied `personName`, `personLocation`, and `createdAt` fields are all set through `.textContent` assignments.

### SEC-P05 — IDOR: Workspace Ownership Verification
**Status:** PASS  
Every workspace-scoped API route verifies ownership with `eq(workspaces.ownerId, session.user.id)`. Campaign routes use an `innerJoin` to ensure the campaign's workspace is owned by the authenticated user before any mutation.

### SEC-P06 — Stripe Webhook Signature Verification
**Status:** PASS  
`POST /api/stripe/webhook` uses `stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)` correctly. The raw body is read via `req.text()` (not parsed JSON) to preserve signature integrity. Requests with missing or invalid signatures return `400`.

### SEC-P07 — API Key Security (No Client-Side Exposure)
**Status:** PASS  
Workspace API keys (`pk_live_*`) are:
- Stored server-side only in the database
- Served exclusively via authenticated endpoints (`/api/workspaces/[id]/api-key`)
- Never included in `NEXT_PUBLIC_*` env vars or embedded in widget JS
- The widget only receives a public `siteId` (UUID), not the write-capable API key

### SEC-P08 — Rate Limiting on /api/ingest
**Status:** PASS  
`/api/ingest` implements a workspace-level in-memory rate limiter (100 events/hour per workspace). It also enforces monthly tier limits (free: 1,000 / pro: 50,000 / business: unlimited) before allowing writes.

### SEC-P09 — SQL Injection Prevention
**Status:** PASS  
The codebase exclusively uses Drizzle ORM parameterized query builders (`eq()`, `and()`, `gte()`, `inArray()`, etc.). No `$queryRawUnsafe` or string-concatenated raw SQL was found anywhere in the codebase.

---

## 🔴 HIGH Findings

### SEC-H01 — Mass Assignment in `PATCH /api/campaigns/[id]`
**Severity:** HIGH  
**File:** `apps/web/src/app/api/campaigns/[id]/route.ts`  
**Status:** ✅ FIXED

**Description:**  
The original PATCH handler spread the entire request body directly into the Drizzle `.set()` call:

```typescript
// VULNERABLE (original)
const body = await req.json();
const [updated] = await db
  .update(campaigns)
  .set({ ...body, updatedAt: new Date() })
  .where(eq(campaigns.id, params.id))
  .returning();
```

An authenticated attacker who owns a campaign could inject arbitrary fields including `workspaceId`, effectively transferring their campaign to a victim's workspace. This would cause the victim's widget to display attacker-controlled notifications (e.g., fabricated FOMO events).

**Attack scenario:**
1. Attacker creates account, owns campaign `C1` in workspace `W1`
2. Attacker sends: `PATCH /api/campaigns/C1` with `{ "workspaceId": "victim_workspace_id" }`
3. Campaign `C1` is moved to victim's workspace
4. Victim's widget now displays attacker-crafted social proof events

**Fix applied:**  
Replaced body spread with an explicit allowlist of mutable fields: `name`, `active`, `position`, `theme`, `displayTimeMs`, `delayBetweenMs`, `maxPerSession`, `eventTypes`. Immutable fields (`id`, `workspaceId`, `createdAt`) can no longer be overwritten.

---

## 🟡 MEDIUM Findings

### SEC-M01 — No Zod Validation on API Route Inputs
**Severity:** MEDIUM  
**Files:** All API route handlers

**Description:**  
Input validation is done via manual checks (`if (!email || !password)`) rather than Zod schemas. This means:
- No email format validation on signup (a string like `"notanemail"` is accepted)
- No length limits on `personName` / `personLocation` in `/api/ingest` (potential very-long-string DB writes)
- No type coercion safety (`displayTimeMs` could receive a string)
- No structured error messages for API consumers

**Recommendation:**  
Add Zod schemas to all API route handlers. Example for `/api/auth/signup`:
```typescript
const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().max(100).optional(),
});
```

**Not fixed (non-critical):** No immediate exploitability beyond malformed data. Database constraints provide a safety net.

---

### SEC-M02 — In-Memory Rate Limiter Not Production-Safe
**Severity:** MEDIUM  
**File:** `apps/web/src/app/api/ingest/route.ts`

**Description:**  
The rate limiter for `/api/ingest` uses `new Map()` in module scope. This approach:
- **Resets on every cold start** (serverless environments reset state per-invocation)
- **Does not share state across multiple instances** (horizontal scaling defeats the limit)
- **Does not persist through Next.js route handler reloads** in development

In a serverless deployment (Vercel, etc.), each lambda instance has its own rate limit counter, making the limit effectively non-functional under distributed load.

**Recommendation:**  
Replace with Redis-based rate limiting (e.g., `@upstash/ratelimit` with Upstash Redis) or use an edge middleware rate limiter. The same applies to the impression tracking limiter added in this audit.

**Not fixed:** Requires infrastructure changes (Redis). Documented for Sprint 5.

---

## 🟢 LOW Findings

### SEC-L01 — No Rate Limiting on `/api/widget/[siteId]/track`
**Severity:** LOW → FIXED  
**File:** `apps/web/src/app/api/widget/[siteId]/track/route.ts`  
**Status:** ✅ FIXED (partial — in-memory, see SEC-M02)

**Description:**  
The impression tracking endpoint had no rate limiting, allowing malicious third parties to inflate impression analytics for any site by spamming POST requests.

**Fix applied:**  
Added in-memory rate limiter: 60 requests/minute per `siteId`. Subject to the same serverless caveat as SEC-M02.

---

### SEC-L02 — Missing `.env.example`
**Severity:** LOW  
**Location:** Repository root

**Description:**  
No `.env.example` file exists to document required environment variables. Developers cloning the repo have no reference for which secrets to configure. Required vars appear to include:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_BUSINESS_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`

**Recommendation:**  
Create `apps/web/.env.example` documenting all required vars with placeholder values.

**Not fixed:** Documentation task only.

---

### SEC-L03 — JWT Session Expiry is 30 Days
**Severity:** LOW  
**File:** `apps/web/src/auth.ts`

**Description:**  
`session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }` sets a 30-day session lifetime. If a JWT is compromised (e.g., via XSS on a third-party site embedding the widget), the attacker has a 30-day window. Industry standard for dashboard apps is 7-14 days with refresh tokens.

**Recommendation:**  
Consider reducing `maxAge` to `7 * 24 * 60 * 60` (7 days) or implementing refresh token rotation.

**Not fixed:** UX/product decision.

---

## Audit Checklist Summary

| Check | Result |
|-------|--------|
| Dashboard protected by middleware | ✅ PASS |
| All API routes auth-gated | ✅ PASS |
| Widget CORS wildcard for embeds | ✅ PASS |
| Widget uses innerHTML with unsanitized data | ✅ PASS (no innerHTML) |
| IDOR: workspace/campaign ownership verified | ✅ PASS |
| Stripe webhook `constructEvent()` used | ✅ PASS |
| API key never exposed client-side | ✅ PASS |
| Rate limiting on /api/ingest | ✅ PASS |
| Zod validation on all API routes | ❌ FAIL (SEC-M01) |
| SQL injection (Drizzle ORM only) | ✅ PASS |
| Mass assignment prevention | ❌ FIXED (SEC-H01) |
| Rate limiting on /api/widget/track | ❌ FIXED (SEC-L01) |

---

## Changes Made in This Audit

1. **`apps/web/src/app/api/campaigns/[id]/route.ts`** — Fixed HIGH mass-assignment vulnerability; PATCH now allowlists mutable fields.
2. **`apps/web/src/app/api/widget/[siteId]/track/route.ts`** — Added in-memory rate limiter (60 req/min per siteId).

---

*Audit performed by Sage automated security agent — ProofKit Sprint 4.3*
