# Requirements: Stage Gate (Business Case → User Research)

## User Story
As a user who has completed Business Case Discovery, I want to generate an executive deck from that stage, send it to a decision-maker, and have the wizard require a recorded Approve/Not Approved decision before I can continue to User Research, so that the project can't silently proceed without executive sign-off.

## Scope
A new screen inserted between Stage 1 (Business Case Discovery) and Stage 2 (User Research). Deck generation uses the Gamma API (`GAMMA_API_KEY`, new serverless function). Emailing the deck link uses Resend (`RESEND_API_KEY`, new serverless function). Approval is a manual in-app toggle recorded on the session — no token-based email-click approval in this version. This gate only exists between Stage 1 and Stage 2; Stages 2→3 and 3→4 are unaffected.

## Acceptance Criteria

### Gate placement
1. WHEN a user has answered all required Stage 1 questions and clicks "Next" THEN the system SHALL show the Stage Gate screen instead of advancing directly to Stage 2.
2. IF the stage gate's status is not "approved" THEN the system SHALL NOT allow advancing to Stage 2 by any action on the Stage Gate screen.
3. WHEN the stage gate's status is "approved" THEN the system SHALL enable a "Continue to User Research" action that advances to Stage 2.
4. WHEN a user navigates back from Stage 2 (or reloads) to the Stage Gate screen THEN the system SHALL show the previously generated deck URL and recorded decision, not reset them.

### Generating the executive deck
5. WHEN a user clicks "Generate Executive Deck" THEN the system SHALL send the Stage 1 answers to a new serverless endpoint, show a loading state, and disable repeat clicks until it resolves.
6. WHEN deck generation succeeds THEN the system SHALL store and display a shareable deck URL on the Stage Gate screen.
7. IF deck generation fails (API error, timeout, missing `GAMMA_API_KEY`) THEN the system SHALL show an inline error with a "Retry" action and SHALL NOT lose the user's Stage 1 answers.
8. WHEN a user regenerates a deck after a prior approval or rejection THEN the system SHALL reset the stage gate's status to "pending", since the previously reviewed content no longer matches.

### Sending to an executive
9. WHEN a deck URL exists THEN the system SHALL show an email input and a "Send to Exec" action.
10. IF the entered email is not a valid email format THEN the system SHALL block sending and show a validation message.
11. WHEN "Send to Exec" succeeds THEN the system SHALL send an email (via the serverless endpoint) containing the deck URL to the given address, and SHALL show a confirmation (recipient + timestamp) on the Stage Gate screen.
12. IF sending fails (API error, timeout, missing `RESEND_API_KEY`) THEN the system SHALL show an inline error with a "Retry" action and SHALL NOT lose the generated deck URL.

### Recording the decision
13. WHEN a user is on the Stage Gate screen THEN the system SHALL show "Approve" and "Not Approved" actions, enabled regardless of whether the deck has been sent by email (sending is not a precondition for approval).
14. WHEN a user clicks "Approve" THEN the system SHALL record status "approved" with a timestamp and enable continuing to Stage 2.
15. WHEN a user clicks "Not Approved" THEN the system SHALL record status "rejected" with a timestamp, keep Stage 2 locked, and allow the user to regenerate the deck, resend it, or change the decision again.

### Persistence
16. WHEN any stage gate field changes (deck URL, send confirmation, decision) THEN the system SHALL autosave it as part of the session, using the same persistence mechanism as the rest of the wizard.
