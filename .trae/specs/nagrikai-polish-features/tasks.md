# NagrikAI Polish Features & Stretch Goals - Implementation Plan

## Task 1: Visible AI thinking loading state + button disable in CitizenView
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Enhance the existing `step === 'loading'` section in `CitizenView.jsx` to render a chat-bubble-style "AI is thinking" indicator (matching the existing clarify-bubble design: bot avatar + bubble with pulsing dots/stage text).
  - Ensure Submit Grievance button (`step==='idle'`) has `disabled={!complaintText.trim() || step==='loading'}` or equivalent (idle already disables on empty; also disable when transitioning).
  - Ensure Send Reply button (`step==='clarifying'`) has `disabled={!clarificationReply.trim() || step==='loading'}` with visual disabled state.
  - Change loadingStage keys to show a visible first-person stage description during loading.
- **Acceptance Criteria Addressed**: AC-1, AC-10
- **Test Requirements**:
  - `rule` TR-1.1: CitizenView loading section renders a bot-style loading bubble; Evidence: source code of the loading step JSX in CitizenView.jsx
  - `rule` TR-1.2: Submit and Send Reply buttons have a disabled attribute while step==='loading'; Evidence: JSX disabled attribute on buttons
  - `rule` TR-1.3: `npm run build` passes after changes; Evidence: build exit code 0

