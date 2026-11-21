# ADR-003: Direct Local Ollama Integration for AI Security Assistance

| Metadata | Value |
|---|---|
| **Status** | `Accepted` |
| **Date** | 2026-11-22 |
| **Author(s)** | Core Engineering Team |
| **Deciders** | Lead Engineers |
| **Related Code** | `src/services/ai-service.ts`, `src/components/ai-chat.tsx`, `src/components/ai-models.tsx`, `src/utils/TerminalCommands.ts` |

---

## 1. Context

Secret Key Generator includes an AI Security Assistant accessible from both the **AI Chat** tab and the **Interactive Terminal** (`ai chat`, `ai models`). Users frequently ask questions about key strength, cryptographic best practices, and troubleshooting in the same workspace where they generate sensitive secrets.

Sending prompts to third-party cloud LLM APIs (OpenAI, Anthropic, etc.) introduces:
- Privacy risk if users accidentally paste passphrases or secrets into the chat window.
- API key management overhead and per-token billing costs for self-hosted/local users.

---

## 2. Decision

We will integrate directly with a **local Ollama runtime** (`http://localhost:11434/api`) from the browser via `AIService` (`src/services/ai-service.ts`) and `TerminalCommands` (`src/utils/TerminalCommands.ts`):

- **Default Model**: `deepseek-r1:1.5b` (lightweight reasoning model runnable on standard developer laptops).
- **Endpoints Used**:
  - `POST http://localhost:11434/api/generate` (`stream: false`) for chat completions.
  - `GET http://localhost:11434/api/tags` for listing locally installed models.
- **Response Sanitization**: Strip `<think>` / `</think>` reasoning delimiters from DeepSeek-R1 output before displaying via simulated typewriter rendering in `AIChat`.

---

## 3. Consequences

### Positive Impacts
- **Zero Cloud Data Egress**: All AI prompts and responses stay strictly on `localhost`, minimizing accidental secret leakage to external AI vendors.
- **Zero API Cost**: Developers run inference locally with no paid API keys required.
- **Model Flexibility**: Any Ollama-compatible model installed locally can be selected via `AIService.setModel()`.

### Negative Impacts
- **CORS Configuration Required**: Because requests originate from the browser (`http://localhost:3000` -> `http://localhost:11434`), users must configure `OLLAMA_ORIGINS` (e.g., `OLLAMA_ORIGINS=http://localhost:3000 ollama serve`).
- **Localhost-Only Availability**: AI features do not work for remote users accessing a cloud-deployed instance unless Ollama is running locally on the user's machine.
- **Hardcoded Base URL**: `http://localhost:11434/api` is currently hardcoded in both `AIService` and `TerminalCommands`.

### Risks & Mitigations
- **Risk**: `OLLAMA_ORIGINS=*` exposes local Ollama to arbitrary browser tabs.  
  **Mitigation**: Recommend scoping `OLLAMA_ORIGINS=http://localhost:3000` in documentation and consider a Next.js server-side proxy route in a future release.

---

## 4. Alternatives Considered

1. **Cloud LLM Providers (OpenAI / Gemini / Anthropic via Next.js API Route)**:
   - *Reason for rejection*: Introduces external data transmission risks for security-sensitive workflows and requires recurring API billing.
2. **In-Browser WebGPU LLM (WebLLM / Transformers.js)**:
   - *Reason for rejection*: High initial multi-gigabyte browser download and inconsistent WebGPU support across browsers.
