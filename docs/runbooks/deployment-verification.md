# Deployment Verification Runbook

*Status*: Active Operational Runbook  
*Last Updated*: 2026-11-22  
*Owner*: Engineering & DevOps

Use this runbook to verify every staging or production release of **Secret Key Generator** (`digitalterrene/secretmanager`) before declaring a deployment healthy.

---

## 1. Pre-Deployment Checklist

- [ ] CI Quality Gate (`.github/workflows/ci.yml`) passed on `main` (Gitleaks, ESLint, `tsc --noEmit`, `npm run build`).
- [ ] All required environment variables are configured in the target hosting platform (e.g., Vercel / Docker / Node host):
  - `SECRET` (high-entropy 32+ byte secret)
  - `PEPPER` (optional static pepper — must remain unchanged if deterministic continuity is required)
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- [ ] HTTPS / TLS termination is active (`NODE_ENV=production` enables `secure: true` on the `secret-gen-fp` cookie).

---

## 2. Automated Smoke Tests (`curl`)

Replace `BASE_URL` with your deployed origin (e.g., `https://your-domain.com` or `http://localhost:3000`).

### 2.1 Verify Frontend Renders (HTTP 200)

```bash
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" "${BASE_URL}/"
```

Expected: `HTTP 200`

### 2.2 Verify Input Validation Rejects Weak Passphrase (HTTP 400)

```bash
TS=$(node -e "console.log(Date.now().toString())")
curl -i -X POST "${BASE_URL}/api/generate-secret" \
  -H "Content-Type: application/json" \
  -d "{\"phrase\":\"weak\",\"timestamp\":\"${TS}\"}"
```

Expected:
- Status: `HTTP/1.1 400 Bad Request`
- Body: `{"error":"Passphrase must be at least 12 characters long."}`

### 2.3 Verify Deterministic Secret Generation & Security Headers (HTTP 200)

```bash
TS=$(node -e "console.log(Date.now().toString())")
curl -i -X POST "${BASE_URL}/api/generate-secret" \
  -H "Content-Type: application/json" \
  -d "{\"phrase\":\"SmokeTest!2026#Key\",\"timestamp\":\"${TS}\"}"
```

Verify ALL of the following in the response:
- [ ] Status is `HTTP 200 OK`
- [ ] JSON body contains `secret` (64-character lowercase hex string), `phrase`, and `timestamp`
- [ ] Rate-limit headers are present:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: <number>`
  - `X-RateLimit-Reset: <epoch>`
- [ ] Security headers are present:
  - `Content-Security-Policy: default-src 'self'`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Set-Cookie` contains `secret-gen-fp=...; HttpOnly; SameSite=Strict` (plus `Secure` in production)

### 2.4 Verify Determinism

Re-run command **2.3** with the **exact same `TS` and `phrase`**. Confirm the returned `secret` value is byte-for-byte identical.

---

## 3. UI & Local AI Verification (Manual)

- [ ] **Form Mode**: Click **Capture Timestamp** -> **Insert** -> submit valid 12+ char passphrase -> verify entry appears in **Response History** and copy button works.
- [ ] **Theme Switch**: Toggle light/dark switch in navbar -> confirm all tabs re-theme cleanly.
- [ ] **Terminal Mode**: Run `help`, `ls`, and `generate secret` -> verify password-masked prompt and secret output.
- [ ] **AI Chat Mode** *(local dev with Ollama)*: Verify `OLLAMA_ORIGINS=http://localhost:3000 ollama serve` responds to a test prompt.

---

## 4. Rollback Criteria & Procedure

Trigger an immediate rollback if any of the following occur:
1. `POST /api/generate-secret` returns `500 Internal Server Error` (check `SECRET` env var or Upstash Redis connectivity).
2. Security headers or `X-RateLimit-*` headers are missing from API responses.
3. Unintended changes to `SECRET` or `PEPPER` break deterministic outputs.

**Rollback Steps**:
1. Revert to the previous known-good deployment in your hosting dashboard (e.g., Vercel **Instant Rollback**), or redeploy the previous release git tag.
2. Re-run Smoke Tests **2.1–2.4** to confirm recovery.
3. Open a post-incident issue using `.github/ISSUE_TEMPLATE/bug_report.md`.
