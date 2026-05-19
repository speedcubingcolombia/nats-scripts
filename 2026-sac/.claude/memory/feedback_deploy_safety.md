---
name: feedback-deploy-safety
description: CRITICAL deploy safety rules — NEVER PATCH schedule, always clean-empty-restore pattern
metadata:
  type: feedback
---

NEVER PATCH schedule with pipeline-generated data. The pipeline creates activities with local IDs and potentially wrong timezone offsets that corrupt the WCA schedule.

**Why:** During the May 18-19 session, PATCHing the schedule from the pipeline duplicated all activities with wrong UTC times (+5h offset). Multiple restore attempts failed until we emptied the schedule completely and restored from backup.

**How to apply:**
1. The `run_pipeline_prod.js` must NEVER send `{ schedule: afterPhase3.schedule }` to WCA
2. Schedule changes (new groups, time changes) must be done manually in WCA's schedule editor, NOT via API
3. Deploy should ONLY PATCH `{ persons: ... }` — never schedule
4. Before any deploy: save an authenticated backup first
5. If schedule gets corrupted: clean persons → empty schedule → restore from backup (3 clean steps, don't try to patch over)
6. Always verify with the user before running destructive operations on production
7. The venue timezone is America/Bogota (UTC-5) — all WCIF times are in UTC