## Task 2: Add `reasoning` field end-to-end (backend prompts, models, normalization, frontend success card + dashboard)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Update `SYSTEM_PROMPT_EXTRACT` and `SYSTEM_PROMPT_CLARIFY` JSON schemas to include `"reasoning": "short sentence"` field.
  - Update `_validate_and_normalize_extraction` to pass through reasoning or inject a default generic fallback sentence if missing.
  - Add `reasoning` to the `ticket` dict in both `extract_ticket()` and `clarify_ticket()` in `ai_engine.py`.
  - Add `reasoning: Optional[str]` to `TicketResponse` Pydantic model in `models.py`.
  - Persist `reasoning` in SQLite: ALTER-style add column `reasoning TEXT` via safe init_db upgrade path (since `CREATE TABLE IF NOT EXISTS` won't add new cols — use `PRAGMA table_info` check or a try/fallback); also update INSERT/SELECT in `database.py`.
  - Add a `Why this classification?` section to the CitizenView success confirmation card.
  - Pass `reasoning` through `mapBackendTicketToFrontend` and render a small reasoning hint on DashboardView rows (e.g., under summary in a muted text span).
- **Acceptance Criteria Addressed**: AC-2, AC-9, AC-10
- **Test Requirements**:
  - `rule` TR-2.1: `SYSTEM_PROMPT_EXTRACT` JSON schema section includes `reasoning` key; Evidence: grep of SYSTEM_PROMPT_EXTRACT string
  - `rule` TR-2.2: `_validate_and_normalize_extraction` sets default reasoning if absent; Evidence: function source code
  - `rule` TR-2.3: `TicketResponse` includes optional `reasoning` field; Evidence: models.py code
  - `rule` TR-2.4: Citizen success card renders reasoning block; Evidence: CitizenView success section JSX
  - `rule` TR-2.5: `python backend/run_tests.py` passes ALL sections exit code 0; Evidence: test output log
  - `rule` TR-2.6: `npm run build` passes; Evidence: build exit code 0

## Task 3: Live SLA countdown timer on DashboardView
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None (parallelizable with Task 1/2)
- **Description**:
  - Create a small `useLiveSlaCountdown` hook inline in DashboardView (or small helper using `useEffect` + `setInterval`) that recomputes slaRemaining every 60 seconds (or 1s if easy, but 60s adequate).
  - Replace static `slaRemaining` string with live-computed string. For breached tickets render as red "OVERDUE by Xh Ym". For non-breached render green "Xh Ym remaining" / amber when approaching.
  - Clean up interval on unmount.
- **Acceptance Criteria Addressed**: AC-3, AC-10
- **Test Requirements**:
  - `rule` TR-3.1: DashboardView useEffect includes `setInterval` that updates a state causing re-render every N seconds, with a cleanup function; Evidence: source code
  - `rule` TR-3.2: SLA column uses distinct red "OVERDUE by ..." text for breached tickets vs green "Xh Ym remaining" for on-track; Evidence: render code
  - `rule` TR-3.3: `npm run build` passes; Evidence: build exit code 0

## Task 4: Success toast/animation on new ticket creation (citizen + dashboard refresh)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - In CitizenView, when transition to `success` step fires, show a toast: `Ticket TKT-XXXX created ✅`. Reuse the DashboardView fixed-position toast pattern — lift the toast state UP to App.jsx so both views share one toast render point, OR add an independent one in CitizenView (simple is fine).
  - In DashboardView `loadData`, track previous ticket IDs, and when the new result has IDs that weren't previously present, trigger a toast for each new ticket.
- **Acceptance Criteria Addressed**: AC-4, AC-10
- **Test Requirements**:
  - `rule` TR-4.1: CitizenView success step triggers a setTimeout-based toast showing ticket ID; Evidence: useEffect in success state or setState at step transition
  - `rule` TR-4.2: DashboardView loadData detects new ticket IDs and toasts for them on refresh; Evidence: tracking of previous IDs
  - `rule` TR-4.3: `npm run build` passes; Evidence: build exit code 0

## Task 5: Better empty states for DashboardView
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Case A (zero total tickets, no filters/search): replace empty table row with a friendly card + message "No complaints yet — submissions will appear here." (add in top of table wrapper area, distinct from filter-empty case).
  - Case B (zero breached): KPI breached card text could show a subtle inline "✅ All tickets within SLA — nothing breached." label.
  - Case C (processedTickets.length === 0, but total > 0 or filters active): replace generic empty with "No tickets match your filters."
- **Acceptance Criteria Addressed**: AC-5, AC-10
- **Test Requirements**:
  - `rule` TR-5.1: Three distinct empty-state strings present in DashboardView source with correct branching logic; Evidence: source code branches and string literals
  - `rule` TR-5.2: `npm run build` passes; Evidence: build exit code 0

## Task 6: Search + Category/Urgency/Status dropdown filters on DashboardView (client-side)
- **Status**: `pending`
- **Priority**: medium (Nice-to-have)
- **Depends On**: None
- **Description**:
  - Keep existing keyword search + department filter (already present).
  - Add three new state vars + selects: `selectedCategoryFilter`, `selectedUrgencyFilter`, `selectedStatusFilter` with `'all'` default.
  - Populate options from constants (URGENCY_CHOICES, CATEGORY_CHOICES, STATUS_CHOICES) — import or hardcode the frontend equivalents.
  - Update `processedTickets` useMemo to apply these filters (AND'd together with existing filters + search).
- **Acceptance Criteria Addressed**: AC-6, AC-10
- **Test Requirements**:
  - `rule` TR-6.1: Three new `<select>` elements for category, urgency, status exist in toolbar; Evidence: JSX
  - `rule` TR-6.2: All filter states participate in `processedTickets` useMemo dependencies and logic; Evidence: useMemo deps + predicate
  - `rule` TR-6.3: `npm run build` passes; Evidence: build exit code 0

## Task 7: Duplicate/similar complaint clustering backend + dashboard badges
- **Status**: `pending`
- **Priority**: medium (Nice-to-have)
- **Depends On**: Task 2 (for related_ticket_ids being additive only concept is validated)
- **Description**:
  - Backend: After `insert_ticket` succeeds in `/api/analyze` (when is_complete) and `/api/clarify`, run a query to find other OPEN tickets where `category` matches AND location strings share a case-insensitive substring match (either direction). Build list of `related_ticket_ids`.
  - Add `related_ticket_ids: List[str]` as optional field on `TicketResponse` Pydantic model.
  - Include `related_ticket_ids` in the response dict returned from both analyze/clarify handlers and from `get_all_tickets` (compute per-ticket at read time, or store — per-ticket compute at read time is simpler, avoids schema change).
  - Frontend: in `mapBackendTicketToFrontend` pass through related_ticket_ids. In DashboardView, if a ticket has related_ticket_ids of length N >= 1, render badge "N similar complaints in this area". Visual: compute a deterministic hash of (category + location.lower()) to pick a consistent accent left-border color for each cluster.
- **Acceptance Criteria Addressed**: AC-7, AC-9, AC-10
- **Test Requirements**:
  - `rule` TR-7.1: `/api/analyze` success response JSON contains `related_ticket_ids` list key; Evidence: curl/grep of response shape in main.py return
  - `rule` TR-7.2: `TicketResponse` includes optional `related_ticket_ids: List[str]`; Evidence: models.py
  - `rule` TR-7.3: DashboardView ticket rows render the similar-complaints badge when len(related_ticket_ids) > 0 AND use a consistent left-border color per cluster hash; Evidence: Dashboard render JSX
  - `rule` TR-7.4: `python backend/run_tests.py` passes ALL sections; Evidence: test output log
  - `rule` TR-7.5: `npm run build` passes; Evidence: build exit code 0

## Task 8: Map view of complaint locations with deterministic pseudo-geocoded pins
- **Status**: `pending`
- **Priority**: low (Nice-to-have, time-boxed, only after 6+7 done)
- **Depends On**: Task 7 (clustering logic in place so map pins have related IDs for grouping)
- **Description**:
  - Check package.json if `react-leaflet` exists; if not, `npm install react-leaflet leaflet`.
  - Add a Map section (collapsible or tab) at bottom of DashboardView.
  - Use deterministic pseudo-geocoding: `hash(location_string) % width` for a Bengaluru bounding box (approx lat 12.80–13.10, lon 77.45–77.75). Same location always gives same lat/lon pair.
  - Render map using `<MapContainer>` with OSM tiles. Add markers with ticket IDs.
  - Clearly label the section "Illustrative locations (for demo purposes only — not real geocoding)."
- **Acceptance Criteria Addressed**: AC-8, AC-10
- **Test Requirements**:
  - `rubric` TR-8.1: Map UX fidelity; Scale 1-5; Anchors 1=crashes/build fails, 3=map renders with pins in approximate BLR area, 5=map renders, pins same location → same coords, IDs labeled, disclaimer visible, no new paid keys; Threshold >= 4; Evidence: screenshot + code of map section + hash-based lat/lon helper
  - `rule` TR-8.2: `npm run build` passes with map integration; Evidence: build exit code 0
