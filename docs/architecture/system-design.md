# System Design & Component Topology

*Status*: Living Architecture Specification  
*Last Updated*: 2026-11-22  
*Scope*: `digitalterrene/secretmanager` (Next.js 15 App Router + Upstash Redis + Local Ollama)

---

## 1. High-Level System Topology

**Secret Key Generator** is a full-stack Next.js App Router application composed of three runtime boundaries:

1. **Browser Client (React 19)**: Renders the three-tab workspace (Form, Interactive Terminal, AI Chat), manages transient session history via React Context (`HistoryContext`) and browser `localStorage`, and communicates directly with the Next.js API and local Ollama server.
2. **Next.js Server Runtime (`/api/generate-secret`)**: Enforces sliding-window rate limits, validates passphrase/timestamp inputs, executes 10,000-round HMAC-SHA256 deterministic key derivation using Web Crypto API, sets an `httpOnly` request fingerprint cookie, and attaches hardened HTTP security headers.
3. **External & Local Dependencies**:
   - **Upstash Redis** (Serverless REST): Stores sliding-window rate-limit counters per client IP.
   - **Local Ollama Daemon** (`http://localhost:11434`): Provides local LLM inference for both the AI Chat tab and the Terminal `ai chat` / `ai models` commands.

```mermaid
flowchart TB
    User(["Developer / End User"])

    subgraph Browser["Browser Runtime (http://localhost:3000)"]
        Layout["RootLayout (src/app/layout.tsx)"]
        AppWrap["AppWrapper (ThemeProvider + HistoryProvider)"]
        Navbar["Navbar (Theme Switch + External Links)"]
        Home["Homepage Tab Controller (src/components/pages/Homepage.tsx)"]

        subgraph Modes["Workspace Modes"]
            FormMode["Form Mode\nsrc/components/ui/form.tsx"]
            HistoryPanel["ResponseHistory\nsrc/components/ui/responsehistory.tsx"]
            TermMode["Terminal Mode\nsrc/components/Terminal.tsx"]
            ChatMode["AI Chat Mode\nsrc/components/ai-chat.tsx"]
        end

        subgraph ClientLib["Client Services & Utilities"]
            GenUtil["generateSecret()\nsrc/utils/generate-secret.tsx"]
            TermCmds["TerminalCommands\nsrc/utils/TerminalCommands.ts"]
            CmdHist["CommandHistory\nsrc/utils/CommandHistory.ts"]
            AISvc["AIService\nsrc/services/ai-service.ts"]
            LS[("Browser localStorage\n- secret-history\n- terminal-history\n- terminal-command-history")]
        end

        Layout --> AppWrap --> Navbar
        AppWrap --> Home
        Home --> FormMode
        Home --> HistoryPanel
        Home --> TermMode
        Home --> ChatMode

        FormMode --> GenUtil
        FormMode <--> LS
        TermMode --> TermCmds
        TermMode --> CmdHist
        CmdHist <--> LS
        TermMode <--> LS
        ChatMode --> AISvc
    end

    subgraph NextServer["Next.js Server Runtime"]
        Route["POST /api/generate-secret\nsrc/app/api/generate-secret/route.ts"]
        RateLim["ratelimit.limit(ip)\nsrc/lib/rate-limit.ts"]
        SecLib["Security & Crypto Module\nsrc/lib/security.ts"]
    end

    subgraph Infra["Infrastructure & Local AI"]
        Upstash[("Upstash Redis\n@upstash/ratelimit")]
        Ollama["Local Ollama API\nhttp://localhost:11434/api"]
    end

    User --> Browser
    GenUtil -- "POST /api/generate-secret" --> Route
    TermCmds -- "POST /api/generate-secret" --> Route
    Route --> RateLim <--> Upstash
    Route --> SecLib
    AISvc -- "POST /generate & GET /tags" --> Ollama
    TermCmds -- "POST /generate & GET /tags" --> Ollama
```

