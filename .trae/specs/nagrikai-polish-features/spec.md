# NagrikAI Polish Features & Stretch Goals - Product Requirements Document

## Overview
- **Summary**: Add UX polish features to the working citizen-complaint system. Includes 8 prioritized items: AI thinking loading state, AI reasoning display on tickets, live SLA countdown timer on dashboard, success toast on ticket creation, improved empty states, search+filter on dashboard (category/urgency/status), duplicate complaint clustering with related ticket IDs, and a map view of complaint locations with pseudo-geocoded pins.
- **Purpose**: Improve confidence, transparency, and discoverability for both citizen and staff users without changing working API contracts or DB schema beyond strictly-additive optional fields.
- **Target Users**: Citizens filing complaints (CitizenView) and Municipal staff triaging (DashboardView).

## Goals
- Ensure users never see a "frozen" UI while waiting for AI (`/api/analyze` and `/api/clarify`).
- Transparently explain AI classification decisions to users and staff.
- Make SLA urgency obvious and continuously visible via live countdown instead of static timestamps.
- Provide positive feedback loops (toast + animations) for ticket creation.
- Improve information density on dashboard via filters and related-complaint visibility.

## Non-Goals
- Do NOT modify `/api/analyze`, `/api/clarify`, `/api/tickets`, `/api/stats`, `/api/check-breaches` request shapes, routes, or existing required response fields. Backend additions are strictly new OPTIONAL fields (`reasoning`, `related_ticket_ids`) on existing responses — never remove or rename.
- Do NOT change the existing SQLite DB schema. New optional fields are stored as JSON defaults (empty) or a new nullable DB column only if necessary, with graceful fallback when column absent.
- Do NOT add new paid API dependencies. Map view, if implemented, uses `react-leaflet` + OpenStreetMap (keyless).
- Do NOT touch the existing clarify-loop validator logic or error handling — add around it.
- Do NOT add heavy toast/notification libraries; reuse existing `triggerToast` pattern or create a simple custom one.

