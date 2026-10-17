# Design: AI Helper for Discovery Wizard

## Approach
Add a Vercel serverless function (`api/suggest.ts`) that proxies to the Anthropic API using a server-side `ANTHROPIC_API_KEY`. The frontend never talks to Anthropic directly. On the client, suggestion state (loading/ready/error) is kept as local, per-question component state — not part of the persisted `Session` — so a suggestion never leaks into saved/exported data unless the user explicitly accepts it via the existing `onChange` handler already wired in `StageForm`. Validation and prompt-construction logic is split into small pure functions so it's unit-testable without needing a running serverless runtime.

## Components / Files

- `api/suggest.ts` — new. Vercel Node serverless function (`@vercel/node` types). Parses the request, calls `validateSuggestRequest`, calls `buildAnthropicMessages`, does the `fetch` to `https://api.anthropic.com/v1/messages` with `ANTHROPIC_API_KEY` from `process.env`, maps the result to `{ suggestion }` or `{ error }`. Covers AC9, AC11, AC12, AC15.
- `src/server/validateSuggestRequest.ts` — new, pure function: `(body: unknown) => { ok: true; data: SuggestRequestBody } | { ok: false; error: string }`. Checks `question` is a non-empty string (AC11); `contextAnswers` defaults to `{}` if absent.
- `src/server/buildAnthropicMessages.ts` — new, pure function: `(data: SuggestRequestBody) => AnthropicMessagesPayload`. Builds the system/user prompt instructing a concise first-person draft grounded in the given methodology, using only the supplied context answers (AC10).
- `src/lib/suggest.ts` — new, frontend: `requestSuggestion(payload: SuggestRequestBody): Promise<SuggestResult>` — `fetch('/api/suggest', ...)`, maps non-200/network errors to `{ ok: false, error }` (AC12). Also exports `buildContextAnswers(allAnswers: Answers): Record<string, string>` — flattens all four stages' answers, filtering out empty/unset ones (AC13).
- `src/components/SuggestionPanel.tsx` — new. Renders one question's suggestion lifecycle: idle (nothing shown), loading (spinner text, button disabled), ready (suggestion text + "Use this" / "Discard"), error (message + "Retry"). Covers AC3, AC4, AC5, AC7, AC12.
- `src/components/StageForm.tsx` — modified. Add `allAnswers: Answers` prop (full session, for context). For `type === 'text'` questions only, render a "Suggest" button and a `SuggestionPanel`, with local state `Record<questionId, SuggestionState>`. "Use this" calls the existing `onChange(questionId, suggestionText)` — no new answer-writing path. Covers AC1, AC2, AC6, AC8, AC14 (one in-flight request per question via the state machine's `loading` status blocking re-trigger).
- `src/components/Wizard.tsx` — modified, one line: pass `session.answers` as `allAnswers` to `StageForm`.

## Data / Interfaces

```ts
// shared shape, used by both src/lib/suggest.ts and src/server/validateSuggestRequest.ts
type SuggestRequestBody = {
  question: string
  grounding: string
  contextAnswers: Record<string, string>
}

type SuggestResult =
  | { ok: true; suggestion: string }
  | { ok: false; error: string }
```

```ts
// per-question client-side state, local to StageForm, never persisted
type SuggestionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; text: string }
  | { status: 'error'; message: string }
```

`api/suggest.ts` response body: `{ suggestion: string }` on success (200) or `{ error: string }` on failure (400 for bad input, 502 for upstream Anthropic failure, 500 if `ANTHROPIC_API_KEY` is unset).

## Edge Cases & Error Handling

- **AC11 (missing question)**: `validateSuggestRequest` rejects before any network call; handler returns 400 `{ error: "question is required" }`.
- **AC9 (key never client-side)**: key is read only inside `api/suggest.ts` via `process.env.ANTHROPIC_API_KEY`; if unset, handler returns 500 `{ error: "AI helper is not configured" }` instead of throwing — this is an operational edge case beyond the happy path in AC9.
- **AC12 (Anthropic failure/timeout/rate limit)**: `fetch` to Anthropic wrapped in try/catch with an AbortController timeout (10s); non-2xx or thrown error returns 502 `{ error: "..." }`; frontend's `SuggestionPanel` shows the error with a "Retry" button that re-triggers the same request.
- **AC13 (only non-empty context)**: `buildContextAnswers` filters any answer that is `undefined`, `null`, or empty after `.trim()` before it's ever sent.
- **AC14 (one in-flight request per question)**: `StageForm`'s suggestion state machine only allows triggering a new request when status is `idle`, `ready`, or `error` — not `loading` — and the button is `disabled` during `loading`, so no separate debounce timer is needed.
- **AC8 (no silent overwrite)**: the suggestion lives in local component state keyed separately from `answers`; it's only written into `answers` on explicit "Use this" click, which calls the same `onChange` the textarea already uses.
- **Network/CORS**: `api/suggest.ts` is same-origin (Vercel serves `/api/*` alongside the static site), so no CORS configuration is needed.

## Out of Scope
- Suggestions for `select`-type questions (per requirements.md Scope).
- Streaming responses — suggestion is returned as one complete string.
- Caching/reusing suggestions across sessions or questions.
- Any UI for editing the underlying prompt or choosing a model — model is fixed server-side.
- Rate-limiting or per-user quotas beyond the single-in-flight-per-question guard.
