# Requirements: Generate Requirements Draft

## User Story
As a user who has completed the Discovery Wizard, I want to generate an Initiative → Epics → Stories breakdown from my brief with EARS acceptance criteria per story, so that I can export it into Jira (or any wiki/information radiator) instead of manually translating the brief into a backlog.

## Scope
Adds a new action on the existing brief-completion screen (alongside the current JSON/Markdown brief export — this does not replace it). Generation uses the same Claude/Anthropic serverless-function pattern as the AI helper (`api/suggest.ts` / `api/_lib/`). Output is downloadable as a Jira-importable CSV and as Markdown; no direct Jira API calls in this spec. The generation logic (brief → Initiative/Epics/Stories structure) must be architecturally separable from delivery (CSV/Markdown export) so a future direct Jira API integration can reuse the same generated structure without rework.

## Acceptance Criteria

### Triggering generation
1. WHEN a user reaches the completed-brief screen THEN the system SHALL show a "Generate Requirements Draft" action alongside the existing brief export actions.
2. WHEN a user clicks "Generate Requirements Draft" THEN the system SHALL send the full discovery brief (all four stages' answers) to a new serverless endpoint and show a loading state.
3. WHILE generation is in flight THEN the system SHALL disable repeat clicks on the action until it resolves.

### Structure of the generated draft
4. WHEN generation succeeds THEN the system SHALL receive a structure consisting of exactly one Initiative, one or more Epics under it, and one or more Stories under each Epic.
5. WHEN a Story is generated THEN it SHALL include a title, a user story in "As a / I want / so that" form, and one or more EARS-style ("WHEN/IF ... THEN the system SHALL ...") acceptance criteria.
6. IF the serverless endpoint returns a structure missing any required field (Initiative title, an Epic with zero Stories, a Story with zero acceptance criteria) THEN the frontend SHALL treat it as a generation error rather than rendering a partial/broken draft.

### Preview
7. WHEN a draft is successfully generated THEN the system SHALL display a preview showing the Initiative, its Epics, and each Epic's Stories with their acceptance criteria, before any export happens.
8. WHEN a user is viewing the preview THEN the system SHALL offer a "Regenerate" action that re-requests a draft (discarding the current preview) and a way to return to the brief screen without exporting.

### Export
9. WHEN a user exports the draft as CSV THEN the system SHALL produce a Jira-importable CSV with one row per Epic and one row per Story, correct Issue Type values, and an Epic-to-Story linkage column.
10. WHEN a user exports the draft as Markdown THEN the system SHALL produce a nested document (Initiative heading, Epic subheadings, Story sections with user story and acceptance criteria list).
11. IF a generated field contains a comma, quote, or newline THEN the CSV export SHALL escape it correctly so the file remains valid CSV.

### Error handling
12. IF the serverless endpoint call fails (network error, timeout, upstream error) THEN the system SHALL show an inline error with a "Retry" action and SHALL NOT discard the user's completed brief/answers.
13. IF the AI response cannot be parsed into the expected structure (AC6) THEN the system SHALL show the same error/Retry treatment as a failed call, not a partially-rendered draft.

### Architecture (non-functional, verified via design.md)
14. The draft-generation logic SHALL be implemented as a pure function/module that takes brief answers and returns the Initiative/Epic/Story structure, independent of how that structure is later exported or delivered, so a future Jira API integration can consume the same output.
