# Marketing telemetry kit

For apps on their **own** Firebase project that need to appear on the board at
sethbailey.dev. The board reads `visits` / `conversions` / `outreach` from
`sethbaileydev-84a1e` only — there is no cross-project Firestore query — so each
app writes into that project through a second, named Firebase app.

Your app's existing Firebase (default app, auth, its own Firestore) is untouched.

## Per-app install

1. Confirm the app already depends on `firebase` (v9+ modular). If not:
   `npm install firebase`
2. Copy `telemetry.js` into the app, e.g. `src/telemetry.js`.
3. Call it once on mount:

   ```js
   import { useEffect } from "react";
   import { logVisit } from "./telemetry";

   useEffect(() => { logVisit("pmxl"); }, []);
   ```

4. Where the app has a real conversion, add:

   ```js
   import { logConversion } from "./telemetry";
   await logConversion("pmxl", "signup");
   ```

## Slugs

Must match a `site` in `src/marketing/projects.js` on the board, exactly:

| App              | slug          |
| ---------------- | ------------- |
| AI Bid           | `bidfolder`   |
| PM XL            | `pmxl`        |
| Planful          | `planful`     |
| Tiktok Store     | `tobysquish`  |
| AEM Consulting   | `aem`         |
| ChoreVest        | `chorevest`   |
| Drone Services   | `drone`       |

A typo'd slug writes a row nobody ever sees — the board only renders sites it
knows about.

## Required: Firestore rules on sethbaileydev-84a1e

These apps write unauthenticated, so the board's project must accept validated
creates. **Merge** the clauses in `firestore.rules.snippet` into the rules in the
Firebase console — do not paste it as the whole file, or you will drop the read
rules the board and the logged-in dashboard depend on.

Until the rules allow it, every write fails with `permission-denied` (visible in
the browser console as "Error logging visit") and the cards stay on NO FEED.

## What happens next

Nothing else to change. The board flips a card to LIVE the moment any row lands,
via `reporting: project.tracking || hasAnyData` in `useMarketingData.js` — the
`tracking: false` flags in `projects.js` do not need editing, though setting one
to `true` is the honest move once a site is genuinely wired.

Two caveats worth stating plainly:

- **No backfill.** This starts counting from install. Historical traffic on those
  sites is not recoverable this way.
- **Visits are sessions.** One row per browser session via `sessionStorage`, and
  localhost is skipped — so you cannot smoke-test it on a dev server. Deploy, then
  load the real domain in a fresh private window.
