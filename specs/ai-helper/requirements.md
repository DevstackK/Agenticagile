# Requirements: AI Helper for Discovery Wizard

## User Story
As a user filling out the Discovery Wizard, I want an AI-drafted suggestion for any question I'm stuck on, so that I can get unblocked quickly without losing control over what actually gets recorded as my answer.

## Scope
Adds a "Suggest" action to each text question in the wizard that calls Claude via a new Vercel serverless function (the API key never ships to the browser). The suggestion is shown separately from the answer field and must be explicitly accepted before it becomes the answer. Select-type questions (e.g. build/buy/do-nothing) are out of scope — they already have a small, explicit option set and don't benefit from drafting.

## Acceptance Criteria

### Triggering a suggestion
1. WHEN a user is on a text-type question THEN the system SHALL show a "Suggest" button next to that question.
2. WHEN a user clicks "Suggest" THEN the system SHALL send the question's label, its grounding methodology, and all currently-filled answers across all four stages (as context) to the serverless endpoint.
3. WHEN a suggestion request is in flight THEN the system SHALL show a loading state on that question's "Suggest" button and SHALL disable repeat clicks on it until it resolves.
4. WHEN a suggestion is returned THEN the system SHALL display it in a distinct "Suggested answer" area below the question, visually separate from the actual answer textarea.

### Accepting / editing / discarding
5. WHEN a suggestion is displayed THEN the system SHALL offer "Use this" and "Discard" actions.
6. WHEN a user clicks "Use this" THEN the system SHALL copy the suggestion text into the question's answer field, SHALL NOT submit or advance the stage automatically, and the user SHALL be able to edit it like any normal answer afterward.
7. WHEN a user clicks "Discard" THEN the system SHALL remove the suggestion from view without modifying the answer field.
8. IF a question already has an existing answer AND the user requests a new suggestion THEN the system SHALL NOT overwrite the existing answer unless the user explicitly clicks "Use this" on the new suggestion.

### Backend / API
9. WHEN the serverless function receives a suggestion request THEN it SHALL call the Anthropic API using an API key read from a server-side environment variable, never exposed to the client.
10. WHEN the serverless function calls Anthropic THEN it SHALL instruct the model to produce a concise, first-person draft answer appropriate to the specific question and its grounding methodology, using the supplied context answers.
11. IF the request body is missing the question text THEN the serverless function SHALL return a 400 error without calling Anthropic.
12. IF the Anthropic API call fails (error, timeout, rate limit) THEN the serverless function SHALL return a structured error response, and the frontend SHALL show an inline error message on that question instead of a suggestion, with a retry option.

### Cost / safety guardrails
13. WHEN a suggestion request is made THEN the system SHALL cap the context payload sent to Anthropic to only the answers that exist (no empty/unanswered fields), to limit token usage.
14. IF a user clicks "Suggest" multiple times rapidly on the same question THEN the system SHALL debounce so only one in-flight request exists per question at a time.
15. WHEN the serverless function is deployed THEN the `ANTHROPIC_API_KEY` SHALL be configured as a Vercel project environment variable, never committed to the repository.
