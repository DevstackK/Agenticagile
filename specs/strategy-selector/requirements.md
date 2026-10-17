# Requirements: Strategy Selector

## User Story
As a user reviewing a generated Requirements Draft, I want each Story to come with an AI-recommended development strategy (spec-driven-dev, TDD, Plan Mode, or vibe-coding) and a short rationale, so that whoever picks up the story already knows which approach fits its risk/ambiguity before starting work.

## Scope
Extends the existing Requirements Draft feature (`specs/requirements-draft/`) — no new screen, no new serverless endpoint. The strategy and rationale are produced by Claude as part of the *same* `api/draft-requirements.ts` generation call that already produces the Initiative/Epics/Stories structure. No manual override UI in this version — the recommendation is AI-only, matching the chosen scope (manual per-story dropdown is explicitly out of scope here).

## Acceptance Criteria

### Generation
1. WHEN `api/draft-requirements.ts` generates a Story THEN the system SHALL include a `strategy` field whose value is one of `"spec-driven-dev"`, `"tdd"`, `"plan-mode"`, `"vibe-coding"`, and a `strategyRationale` field containing one sentence explaining the choice.
2. WHEN the prompt instructs Claude on how to choose a strategy THEN it SHALL state the heuristic: well-understood and cheap to redo favors `plan-mode`/`vibe-coding`; ambiguous, expensive, or shared-impact favors `spec-driven-dev`/`tdd`.
3. THE system SHALL NOT make a second AI or network call to produce the strategy recommendation — it is part of the single existing generation request.

### Validation
4. IF a generated Story's `strategy` value is missing or not one of the four allowed values THEN the system SHALL treat the entire draft as invalid, using the same existing error-handling path as any other malformed AI response (generic error message, "Retry" action, no partial draft rendered).
5. IF a generated Story's `strategyRationale` is missing or empty THEN the system SHALL treat the entire draft as invalid, same as AC4.

### Display
6. WHEN the Requirements Draft preview renders a Story THEN the system SHALL display its recommended strategy and rationale alongside that story's user story and acceptance criteria.

### Export
7. WHEN a user exports the draft as Markdown THEN the system SHALL include each story's recommended strategy and rationale under that story's section.
8. WHEN a user exports the draft as Jira CSV THEN the system SHALL include each story's recommended strategy and rationale as part of that story's row, without breaking the existing CSV structure or escaping rules.
