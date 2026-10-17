# Design: Generate Requirements Draft

## Approach
Mirror the existing AI-helper pattern: a new Vercel serverless function (`api/draft-requirements.ts`) proxies to Anthropic, instructed to return only JSON matching an Initiative→Epics→Stories schema. The schema is defined once, server-side, as a zod schema in `api/_lib/requirementsDraftSchema.ts` and used to validate Claude's JSON response before it's ever sent to the client (AC6, AC13) — the frontend never has to re-validate untrusted AI output, only render an already-guaranteed-valid structure. To avoid repeating the ESM/CJS cross-boundary bug fixed in the AI-helper feature, the frontend imports only the **type** (`import type`, erased at compile time) from that schema file — no runtime value ever crosses the `api/` ↔ `src/` boundary. Generation (`buildDraftPrompt` → Anthropic call → schema validation) is kept as a separable pure/IO pipeline from delivery (CSV/Markdown formatting in `src/lib/requirementsDraft.ts`), satisfying AC14: a future Jira API integration would call the same generation endpoint and consume the same `RequirementsDraft` shape, swapping only the delivery step.

## Components / Files

- `api/_lib/requirementsDraftSchema.ts` — new. Zod schema: `StorySchema` (title, userStory{role,capability,benefit}, acceptanceCriteria: non-empty string array), `EpicSchema` (title, description, stories: non-empty array of Story), `RequirementsDraftSchema` (initiative{title,description}, epics: non-empty array of Epic). Exports `RequirementsDraft` type via `z.infer`. Covers AC4, AC5, AC6.
- `api/_lib/validateDraftRequest.ts` — new. Hand-validates the incoming request body is an object with the four known stage keys (`businessCase`, `userResearch`, `baRequirements`, `tradeoffs`), each a string-record — same hand-rolled style as `validateSuggestRequest.ts` (no zod import needed, no cross-boundary value import). Covers request-shape validation ahead of AC2.
- `api/_lib/buildDraftPrompt.ts` — new. Pure function: `(answers) => AnthropicMessagesPayload`. System prompt instructs Claude to return *only* a JSON object matching the described Initiative/Epics/Stories/acceptance-criteria shape (with an inline example), using the brief's answers as source material. Covers AC4, AC5.
- `api/draft-requirements.ts` — new. Handler: validates body → builds prompt → calls Anthropic (20s timeout, same AbortController pattern as `api/suggest.ts`) → `JSON.parse`s the response text → `RequirementsDraftSchema.safeParse`s it → returns `{ draft }` (200) or `{ error }` (400/500/502). Covers AC2, AC3 (server half), AC6, AC12, AC13.
- `src/lib/requirementsDraft.ts` — new, frontend: `requestRequirementsDraft(answers: Answers): Promise<DraftResult>` (fetch wrapper, same shape as `requestSuggestion`); `toJiraCsv(draft): string` and `toDraftMarkdown(draft): string` (pure formatting functions); `csvEscape(value: string): string` helper (RFC4180 quoting). Imports `RequirementsDraft` as `import type` only. Covers AC9, AC10, AC11.
- `src/components/RequirementsDraftPanel.tsx` — new. Owns a state machine `idle | loading | ready{draft} | error{message}`. Idle renders the trigger button (AC1); loading disables it (AC3); ready renders the Initiative/Epics/Stories preview plus "Export CSV", "Export Markdown", "Regenerate", and "Back" actions (AC7, AC8, AC9, AC10); error renders the message + "Retry" (AC12, AC13).
- `src/components/BriefExport.tsx` — modified. Adds a `RequirementsDraftPanel` section below the existing brief exports, passing `session.answers` — existing JSON/Markdown/session-export buttons are untouched (AC1's "alongside", not replacing).

## Data / Interfaces

```ts
// api/_lib/requirementsDraftSchema.ts
const StorySchema = z.object({
  title: z.string().min(1),
  userStory: z.object({
    role: z.string().min(1),
    capability: z.string().min(1),
    benefit: z.string().min(1),
  }),
  acceptanceCriteria: z.array(z.string().min(1)).min(1),
})
const EpicSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  stories: z.array(StorySchema).min(1),
})
const RequirementsDraftSchema = z.object({
  initiative: z.object({ title: z.string().min(1), description: z.string().default('') }),
  epics: z.array(EpicSchema).min(1),
})
type RequirementsDraft = z.infer<typeof RequirementsDraftSchema>
```

```ts
// src/lib/requirementsDraft.ts
type DraftResult = { ok: true; draft: RequirementsDraft } | { ok: false; error: string }
```

Request body to `POST /api/draft-requirements`: the session's `Answers` object (`{ businessCase, userResearch, baRequirements, tradeoffs }`, each `Record<string,string>`) — the same shape already defined in `src/lib/schema.ts`, sent as plain JSON (no shared runtime import needed since it's just data, not a schema value).

Jira CSV columns: `Issue Type, Summary, Description, Epic Name, Epic Link` — one row per Epic (`Issue Type=Epic`, `Epic Name=<epic title>`, `Epic Link` blank) and one row per Story (`Issue Type=Story`, `Summary=<story title>`, `Description=<user story> + blank line + "Acceptance Criteria:" + numbered list>`, `Epic Link=<parent epic title>`) — matching Jira's documented CSV-importer convention of linking stories to epics by Epic Name text match.

## Edge Cases & Error Handling

- **AC6/AC13 (malformed AI output)**: `draft-requirements.ts` wraps `JSON.parse` in try/catch (catch → 502 "AI helper returned an unexpected response") and separately runs `RequirementsDraftSchema.safeParse` on success (failure → same 502 message) — the frontend only ever receives a validated draft or a clean error, never a partial structure.
- **AC3 (no duplicate in-flight requests)**: `RequirementsDraftPanel`'s button is only clickable in `idle`/`ready`/`error` states, disabled during `loading` — identical pattern to `SuggestionPanel`.
- **AC8 (regenerate discards current preview)**: "Regenerate" transitions straight back to `loading` (new request), overwriting the previous `ready` state only on receipt of a new result — if the new request fails, the old draft is already gone (acceptable per AC8's "discarding the current preview" wording) and the error state is shown.
- **AC11 (CSV escaping)**: `csvEscape` wraps any field containing `,`, `"`, or `\n` in double quotes and doubles internal `"` characters per RFC4180; every CSV field goes through it, including titles and descriptions.
- **AC12 (network/timeout failure preserves answers)**: the draft-generation flow never mutates `session`/`answers` — it's a read-only side panel — so a failed request can't lose the user's brief regardless of outcome.
- **Long generation time**: Anthropic call timeout is set to 20s (longer than the single-answer `api/suggest.ts`'s 10s) since generating a full Initiative/Epic/Story tree is a larger completion.

## Out of Scope
- Any real Jira API calls (issue creation) — export files only, per requirements.md Scope.
- Editing the generated draft in the UI before export (title/AC text is fixed once generated; "Regenerate" is the only correction mechanism).
- Custom Jira field mapping beyond Issue Type/Summary/Description/Epic Name/Epic Link (no story points, priority, labels, etc.).
- Persisting the generated draft to `localStorage` or including it in the session export — it's a read-only derived artifact of the brief, regenerable on demand.