---

## 2. Frontend Component Hierarchy

```mermaid
flowchart TD
    RootLayout["RootLayout (app/layout.tsx)"]
    RootLayout --> Preline["PrelineScript (components/PrelineScript.tsx)"]
    RootLayout --> AppWrap["AppWrapper (components/appwrapper.tsx)"]
    AppWrap --> ThemeProv["ThemeProvider (next-themes)"]
    ThemeProv --> HistProv["HistoryProvider (context/HistoryContext.tsx)"]
    HistProv --> Navbar["Navbar (components/ui/navbar.tsx)"]
    HistProv --> HomePage["Home (app/page.tsx)"]
    HomePage --> HomepageComp["Homepage (components/pages/Homepage.tsx)"]

    HomepageComp --> FormTab["Tab 1: Form (components/ui/form.tsx)"]
    HomepageComp --> HistSide["Side Panel: Responsehistory (components/ui/responsehistory.tsx)"]
    HomepageComp --> TermTab["Tab 2: TerminalIndex (components/pages/terminal/Index.tsx)"]
    TermTab --> TermComp["Terminal (components/Terminal.tsx)"]
    HomepageComp --> ChatTab["Tab 3: AIChat (components/ai-chat.tsx)"]

    subgraph Auxiliary["Auxiliary / Standalone Components"]
        AIModels["AIModels (components/ai-models.tsx)"]
        Notif["Notification (utils/notifications.tsx)"]
        NotFound["NotFound (app/not-found.tsx)"]
    end
```

---

## 3. Core Request Lifecycle Sequences

### 3.1 Secret Generation Flow (`POST /api/generate-secret`)

Both **Form Mode** (`generateSecret()` in `src/utils/generate-secret.tsx`) and **Terminal Mode** (`TerminalCommands.generateSecret()` in `src/utils/TerminalCommands.ts`) invoke the same backend API route.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Form / Terminal UI
    participant API as POST /api/generate-secret
    participant Redis as Upstash Redis
    participant Sec as src/lib/security.ts

    User->>UI: Enter passphrase & timestamp (or run `generate secret`)
    UI->>API: POST /api/generate-secret\nContent-Type: application/json\n{ phrase, timestamp }

    API->>Redis: ratelimit.limit(x-forwarded-for || "127.0.0.1")
    alt Rate limit exceeded (>100 req / 15m)
        Redis-->>API: { success: false, limit, remaining: 0, reset }
        API-->>UI: HTTP 429 Too Many Requests + X-RateLimit-* headers
        UI-->>User: Display rate-limit error
    else Allowed
        Redis-->>API: { success: true, limit, remaining, reset }
        API->>API: Verify Content-Type includes application/json
        API->>Sec: validateInputs(phrase, timestamp)
        alt Validation fails
            Sec-->>API: Error message string
            API-->>UI: HTTP 400 Bad Request { error }
            UI-->>User: Display validation error
        else Valid inputs
            API->>Sec: generateDeterministicSecret(phrase, timestamp)
            Note over Sec: 10,000 rounds of HMAC-SHA256\nusing SECRET + PEPPER
            Sec-->>API: 64-char hex secret
            API->>Sec: generateRequestFingerprint(req)
            Sec-->>API: HMAC-SHA256 fingerprint hex
            API->>Sec: setSecureCookie(fingerprint)
            API->>Sec: setSecurityHeaders()
            API-->>UI: HTTP 200 OK { secret, phrase, timestamp }\n+ Security Headers + X-RateLimit-* + Set-Cookie
            UI->>UI: Prepend to HistoryContext & localStorage ("secret-history")
            UI-->>User: Render secret with copy action
        end
    end
