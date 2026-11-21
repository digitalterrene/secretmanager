# ADR-002: Upstash Redis Sliding-Window Rate Limiting

| Metadata | Value |
|---|---|
| **Status** | `Accepted` |
| **Date** | 2026-11-22 |
| **Author(s)** | Core Engineering Team |
| **Deciders** | Lead Engineers |
| **Related Code** | `src/lib/rate-limit.ts`, `src/app/api/generate-secret/route.ts` |

---

## 1. Context

`POST /api/generate-secret` executes 10,000 iterations of HMAC-SHA256 per valid request (see [ADR-001](./ADR-001-deterministic-hmac-secret-derivation.md)). Without distributed rate limiting, an attacker could flood the endpoint to exhaust serverless compute budgets or perform online passphrase brute-forcing.

Because Next.js App Router API routes are commonly deployed to stateless serverless platforms (e.g., Vercel), in-memory rate limiters (such as `express-rate-limit` default stores or `Map`-based counters) fail to synchronize across cold starts and concurrent instances.

---

## 2. Decision

We will enforce distributed rate limiting using **`@upstash/ratelimit`** backed by **`@upstash/redis`** (`src/lib/rate-limit.ts`):

- **Algorithm**: `Ratelimit.slidingWindow(100, "15 m")` — maximum 100 requests per 15-minute sliding window per client IP.
- **Keying**: Client IP extracted from `x-forwarded-for` (fallback `127.0.0.1`), namespaced under `@upstash/ratelimit:secret-generator`.
- **Observability**: `analytics: true` enabled; standard `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers returned on both `200` and `429` responses.

---

## 3. Consequences

### Positive Impacts
- **Serverless-Native**: Uses HTTP REST rather than persistent TCP connections, avoiding connection pool exhaustion in serverless functions.
- **Smooth Traffic Shaping**: Sliding-window algorithm prevents boundary-burst spikes inherent to fixed-window counters.
- **Transparent Client Feedback**: Returning `X-RateLimit-*` headers allows clients and monitoring tools to track remaining quota cleanly.

### Negative Impacts
- **External Runtime Dependency**: Every request to `/api/generate-secret` incurs a network round-trip to Upstash Redis; if Upstash is unreachable or unconfigured, the route currently fails closed with HTTP `500`.
- **Header Trust Boundary**: Relying on `x-forwarded-for` assumes deployment behind a trusted reverse proxy that overwrites or sanitizes client-supplied headers.

### Risks & Mitigations
- **Risk**: Upstash Redis outage blocks all secret generation.  
  **Mitigation**: Documented health verification and incident response procedures in [`docs/runbooks/incident-response.md`](../runbooks/incident-response.md).
- **Risk**: Missing env vars in local dev cause immediate 500 errors.  
  **Mitigation**: Explicitly documented in `.env.example` and `README.md`.

---

## 4. Alternatives Considered

1. **In-Memory LRU / Map Rate Limiter**:
   - *Reason for rejection*: State is lost across serverless invocations and not shared across horizontally scaled replicas.
2. **Self-Hosted Redis (`ioredis`)**:
   - *Reason for rejection*: Requires managing persistent TCP connections and infrastructure ops overhead unsuitable for lightweight Next.js serverless deployments.
3. **API Gateway / WAF-Only Rate Limiting (Cloudflare / Vercel Firewall)**:
   - *Reason for rejection*: Ties protection strictly to hosting vendor configuration; application-level Upstash limiting ensures portability across any host.
