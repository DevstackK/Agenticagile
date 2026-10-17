# Tasks: Stage Gate (Business Case → User Research)

- [x] Add `StageGateSchema` to `src/lib/schema.ts` with `.default(...)`, add `stageGate` field to `SessionSchema`, export `StageGate` type, update `createEmptySession` (design.md: Data/Interfaces, AC16).
- [x] Write unit tests for the schema change: a session missing `stageGate` entirely still parses (backward compatibility), a fresh session has `status: 'pending'`, an invalid `status` value is rejected.
- [x] Implement `api/_lib/buildDeckOutline.ts` — pure function turning Q&A pairs into Gamma `inputText` (AC5).
- [x] Write unit tests for `buildDeckOutline.ts`: output includes each question and answer, skips empty answers.
- [x] Implement `api/_lib/gammaClient.ts` — `createGeneration()` and `pollGeneration()` wrapping Gamma's documented Generate API.
- [x] Implement `api/generate-deck.ts` — handler validating the request, building the outline, creating + polling the Gamma generation (55s budget, `maxDuration: 60`), mapping success/failure (AC5, AC6, AC7, AC8's status-reset is frontend-side but the deck fields come from here).
- [x] Implement `api/_lib/validateSendDeckEmailRequest.ts` — hand-rolled validation of `to`/`deckUrl` (AC10).
- [x] Write unit tests for `validateSendDeckEmailRequest.ts`: valid body passes, invalid email rejected, missing deckUrl rejected.
- [x] Implement `api/send-deck-email.ts` — handler validating the request and calling Resend's `/emails` endpoint, mapping success/failure (AC11, AC12).
- [x] Implement `src/lib/stageGate.ts` — `requestGenerateDeck()`, `requestSendDeckEmail()` fetch wrappers, `isValidEmail()` (design.md: Data/Interfaces).
- [x] Write unit tests for `isValidEmail()`: valid addresses pass, missing `@`/domain rejected.
- [x] Build `src/components/StageGate.tsx` — generate/send/approve/reject actions, status summary, Continue/Back actions, local loading/error state for generate and send (AC1–AC4, AC9, AC10, AC13–AC15).
- [x] Modify `src/components/Wizard.tsx` — add `showGate` state, wire `goNext()`/`goBack()` to route through the gate after Stage 1, render `StageGate` with `onUpdate`/`onContinue`/`onBackToForm` (AC1, AC2, AC3, AC4, AC16).
- [x] Manual verification: on the deployed app (after adding `GAMMA_API_KEY`/`RESEND_API_KEY` to Vercel), complete Stage 1, confirm the gate blocks "Next" from reaching Stage 2, generate a deck and confirm the URL opens a real Gamma presentation, send it to a test email and confirm receipt, approve and confirm Stage 2 becomes reachable, go back and confirm the gate's prior state is shown, then regenerate and confirm approval resets to pending.
