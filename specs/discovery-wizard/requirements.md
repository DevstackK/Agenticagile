# Requirements: Discovery Wizard (Agentic Agile)

## User Story
As a BA/PM/founder kicking off a new initiative, I want a guided four-stage discovery wizard (Business Case → User Research → BA Requirements → Trade-off Analysis), so that I capture a validated, structured brief before any requirements or build work starts, and can save/resume/share that brief with my team.

## Scope
Front-end only for this spec: a wizard UI that walks a user through the four stages, persists progress, and produces a structured brief (JSON + readable export). No backend API, no strategy-selector, no Claude Code integration yet — those are later specs. Persistence for this spec is local (browser storage) plus file export/import, which is the "sharing" mechanism until a real backend exists.

## Acceptance Criteria

### Navigation & structure
1. WHEN a user starts a new discovery session THEN the system SHALL present four stages in order: Business Case Discovery, User Research, BA Requirements Elicitation, Trade-off Analysis.
2. WHEN a user is on any stage THEN the system SHALL show a progress indicator naming all four stages and which one is active.
3. WHEN a user completes a stage's required questions THEN the system SHALL allow advancing to the next stage.
4. WHEN a user is on stage 2, 3, or 4 THEN the system SHALL allow navigating back to a previous stage without losing entered data.
5. IF a user has not answered all required questions on a stage THEN the system SHALL block advancing and SHALL indicate which fields are missing.

### Question content per stage
6. WHEN a user is on the Business Case Discovery stage THEN the system SHALL present questions covering: problem statement, cost of inaction, build/buy/do-nothing decision, sponsor and success metric, budget/timeline constraints, and urgency driver.
7. WHEN a user is on the User Research stage THEN the system SHALL present questions covering: user types and volume, current workflow/pain point, job-to-be-done, usage context/environment, and what's actually broken today.
8. WHEN a user is on the BA Requirements stage THEN the system SHALL present questions covering: functional requirements, non-functional requirements (scale, latency, uptime), data (type, residency, ownership), integrations, security/compliance regime, and organizational constraints (existing vendor, team skills).
9. WHEN a user is on the Trade-off Analysis stage THEN the system SHALL present questions covering: build vs. buy vs. extend, platform/vendor choice trade-offs, architecture pattern trade-offs, speed vs. maintainability, and lock-in risk vs. time saved.
10. WHEN a user answers a free-text question THEN the system SHALL accept multi-line text input.
11. WHEN a question supports a known fixed set of answers (e.g. build/buy/do-nothing) THEN the system SHALL render it as a single-select control.
12. WHEN a question is displayed THEN the system SHALL show which methodology it is grounded in (Lean Inception for Business Case questions, Jobs-to-be-Done/Opportunity Solution Trees for User Research questions, BABOK for BA Requirements questions, Architecture Decision Records/TCO analysis for Trade-off questions), via a visible label or tooltip.

### Persistence
13. WHEN a user types into any field THEN the system SHALL auto-save the current session to local browser storage within a few seconds, without requiring an explicit save action.
14. WHEN a user reloads the app THEN the system SHALL offer to resume the most recent in-progress session if one exists.
15. WHEN a user has multiple sessions saved THEN the system SHALL list them (by name + last-updated date) and allow opening any one.
16. WHEN a user wants to start a new session while one is in progress THEN the system SHALL prompt for a session name and SHALL not overwrite the existing session.

### Output / sharing
17. WHEN a user completes stage 4 THEN the system SHALL generate a structured brief combining all four stages' answers.
18. WHEN a structured brief is generated THEN the system SHALL allow exporting it as a JSON file and as a readable Markdown file.
19. WHEN a user wants to share a session with a teammate THEN the system SHALL allow exporting the full session (all stages, including in-progress ones) as a JSON file that another instance of the app can import.
20. WHEN a user imports a previously exported session JSON file THEN the system SHALL load it as a resumable session, validating that the file matches the expected session schema.
21. IF an imported file does not match the expected schema THEN the system SHALL reject it with a clear error message and SHALL not corrupt existing saved sessions.

### Error states
22. IF local browser storage is unavailable or full THEN the system SHALL warn the user and SHALL still allow them to continue and manually export their work.
23. IF a session fails to load (corrupted local data) THEN the system SHALL show an error and SHALL offer to delete that session without affecting others.
