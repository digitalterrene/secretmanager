# ADR-001: Server-Side Deterministic HMAC-SHA256 Secret Derivation

| Metadata | Value |
|---|---|
| **Status** | `Accepted` |
| **Date** | 2026-11-22 |
| **Author(s)** | Core Engineering Team |
| **Deciders** | Lead Engineers |
| **Related Code** | `src/lib/security.ts`, `src/app/api/generate-secret/route.ts` |

---

## 1. Context

Secret Key Generator must produce high-entropy, 256-bit hexadecimal secrets from a user-supplied passphrase and a 13-digit Unix timestamp without requiring a persistent database to store generated secrets.

Key constraints:
- Secrets must be **reproducible** given the same passphrase, timestamp, and server-side secret material, yet **unpredictable** to any party who lacks the server-side `SECRET` and optional `PEPPER`.
- The derivation must run on standard Node.js / Edge-compatible Next.js runtimes using built-in Web Crypto APIs (`crypto.subtle`) with zero native C++ addon dependencies.
- Brute-force attempts against weak passphrases must be mitigated both by input complexity rules (12+ characters, mixed character classes, ±1 hour timestamp window) and iterative key stretching.

---

## 2. Decision

We will implement server-side deterministic secret derivation in `generateDeterministicSecret()` (`src/lib/security.ts`) using **10,000 sequential iterations of HMAC-SHA256** via the Web Crypto API (`crypto.subtle.importKey` + `crypto.subtle.sign`):

1. Concatenate initial payload: `${phrase}${PEPPER}${timestamp}${SERVER_SECRET}`.
2. Import `process.env.SECRET` as a raw `HMAC` (`SHA-256`) `CryptoKey`.
3. Iteratively sign the hex-encoded output 10,000 times, returning the final 64-character lowercase hexadecimal digest.
4. Pair derivation with strict server-side input validation (`validateInputs`) and an `httpOnly`, `sameSite: strict` request fingerprint cookie (`secret-gen-fp`).

---

## 3. Consequences

### Positive Impacts
- **Zero Database Footprint**: No user secrets or passphrases are stored server-side, eliminating database breach exposure for generated keys.
- **Runtime Portability**: Uses standard Web Crypto API (`crypto.subtle`), working cleanly across Node.js 20+ and serverless/edge Next.js deployments.
- **Server-Bound Security**: Compromising a user's passphrase alone is insufficient to reproduce the derived secret without `env.SECRET` and `env.PEPPER`.

### Negative Impacts
- **Secret Rotation Impact**: Rotating `env.SECRET` or `env.PEPPER` changes all future outputs for identical `(phrase, timestamp)` inputs.
- **CPU Cost per Request**: 10,000 sequential `crypto.subtle.sign` calls add measurable CPU time per request, making rate limiting (see [ADR-002](./ADR-002-upstash-redis-sliding-window-rate-limiting.md)) mandatory to prevent CPU exhaustion DoS.
- **Not Memory-Hard**: Unlike Argon2id, iterated HMAC-SHA256 is compute-bound rather than memory-hard.

### Risks & Mitigations
- **Risk**: Server `SECRET` leak compromises derivation confidentiality.  
  **Mitigation**: Enforce `.gitignore` zero-leak rules, CI Gitleaks scanning, and documented rotation procedures in [`docs/runbooks/incident-response.md`](../runbooks/incident-response.md).
- **Risk**: Passphrase transmitted over network to `/api/generate-secret`.  
  **Mitigation**: Require HTTPS/TLS in production and set strict security headers (`CSP`, `X-Frame-Options: DENY`, `nosniff`).

---

## 4. Alternatives Considered

1. **Client-Side Pure CSPRNG (`crypto.getRandomValues`)**:
   - *Reason for rejection*: Produces non-deterministic random keys; does not support deterministic passphrase + timestamp derivation or server-side peppering.
2. **Argon2id (`argon2` native npm package)**:
   - *Reason for rejection*: Requires native C++ bindings (`node-gyp`), complicating serverless/Vercel deployment and Edge runtime compatibility.
3. **PBKDF2 (`crypto.subtle.deriveBits`)**:
   - *Reason for rejection*: Viable future upgrade path; iterated HMAC-SHA256 was chosen initially for simplicity and explicit control over `SECRET` + `PEPPER` mixing. Can supersede this ADR if memory-hard or NIST-standard PBKDF2/scrypt is required later.
