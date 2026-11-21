# ADR-004: Multi-Modal Workspace (Form, Interactive Terminal, AI Chat)

| Metadata | Value |
|---|---|
| **Status** | `Accepted` |
| **Date** | 2026-11-22 |
| **Author(s)** | Core Engineering Team |
| **Deciders** | Lead Engineers |
| **Related Code** | `src/components/pages/Homepage.tsx`, `src/components/ui/form.tsx`, `src/components/Terminal.tsx`, `src/components/ai-chat.tsx` |

---

## 1. Context

Secret Key Generator serves a diverse audience of developers, DevOps engineers, and security practitioners who prefer different interaction paradigms:
- Visual users prefer structured forms with real-time passphrase strength checklists and one-click copy history.
- Power users prefer keyboard-driven CLI workflows with command history (`ArrowUp`/`ArrowDown`), tab completion, and password-masked prompts.
- Learners and operators want conversational AI guidance without switching browser tabs.

---

## 2. Decision

We will unify all three interaction paradigms inside a single-page Next.js App Router workspace (`src/components/pages/Homepage.tsx`) controlled by client-side tab state (`currentTab`):

1. **Form Tab (`form-tab`)**: Two-column layout pairing `Form` with the `Responsehistory` side panel, backed by `HistoryContext`.
2. **Terminal Tab (`terminal-tab`)**: Full-width interactive `Terminal` component backed by `TerminalCommands` (in-memory virtual FS + `generate secret` + `ai chat`) and `CommandHistory`.
3. **AI Chat Tab (`ai-chat-tab`)**: Full-width `AIChat` conversational interface connected to `AIService`.

All three panels remain mounted in the DOM (toggled via Tailwind `hidden`) so users do not lose in-progress terminal output, chat history, or form inputs when switching tabs.

---

## 3. Consequences

### Positive Impacts
- **State Preservation**: Keeping panels mounted preserves terminal sessions and AI chat conversations across tab switches without extra global state boilerplate.
- **Unified Security Backend**: Both Form Mode and Terminal Mode converge on the exact same `POST /api/generate-secret` contract.
- **Consistent Theming**: `next-themes` (`ThemeProvider` with `attribute="class"`) and Preline UI provide coherent light/dark styling across all three modes.

### Negative Impacts
- **Slightly Higher Initial Client Bundle**: All three modes load on the homepage route rather than being route-split across `/form`, `/terminal`, and `/chat`.
- **Disconnected History Stores**: Secrets generated via Terminal Mode are printed to `terminal-history` rather than added to `HistoryContext` / `Responsehistory`.

---

## 4. Alternatives Considered

1. **Separate Next.js Routes (`/form`, `/terminal`, `/chat`)**:
   - *Reason for rejection*: Navigating between routes unmounts client state (losing terminal sessions and active chat threads) unless lifted into persistent global stores.
2. **Pure Xterm.js PTY Terminal**:
   - *Reason for rejection*: While `@xterm/xterm` is present in `package.json`, a custom React terminal (`src/components/Terminal.tsx`) provided simpler integration with password-masked prompts, theme switching, and async Ollama callbacks without requiring a backend WebSocket PTY server.
