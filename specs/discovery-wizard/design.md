# Design: Discovery Wizard (Agentic Agile)

## Approach
A single-page React + Vite + TypeScript app with no backend. All state lives in a `Session` object held in React state, auto-saved (debounced) to `localStorage`, and exportable/importable as JSON. Questions per stage are declared as static, typed data (not hardcoded JSX) so stage content, required-ness, and grounding labels stay in one place and are easy to extend later without touching rendering logic. Validation (required fields, session schema on import) uses `zod` so the same schema defines both TypeScript types and runtime validation — avoids drift between "what TS thinks a Session looks like" and "what we actually validate."

## Components / Files

- `package.json`, `vite.config.ts`, `tsconfig.json` — new, standard Vite+React+TS scaffold.
- `src/main.tsx` — new, app entry point.
- `src/App.tsx` — new, top-level: decides between "session picker" view and "wizard" view based on whether a session is active.
- `src/types/session.ts` — new, `Session` and `Answer` types, derived from the zod schema in `lib/schema.ts` (`z.infer`).
- `src/lib/schema.ts` — new, zod schema for `Session` (used for import validation and type inference). Covers AC19, AC20.
- `src/data/questions.ts` — new, static array of 4 stage definitions, each with its questions: `{ id, label, type: 'text' | 'select', options?, required, grounding }`. Encodes AC6–AC12.
- `src/lib/storage.ts` — new, `localStorage` CRUD for sessions: `listSessions()`, `loadSession(id)`, `saveSession(session)` (debounced wrapper), `deleteSession(id)`. Wraps all calls in try/catch for AC21/AC22.
- `src/lib/export.ts` — new, `toJSON(session)` and `toMarkdown(session)` pure functions, plus `downloadFile(filename, content)` helper. Covers AC17, AC18.
- `src/lib/importSession.ts` — new, reads a `File`, parses JSON, validates against `schema.ts`, returns `{ ok: true, session }` or `{ ok: false, error }`. Covers AC19, AC20.
- `src/components/ProgressIndicator.tsx` — new, renders the 4 stage names, highlights the active one. Covers AC2.
- `src/components/StageForm.tsx` — new, given a stage definition + current answers, renders inputs (text area or single-select) with grounding tooltip per question, flags missing required fields. Covers AC5, AC10, AC11, AC12.
- `src/components/Wizard.tsx` — new, owns the active `Session`, stage index, next/back navigation, triggers autosave on change. Covers AC1, AC3, AC4, AC13.
- `src/components/SessionList.tsx` — new, lists saved sessions (name + updatedAt), "resume", "new session" (prompts for name), "delete", "import file". Covers AC14, AC15, AC16, AC22.
- `src/components/BriefExport.tsx` — new, shown on stage 4 completion; renders the combined brief, export-as-JSON and export-as-Markdown buttons, and "export session for sharing" button. Covers AC16, AC17, AC18.
- `src/components/StorageWarningBanner.tsx` — new, shown when `storage.ts` reports localStorage is unavailable/full. Covers AC21.

## Data / Interfaces

```ts
// lib/schema.ts
const AnswerValue = z.union([z.string(), z.null()]);

const SessionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  activeStageIndex: z.number().min(0).max(3),
  answers: z.object({
    businessCase: z.record(z.string(), AnswerValue),
    userResearch: z.record(z.string(), AnswerValue),
    baRequirements: z.record(z.string(), AnswerValue),
    tradeoffs: z.record(z.string(), AnswerValue),
  }),
});
type Session = z.infer<typeof SessionSchema>;
```

```ts
// data/questions.ts
type Question = {
  id: string;              // key into answers.<stage>
  label: string;
  type: 'text' | 'select';
  options?: string[];      // required if type === 'select'
  required: boolean;
  grounding: string;       // e.g. "BABOK", "Jobs-to-be-Done / Opportunity Solution Trees"
};
type StageDefinition = {
  key: keyof Session['answers'];
  title: string;
  questions: Question[];
};
```

Storage key convention: `agentic-agile:sessions:<id>` for each session, plus `agentic-agile:session-index` (array of `{id, name, updatedAt}`) so `listSessions()` doesn't need to deserialize every session to show the list.

## Edge Cases & Error Handling

- **AC5 (block advance on missing required fields)**: `StageForm` computes missing required question ids on every render; `Wizard`'s "Next" button is disabled and shows an inline list of missing fields rather than a generic error.
- **AC12 (grounding visible)**: each question renders its `grounding` string as a small label under the question text (not hidden in a hover-only tooltip, so it's visible on mobile/touch too).
- **AC13 (autosave)**: `Wizard` debounces `saveSession` by 1.5s after the last keystroke using a `useRef`-held timeout, cleared/reset on each change, flushed immediately on stage navigation or tab close (`beforeunload`).
- **AC15/AC16 (session list, new session)**: starting a new session always generates a fresh `id` (`crypto.randomUUID()`); the current session is saved before switching, so "new session" never overwrites by construction.
- **AC19/AC20 (import validation)**: `importSession.ts` uses `SessionSchema.safeParse`; on failure, returns the zod error's first issue message in `error` — `SessionList` shows it without touching existing stored sessions (import only writes on success).
- **AC21 (storage unavailable/full)**: `storage.ts` wraps every `localStorage.setItem` in try/catch; on failure it sets an in-memory flag read by `App.tsx` to show `StorageWarningBanner`, but the in-memory `Session` state is untouched so the user can still use `BriefExport` to manually save their work.
- **AC22 (corrupted session)**: `loadSession(id)` wraps `JSON.parse` + `SessionSchema.safeParse` in try/catch; on failure, returns `{ ok: false }`, `SessionList` shows an inline error on that row with a "delete this session" action instead of crashing the whole list.

## Out of Scope
- Any backend/API, multi-user accounts, or real-time collaboration (sharing is file export/import only, per requirements.md scope).
- The strategy-selector and Claude Code execution handoff — this spec produces the brief; consuming it is a future spec.
- Editing/reordering the question set from the UI — questions are static data for now.