## Background & Context
- The app already works end-to-end (citizen submit → clarify loop → ticket → staff dashboard → escalation).
- `App.jsx` holds `lang` state and `setCurrentView`. `CitizenView.jsx` has the four-step state machine (`idle`/`loading`/`clarifying`/`success`). `DashboardView.jsx` has a `triggerToast` helper and a table with existing `slaRemaining` static strings.
- Backend: `ai_engine.py` runs `extract_ticket` and `clarify_ticket` → `_call_gemini_json` with `SYSTEM_PROMPT_EXTRACT`/`SYSTEM_PROMPT_CLARIFY`. `_validate_and_normalize_extraction` is the single validator. Tickets are stored in `database.py` (SQLite) and served by `main.py`.
- Tests: `backend/run_tests.py` validates schema of `/api/analyze` and `/api/clarify` responses against a hardcoded `REQUIRED_RESPONSE_FIELDS` list — this list does NOT include `reasoning` or `related_ticket_ids` (they're additive), so test passes are safe. `validate_ticket_schema` only checks the fixed REQUIRED_FIELDS list.

## Functional Requirements

### MUST HAVE
- **FR-1**: During `/api/analyze` and `/api/clarify` requests, CitizenView shows a chat-bubble-style "AI is thinking…" loading indicator with spinner/dots and the submit/send buttons are disabled with visual disabled state, preventing double-submission.
- **FR-2**: Backend extract+clarify pipelines include a new optional string field `reasoning` (plain-language one-sentence explanation) in the extraction JSON. If missing, a fallback sentence is injected. `reasoning` appears in:
  - Backend Pydantic model `TicketResponse` as optional field
  - Citizen success confirmation card as a small "Why this classification?" section
  - Dashboard ticket summary or detail view
- **FR-3**: Dashboard SLA column is replaced by a live-updating countdown recalculated every minute (at minimum). Shows green "Xh Ym remaining" or red "OVERDUE by Xh Ym" and updates in place without full-page reload. Static `slaRemaining` is no longer enough.
- **FR-4**: New ticket creation triggers a visible toast (use existing `triggerToast` pattern in dashboard, and add same-pattern toast to App or CitizenView) showing ticket ID + success icon. Dashboard refresh detects new tickets and also toasts.
- **FR-5**: Three distinct empty states:
  1. Dashboard with 0 tickets total (no search/filters active) → friendly intro message.
  2. Breached count = 0 → explicit "all within SLA" message.
  3. Search/filter/table returns 0 rows → "No tickets match your filters".

### NICE TO HAVE (time-allowing, in order)
- **FR-6**: Dashboard adds three dropdown filters alongside existing search: Category, Urgency, Status. Pure client-side filtering over already-fetched `tickets`. No new backend endpoints.
- **FR-7**: Backend adds lightweight duplicate-similarity check: after inserting a completed ticket, find other OPEN tickets with same `category` and case-insensitive substring-matching `location`. Return new optional list `related_ticket_ids` on analyze/clarify success responses, and include it in `/api/tickets` rows (as part of the transformed frontend ticket). Dashboard badges related tickets with a "N similar in this area" badge and a common visual highlight (same left-border accent color per category+location group).
- **FR-8**: Map view (only if FR-6 and FR-7 done). Uses `react-leaflet` + OSM tiles. Pseudo-coordinates generated by hashing `location` string deterministically into a Bengaluru bounding box. Clearly labeled illustrative/demo, no precision claims.

## Non-Functional Requirements
- **NFR-1**: Additive only — existing working flows (submit, clarify, dashboard) must continue to work. `run_tests.py` must fully pass.
- **NFR-2**: No page reloads. Language switching, filtering, SLA updates, etc. must work via React state / `useEffect`.
- **NFR-3**: Every feature keeps the app runnable after implementation. Build (`npm run build`) must continue to succeed after each task.
- **NFR-4**: No new paid APIs or API keys.

## Constraints
- **Technical**:
  - New backend response fields are optional. Old clients/frontends ignore them.
  - Database: Existing tickets.db works. If reasoning needs persistence, use a new nullable TEXT column added in `init_db()` with `ALTER TABLE ADD COLUMN IF NOT EXISTS`-like pattern (SQLite safe).
  - No localStorage for language state (per earlier work).
  - `useEffect` + `setInterval` for SLA countdown (no new date-math library).
- **Business**: Preserve all existing visual styling conventions; only add new UI elements (reasoning section, toast, filter selects, etc.) that match existing design.
- **Dependencies**: If `react-leaflet` needed for FR-8, add only if not already present. Use free OSM tiles with attribution.

## Assumptions
- Dashboard search already partially works (keyword in ID/summary/category/location/dept). FR-6 just adds three new dropdowns that further narrow results — client-side.
- `CitizenView` already has a `step === 'loading'` state; FR-1 enhances it to a chat-bubble style and ensures buttons are disabled.
- The existing Dashboard `triggerToast` and fixed-position toast DOM element can be reused or pattern-copied to CitizenView.
- Pseudo-geocoding (FR-8) will use a stable hash like `md5(location) % width` across a BBMP-style bounding box, ensuring same location always lands on same pin.

## Acceptance Criteria

### AC-1: AI thinking visible in citizen flow
- **Type**: `rule`
- **Given**: User opens CitizenView and types a complaint
- **When**: `handleSubmitInitial` fires or `handleSendClarification` fires and a network request is in flight
- **Then**: (1) A visible animated "AI thinking" chat bubble appears with spinner/pulsing dots and stage-specific subtitle, (2) Submit Grievance button or Send Reply button has `disabled` attribute + reduced opacity visual state, (3) Double-clicking submit does not send second request
- **Pass Condition**: Manual click-test on the running dev server OR review of JSX showing disabled={!text || step==='loading'} and bubble in loading step
- **Evidence**: Code review of CitizenView.jsx loading section + onClick guards; dev server screenshot if running

### AC-2: reasoning field end-to-end
- **Type**: `rule`
- **Given**: Running backend with `/api/analyze`
- **When**: POST /api/analyze with a complete complaint text
- **Then**: (1) JSON response body contains key `reasoning` (string), (2) If LLM returns empty reasoning, fallback is set to generic non-empty string, (3) Pydantic model `TicketResponse` includes optional `reasoning` field, (4) Citizen success card renders a "Why this classification?" section with the reasoning text, (5) Dashboard includes it in ticket summary or detail
- **Pass Condition**: `curl` to /api/analyze returns reasoning key; frontend success card and dashboard row show the text
- **Evidence**: API response JSON snippet + screenshots of success card and dashboard rendering

### AC-3: Live SLA countdown updates
- **Type**: `rule`
- **Given**: Dashboard loaded with tickets, one with sla_deadline in near future and one breached
- **When**: User waits on dashboard page for 2 minutes without refreshing
- **Then**: (1) The SLA column text for "remaining" decrements by at least 1 minute, (2) A breached ticket reads "OVERDUE by Xh Ym" in red text, (3) An on-track ticket reads "Xh Ym remaining" in green, (4) No full-page reload occurs; updates happen in-place
- **Pass Condition**: Manual observation or code review of `setInterval` inside `useEffect([])` returning a cleanup function
- **Evidence**: Code diff of DashboardView.jsx or client.js showing live countdown hook + SLA text rendering conditional

### AC-4: Success toast on ticket creation
- **Type**: `rule`
- **Given**: CitizenView is on success step for new ticket TKT-XXXX
- **When**: Component transitions from `clarifying`/`loading` to `success`
- **Then**: A temporary toast appears in top-right (or existing position) showing ticket ID + "created ✅", auto-dismisses within 3-5 seconds
- **Pass Condition**: Visual toast appears once per new ticket and auto-dismisses; same behavior when dashboard detects new ticket on refresh
- **Evidence**: Screenshot of toast, code review of toast state + setTimeout cleanup

### AC-5: Three distinct empty states
- **Type**: `rule`
- **Given**: DashboardView component
- **When**: (A) tickets.length === 0 and no filters/search, (B) breachedCount === 0, (C) processedTickets.length === 0 due to filters
- **Then**: Case A shows "No complaints yet — submissions will appear here." with a friendly icon; Case B shows "✅ All tickets within SLA — nothing breached."; Case C shows "No tickets match your filters."
- **Pass Condition**: All three strings appear in their respective contexts in the source code
- **Evidence**: Code review of empty-state branches in DashboardView.jsx

### AC-6: Client-side search + category/urgency/status filters
- **Type**: `rule`
- **Given**: Dashboard has tickets loaded with mix of categories, urgencies (High/Medium/Low), and statuses (open/in_progress/resolved/breached)
- **When**: User selects category filter = "Roads & Potholes", urgency = "High", status = "open", and types keyword in search
- **Then**: processedTickets shows only rows matching ALL applied filters plus keyword search
- **Pass Condition**: UI renders three selects/dropdowns; filtering state participates in the `useMemo` dependency array of processedTickets
- **Evidence**: Source code of filter selects and useMemo predicate

### AC-7: Related ticket clustering
- **Type**: `rule`
- **Given**: Two or more OPEN tickets exist with same category and overlapping location (case-insensitive substring match either direction)
- **When**: New ticket of same category/location is inserted via /api/analyze, then /api/tickets is fetched
- **Then**: (1) /api/analyze and /api/clarify success responses include new optional list `related_ticket_ids: ["TKT-0001", ...]`, (2) Dashboard row shows a "N similar complaints in this area" badge for related groups, (3) Related tickets share a visual accent indicator (same left-border color per hash of category+location)
- **Pass Condition**: API response JSON contains related_ticket_ids array; dashboard renders the badge and shared highlight
- **Evidence**: API response body + dashboard screenshot of related ticket row badges

### AC-8: Map view with pseudo-geocoded pins
- **Type**: `rubric`
- **Dimension**: Map UX clarity and fidelity
- **Scale**: 1-5
- **Anchors**: 1 = blank/integrated poorly or crashes; 3 = map renders, pins placed (same location → same pin), but labeling unclear or pins outside BBMP area; 5 = map renders with OSM tiles, deterministic pins within BBMP bounding box, pins labeled with ticket IDs, clearly marked "Illustrative only" note, no paid API/keys required
- **Pass Threshold**: >= 4
- **Evidence**: Screenshot of map tab/section in dashboard, source code of hash-based pseudo-geocoding and Leaflet integration

### AC-9: Existing tests continue passing
- **Type**: `rule`
- **Given**: Backend running on :8000 with test DB
- **When**: `python backend/run_tests.py` executed
- **Then**: All existing sections (health, docs, analyze x20, clarify, persistence, stats, seed+breach, CORS) pass with exit code 0. Schema validation against REQUIRED_RESPONSE_FIELDS is unchanged.
- **Pass Condition**: run_tests.py prints "All checks passed!" and exits 0
- **Evidence**: Terminal output of `run_tests.py` and exit code 0

### AC-10: Frontend build passes
- **Type**: `rule`
- **Given**: All source changes applied
- **When**: `cd frontend && npm run build` executed
- **Then**: Exit code 0, dist/ output generated without errors or warnings blocking compilation
- **Pass Condition**: `npm run build` exits 0
- **Evidence**: Build log snippet

## Open Questions
- None. All requirements explicit in the prompt. FR-6/FR-7/FR-8 are time-boxed nice-to-haves.
