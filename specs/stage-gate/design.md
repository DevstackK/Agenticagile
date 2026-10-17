# Design: Stage Gate (Business Case → User Research)

## Approach
Add a `stageGate` field to the session schema (zod, with a `.default()` so existing saved sessions without it still load — AC16's persistence must not break old sessions). The gate itself is a local view flag in `Wizard.tsx` (`showGate: boolean`), not a persisted "current screen" — only the gate's *data* (deck URL, send confirmation, decision) is persisted, matching how the rest of the wizard already persists answers but not navigation chrome. Two new serverless functions follow the exact pattern already established by `api/suggest.ts` / `api/draft-requirements.ts`: validate → call external API → map errors → respond. Gamma's Generate API is asynchronous (create a generation, poll for completion), so `api/generate-deck.ts` polls internally within its own request lifetime rather than pushing polling logic to the client.

## Components / Files

- `src/lib/schema.ts` — modified. Add `StageGateSchema` (`status: 'pending'|'approved'|'rejected'`, `deckUrl`, `deckGeneratedAt`, `sentTo`, `sentAt`, `decidedAt` — all nullable strings) with `.default(...)` to the whole field on `SessionSchema`, so `loadSession()` on an older persisted session (AC16, backward compatibility) still validates. `createEmptySession` sets the default explicitly for clarity.
- `api/_lib/buildDeckOutline.ts` — new, pure function: `(businessCaseAnswers: Record<string,string>) => string`. Turns the Q&A pairs into a plain-text outline (question as a heading-style line, answer below) suitable for Gamma's `inputText`. Covers AC5.
- `api/_lib/gammaClient.ts` — new. `createGeneration(apiKey, { inputText, title }): Promise<{ generationId: string }>` and `pollGeneration(apiKey, generationId): Promise<{ status: 'completed'|'failed'|'pending'; gammaUrl?: string }>`, talking to `https://public-api.gamma.app/v1.0/generations` (`X-API-KEY` header, `POST` to create, `GET /{id}` to poll) per Gamma's documented Generate API.
- `api/generate-deck.ts` — new handler: validates `{ businessCase: Record<string,string> }` → builds outline → `createGeneration` → polls `pollGeneration` every 2s up to a ~55s budget (`maxDuration: 60`, matching `draft-requirements.ts`'s pattern) → returns `{ deckUrl }` on `completed`, or a mapped error on `failed`/timeout/missing `GAMMA_API_KEY`. Covers AC5, AC6, AC7.
- `api/_lib/validateSendDeckEmailRequest.ts` — new, hand-rolled validation (same style as `validateSuggestRequest.ts`): `to` is a non-empty string matching a basic email regex, `deckUrl` is a non-empty string. Covers AC10.
- `api/send-deck-email.ts` — new handler: validates body → `POST https://api.resend.com/emails` (`Authorization: Bearer RESEND_API_KEY`) with a simple HTML body containing the deck link → returns `{ sentAt }` on success or a mapped error (missing key, Resend non-2xx, timeout). Covers AC11, AC12.
- `src/lib/stageGate.ts` — new, frontend: `requestGenerateDeck(businessCaseAnswers)`, `requestSendDeckEmail(to, deckUrl)` fetch wrappers (same `{ok:true,...}|{ok:false,error}` shape as `suggest.ts`/`requirementsDraft.ts`); `isValidEmail(value): boolean` pure helper.
- `src/components/StageGate.tsx` — new. Props: `{ stageGate: StageGate; businessCaseAnswers: Record<string,string>; onUpdate: (patch: Partial<StageGate>) => void; onContinue: () => void; onBackToForm: () => void }`. Owns local async-action state for "generate" and "send" (`idle|loading|error`, mirroring `SuggestionPanel`'s pattern); renders the deck-generation action, the email input + send action (disabled until a valid email AND a deck exists), the Approve/Not Approved buttons, a status summary (decision, who it was sent to and when), and "Continue to User Research" (enabled only when `status === 'approved'`) plus "Back to Business Case" (`onBackToForm`). Covers AC1–AC4, AC9, AC10, AC13–AC15.
- `src/components/Wizard.tsx` — modified. Add `showGate` boolean state. `goNext()`: when on Stage 1 (index 0) and required answers are complete, set `showGate = true` instead of incrementing `activeStageIndex` (AC1). `goBack()`: when on Stage 2 (index 1), decrement to index 0 **and** set `showGate = true` (lands back on the gate, not the raw form — AC4). Render `StageGate` when `showGate` is true, passing `session.stageGate` and an `onUpdate` that patches `session.stageGate` (autosaved via the existing debounced-save effect — AC16). `onContinue` sets `showGate = false` and increments `activeStageIndex`. `onBackToForm` sets `showGate = false` without changing `activeStageIndex`, returning to the Stage 1 form for editing.

## Data / Interfaces

```ts
// src/lib/schema.ts
const StageGateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  deckUrl: z.string().nullable(),
  deckGeneratedAt: z.string().nullable(),
  sentTo: z.string().nullable(),
  sentAt: z.string().nullable(),
  decidedAt: z.string().nullable(),
}).default({
  status: 'pending', deckUrl: null, deckGeneratedAt: null, sentTo: null, sentAt: null, decidedAt: null,
})
// SessionSchema gains: stageGate: StageGateSchema
export type StageGate = z.infer<typeof StageGateSchema>
```

```ts
// api/_lib/gammaClient.ts
type CreateGenerationResult = { generationId: string }
type PollGenerationResult = { status: 'completed' | 'failed' | 'pending'; gammaUrl?: string }
```

```ts
// src/lib/stageGate.ts
type DeckResult = { ok: true; deckUrl: string } | { ok: false; error: string }
type SendResult = { ok: true; sentAt: string } | { ok: false; error: string }
```

## Edge Cases & Error Handling

- **AC7 (deck generation failure/timeout)**: `api/generate-deck.ts` wraps the create+poll sequence in try/catch with an overall `AbortController`-driven budget; a `failed` Gamma status, a thrown error, or exceeding the poll budget all map to one clear 502 error. `StageGate`'s generate action shows that message with "Retry" — Stage 1 answers live in `session.answers`, untouched by this flow.
- **AC8 (regenerating resets approval)**: `StageGate`'s "Generate Executive Deck" handler, on success, calls `onUpdate({ deckUrl, deckGeneratedAt, status: 'pending', decidedAt: null })` — it always resets status, even if the previous status was `approved`, so an approval can never silently apply to different content.
- **AC10 (email validation)**: `isValidEmail` (simple `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` check) gates the "Send to Exec" button's enabled state and is re-checked server-side in `validateSendDeckEmailRequest.ts` as defense in depth.
- **AC12 (send failure keeps deck)**: `sentTo`/`sentAt` are only patched into `stageGate` on a successful Resend response; a failure leaves `deckUrl` untouched, so the user can retry sending without regenerating.
- **AC13 (approval independent of sending)**: Approve/Not Approved buttons are always enabled once a deck exists — sending to an exec is a convenience action, not a precondition, per requirements.md's explicit wording.
- **AC16 (backward-compatible persistence)**: `StageGateSchema`'s `.default(...)` means `loadSession()` on a session saved before this feature shipped still parses successfully, backfilling a fresh `pending` gate rather than failing to load (this is the one acceptance criterion with a real regression risk, since it changes a schema already deployed and in use).
- **Local-only "gate view" flag**: `showGate` is plain `useState` in `Wizard.tsx`, not written into the session. A hard page reload while viewing the gate screen (as opposed to in-app Back navigation) will show the Stage 1 form again rather than the gate — the underlying deck/decision data is still intact and visible once the user clicks "Next" again, so no data is lost, only the currently-open screen isn't restored. This is a conscious scope boundary, not a bug, since AC4 only specifies in-app back-navigation.

## Out of Scope
- Token-based email-click approval (approval is always a manual in-app action, per requirements.md Scope).
- Stage gates between any other stages (2→3, 3→4) — this spec only inserts one gate, after Stage 1.
- Editing/regenerating the outline text sent to Gamma, or choosing a Gamma theme/template — fixed defaults for this version.
- Notifying anyone when a decision is recorded (no "you've been approved" email back to the requester).