```

### 3.2 Local AI Chat Flow (Browser -> Ollama)

AI queries are dispatched directly from the browser to the user's local Ollama runtime (`http://localhost:11434/api`). No prompts are routed through the Next.js server or third-party cloud APIs.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Chat as AIChat / Terminal
    participant Svc as AIService (src/services/ai-service.ts)
    participant Ollama as Local Ollama (localhost:11434)

    User->>Chat: Submit prompt message
    Chat->>Svc: AIService.sendMessage([userMessage])
    Svc->>Ollama: POST /api/generate\n{ model: "deepseek-r1:1.5b", prompt, stream: false }
    alt Ollama reachable & CORS allowed
        Ollama-->>Svc: HTTP 200 { response, model, created_at, done }
        Svc-->>Chat: AIResponse
        Chat->>Chat: Strip <think> tags & animate typewriter output
        Chat-->>User: Display formatted assistant response
    else Connection refused / CORS blocked
        Ollama--xSvc: TypeError: Failed to fetch
        Svc-->>Chat: Throw Error
        Chat-->>User: Display connection/CORS hint\n(OLLAMA_ORIGINS=* ollama serve)
    end
```

---

## 4. API Contract Specification

### `POST /api/generate-secret`

- **Source**: [`src/app/api/generate-secret/route.ts`](../../src/app/api/generate-secret/route.ts)
- **Content-Type**: `application/json` (strictly enforced)

#### Request Body

```json
{
  "phrase": "MyS3cure!Passphrase",
  "timestamp": "1732227957000"
}
```

#### Response Codes

| HTTP Status | Condition | Body Schema | Notable Headers |
|---|---|---|---|
| `200 OK` | Secret successfully derived | `{ "secret": "<64-hex>", "phrase": "<string>", "timestamp": "<13-digit>" }` | `X-RateLimit-*`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Set-Cookie: secret-gen-fp=...` |
| `400 Bad Request` | Missing `application/json` header or failed input validation | `{ "error": "<validation message>" }` | — |
| `429 Too Many Requests` | Sliding window limit exceeded (`100` req / `15m` per IP) | `{ "error": "Too many requests, please try again later." }` | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| `500 Internal Server Error` | Missing `SECRET` env var, Redis failure, or unhandled exception | `{ "error": "Internal server error" }` | — |

---

## 5. Interactive Terminal Command Matrix

Implemented in [`src/utils/TerminalCommands.ts`](../../src/utils/TerminalCommands.ts) and hosted by [`src/components/Terminal.tsx`](../../src/components/Terminal.tsx):

| Category | Command | Description |
|---|---|---|
| **Secrets** | `generate secret` | Enters password-masked `phrase>` prompt, auto-generates 13-digit timestamp, and calls `POST /api/generate-secret` |
| **Local AI** | `ai chat` | Activates interactive Ollama chat mode (`You>` prompt); exit with `exit chat` |
| **Local AI** | `ai models` | Queries `http://localhost:11434/api/tags` to check available Ollama models |
| **Virtual FS** | `ls`, `cd`, `pwd`, `cat`, `mkdir`, `touch`, `rm` | Operates on an in-memory POSIX-like directory tree rooted at `/home/user` |
| **Execution** | `run [file]` | Evaluates string content of a virtual file as JavaScript |
| **Utilities** | `calc [expr]`, `echo [text]`, `date`, `whoami`, `uptime`, `uname`, `history`, `clear`, `help` | Built-in shell utilities and session inspection |

---

## 6. Synchronous vs. Asynchronous Boundaries

- **Synchronous UI Operations**: Tab switching (`Homepage`), passphrase strength checks (`Form`), virtual filesystem navigation (`TerminalCommands`), and clipboard copies (`Responsehistory`).
- **Asynchronous Network Operations**:
  - `POST /api/generate-secret` (client -> Next.js -> Upstash Redis -> Web Crypto 10,000-round loop).
  - `POST http://localhost:11434/api/generate` and `GET http://localhost:11434/api/tags` (client -> local Ollama).
- **No Background Workers / Queues**: All secret derivation and AI inference requests execute inline within their respective HTTP request/response lifecycles.
