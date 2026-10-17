# Tasks: Generate Requirements Draft

- [x] Define `api/_lib/requirementsDraftSchema.ts` — zod `StorySchema`/`EpicSchema`/`RequirementsDraftSchema` and exported `RequirementsDraft` type (design.md: Data/Interfaces, AC4, AC5, AC6).
- [x] Write unit tests for `requirementsDraftSchema.ts`: valid draft passes, epic with zero stories rejected, story with zero acceptance criteria rejected, missing initiative title rejected.
- [x] Implement `api/_lib/validateDraftRequest.ts` — hand-rolled validation of the four-stage answers body (no zod, matching `validateSuggestRequest.ts` style).
- [x] Write unit tests for `validateDraftRequest.ts`: valid body passes, missing a stage key rejected, non-string values in a stage filtered/rejected.
- [x] Implement `api/_lib/buildDraftPrompt.ts` — pure function building the Anthropic prompt instructing JSON-only Initiative/Epics/Stories output (AC4, AC5).
- [x] Write unit tests for `buildDraftPrompt.ts`: output includes the answers content and explicit JSON-schema instructions.
- [x] Implement `api/draft-requirements.ts` — handler wiring validate → build prompt → Anthropic fetch (20s timeout) → JSON.parse → schema validation → response mapping (AC2, AC3, AC6, AC12, AC13).
- [x] Implement `src/lib/requirementsDraft.ts` — `requestRequirementsDraft()` fetch wrapper, `csvEscape()`, `toJiraCsv()`, `toDraftMarkdown()` (AC9, AC10, AC11).
- [x] Write unit tests for `csvEscape()`: fields with commas, quotes, and newlines are correctly escaped/quoted.
- [x] Write unit tests for `toJiraCsv()`: produces one Epic row and one Story row per story with correct Issue Type and Epic Link values.
- [x] Write unit tests for `toDraftMarkdown()`: produces nested Initiative/Epic/Story headings with user story and acceptance criteria list.
- [x] Build `src/components/RequirementsDraftPanel.tsx` — idle/loading/ready/error state machine, preview rendering, Export CSV/Markdown/Regenerate/Back actions (AC1, AC3, AC7, AC8, AC9, AC10, AC12, AC13).
- [x] Modify `src/components/BriefExport.tsx` — render `RequirementsDraftPanel` alongside existing brief export actions, passing `session.answers`.
- [ ] Manual verification: on the deployed app (or `vercel dev` locally), complete a brief, click "Generate Requirements Draft", confirm the preview shows Initiative/Epics/Stories with acceptance criteria, export both CSV and Markdown and inspect their contents, click "Regenerate" and confirm a new draft replaces the old one, and confirm a simulated failure (e.g. temporarily bad endpoint) shows the error/Retry state without losing the brief's answers.
