# Design: Strategy Selector

## Approach
Extend the existing `StorySchema` with two new required fields (`strategy`, `strategyRationale`) and update the existing prompt in `buildDraftPrompt.ts` to instruct Claude to produce them alongside everything it already generates. Because validation already runs through `RequirementsDraftSchema.safeParse` in `api/draft-requirements.ts` before any response reaches the client, a missing/invalid strategy automatically fails the same way any other malformed field already does — no new error-handling code is needed in the handler itself (AC4, AC5). The only new work is: the schema fields, the prompt instructions, and surfacing the fields in the frontend (preview + both exports).

## Components / Files

- `api/_lib/requirementsDraftSchema.ts` — modified. Add `export const STRATEGIES = ['spec-driven-dev', 'tdd', 'plan-mode', 'vibe-coding'] as const` and extend `StorySchema` with `strategy: z.enum(STRATEGIES)` and `strategyRationale: z.string().min(1)`. Covers AC1, AC4, AC5.
- `api/_lib/buildDraftPrompt.ts` — modified. `JSON_SHAPE_EXAMPLE` gains `"strategy": "spec-driven-dev|tdd|plan-mode|vibe-coding"` and `"strategyRationale": "string"` on the story shape; the `system` prompt string gains one new instruction paragraph stating the heuristic (well-understood/cheap-to-redo → `plan-mode`/`vibe-coding`; ambiguous/expensive/shared-impact → `spec-driven-dev`/`tdd`). Covers AC2, AC3 (no new call — same `buildDraftPrompt` output feeds the one existing `fetch` in `api/draft-requirements.ts`, untouched).
- `src/lib/requirementsDraft.ts` — modified. `toJiraCsv`: header row gains two columns (`Strategy`, `Strategy Rationale`); Epic rows get empty values for both; Story rows append `story.strategy` and `story.strategyRationale` (both already run through the existing `csvEscape`, so AC8's "without breaking...escaping rules" is automatic — same function, two more call sites). `toDraftMarkdown`: after the acceptance-criteria list, append a `**Recommended Strategy:** {strategy} — {strategyRationale}` line per story. Covers AC6 (frontend type picks up the new fields automatically via `RequirementsDraft` type import), AC7, AC8.
- `src/components/RequirementsDraftPanel.tsx` — modified. In the per-story preview block (after the acceptance-criteria `<ol>`), render the strategy and rationale, e.g. `<p><strong>Recommended strategy:</strong> {story.strategy} — {story.strategyRationale}</p>`. Covers AC6.

## Data / Interfaces

```ts
// api/_lib/requirementsDraftSchema.ts
export const STRATEGIES = ['spec-driven-dev', 'tdd', 'plan-mode', 'vibe-coding'] as const

export const StorySchema = z.object({
  title: z.string().min(1),
  userStory: z.object({ role: z.string().min(1), capability: z.string().min(1), benefit: z.string().min(1) }),
  acceptanceCriteria: z.array(z.string().min(1)).min(1),
  strategy: z.enum(STRATEGIES),
  strategyRationale: z.string().min(1),
})
```

Jira CSV header becomes: `Issue Type,Summary,Description,Epic Name,Epic Link,Strategy,Strategy Rationale`.

## Edge Cases & Error Handling

- **AC4/AC5 (invalid/missing strategy or rationale)**: handled entirely by `RequirementsDraftSchema.safeParse` already failing in `api/draft-requirements.ts` — no new code path. The existing `console.error('draft-requirements: schema validation failed', ...)` diagnostic and 502 response cover this automatically, same as today's "epic with zero stories" case.
- **AC3 (no second AI call)**: verified by construction — the strategy fields are part of the single JSON object Claude already returns in one `fetch` call; there is nowhere in the design a second network call could be introduced.
- **CSV column ordering**: the two new columns are appended at the end of the header and every row, so any existing Jira import mapping a user has already configured against the first five columns is unaffected (AC8's "without breaking the existing CSV structure").
- **Backward compatibility of old drafts**: drafts are never persisted (per `requirements-draft`'s own Out of Scope — regenerable on demand), so there is no stored data to migrate; every newly generated draft simply includes the new fields.

## Out of Scope
- Any manual UI to override or re-pick a story's strategy (per requirements.md Scope — AI-recommendation only in this version).
- Applying a strategy recommendation at the Epic or Initiative level — this is per-Story only.
- Linking the recommended strategy to actually launching `/spec-driven-dev` or any other skill automatically — this spec only surfaces the recommendation in the draft and its exports.
