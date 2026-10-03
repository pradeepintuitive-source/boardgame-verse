# Current Task: Complete Monopoly Phase and Action UI

## Objective
Implement the missing Monopoly frontend phase controls, trade review, and requested player/board asset cues while preserving the authoritative backend flow.

## Subtasks
* [x] Map `PAUSED` distinctly and add host pause/resume controls with a blocking overlay.
* [x] Add incoming trade review and recipient accept/reject controls.
* [x] Render pending cards and jail-card counts; enforce full-set and even-build UI rules.
* [x] Add hotel action dispatch, ownership borders, and stronger mortgage styling.
* [x] Restrict Bank Manager to the room host and update project memory.
* [x] Build and run focused source diagnostics.

## Status
Implemented. Confirm the trade response metadata contract with the Spring backend before production use. Production build succeeds; standard lint still reports Prettier formatting violations in touched files.
