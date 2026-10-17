# Tasks: AI Helper for Discovery Wizard

- [x] Install `@vercel/node` as a dev dependency for serverless function types.
- [x] Define shared `SuggestRequestBody`/`SuggestResult` types in `src/lib/suggest.ts` (design.md: Data/Interfaces).
- [x] Implement `src/server/validateSuggestRequest.ts` — pure validation function (AC11).
- [x] Write unit tests for `validateSuggestRequest.ts`: valid body passes, missing `question` rejected, missing `contextAnswers` defaults to `{}`.
- [x] Implement `src/server/buildAnthropicMessages.ts` — pure prompt-building function (AC10).
- [x] Write unit tests for `buildAnthropicMessages.ts`: output includes the question, the grounding methodology, and only the provided context answers.
- [x] Implement `api/suggest.ts` — Vercel serverless handler wiring validation → prompt build → Anthropic fetch (with AbortController timeout) → response mapping (AC9, AC11, AC12, AC15).
- [x] Implement `src/lib/suggest.ts` frontend fetch wrapper `requestSuggestion()` and `buildContextAnswers()` (AC2, AC13).
- [x] Write unit tests for `buildContextAnswers()`: filters out empty/undefined answers across all four stages, keeps non-empty ones.
- [x] Build `src/components/SuggestionPanel.tsx` — idle/loading/ready/error states with Use this/Discard/Retry actions (AC3, AC4, AC5, AC7, AC12).
- [x] Modify `src/components/StageForm.tsx` — add `allAnswers` prop, render Suggest button + `SuggestionPanel` for text questions only, per-question suggestion state machine, "Use this" wired to existing `onChange` (AC1, AC6, AC8, AC14).
- [x] Modify `src/components/Wizard.tsx` — pass `session.answers` as `allAnswers` to `StageForm`.
- [x] Add `.env.example` documenting `ANTHROPIC_API_KEY` (not committed with a real value); confirm `.env*` is gitignored.
- [x] Manual verification: set a real `ANTHROPIC_API_KEY` locally, run `vercel dev` (or deployed preview), click Suggest on a text question, confirm loading state, confirm suggestion appears separately from the answer field, confirm "Use this" populates the answer and "Discard" clears the suggestion without touching the answer, confirm an invalid/missing key produces a visible inline error with Retry.
