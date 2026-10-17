# Tasks: Strategy Selector

- [x] Add `STRATEGIES` const and extend `StorySchema` with `strategy`/`strategyRationale` in `api/_lib/requirementsDraftSchema.ts` (design.md: Data/Interfaces, AC1, AC4, AC5).
- [x] Update `api/_lib/requirementsDraftSchema.test.ts`: a valid story with a valid strategy passes, an invalid strategy value is rejected, a missing/empty `strategyRationale` is rejected.
- [x] Update `api/_lib/buildDraftPrompt.ts` — add `strategy`/`strategyRationale` to `JSON_SHAPE_EXAMPLE` and the heuristic instruction paragraph to the system prompt (AC2, AC3).
- [x] Update `api/_lib/buildDraftPrompt.test.ts`: system prompt mentions all four strategy names and the heuristic wording (e.g. "cheap to redo", "ambiguous").
- [x] Update `toJiraCsv()` in `src/lib/requirementsDraft.ts` — add `Strategy`/`Strategy Rationale` columns to the header, empty on Epic rows, populated on Story rows (AC8).
- [x] Update `toDraftMarkdown()` in `src/lib/requirementsDraft.ts` — append a "Recommended Strategy" line per story (AC7).
- [x] Update `src/lib/requirementsDraft.test.ts`: CSV header includes the two new columns, a story row includes its strategy and rationale, Markdown output includes the "Recommended Strategy" line.
- [x] Update `src/components/RequirementsDraftPanel.tsx` — render each story's strategy and rationale in the preview (AC6).
- [ ] Manual verification: on the deployed app (or `vercel dev` locally), generate a Requirements Draft, confirm each story's preview shows a recommended strategy and rationale, export CSV and confirm the two new columns are populated correctly for stories and empty for epics, export Markdown and confirm the strategy line appears under each story.
