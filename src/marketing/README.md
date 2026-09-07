# Marketing board

The signed-in default view (`components/MarketingBoard.js`) is a TV dashboard:
per-project traffic, conversion, and outreach volume, each against the previous
equal-length period.

## Wiring a project in

1. Add it to `projects.js` with a unique `site` slug.
2. From that app, report into this same Firebase project:

```js
import { logVisit } from "./visitTracker";      // one visit per browser session
import { logConversion, logOutreach } from "./marketing/report";

logVisit("planful");                            // traffic
logConversion("planful", "signup");             // conversion numerator
logOutreach("planful", "LinkedIn");             // posts sent
```

3. Flip `tracking: true` on that project once the feed is live. Until then the
   card shows "no feed" rather than a misleading zero.

Outreach can also be logged by hand from the board — the `+` on any card.

## Collections

| Collection    | Fields                                          |
| ------------- | ----------------------------------------------- |
| `visits`      | `site`, `timestamp`, `referrer`, `device`, …    |
| `conversions` | `site`, `type`, `timestamp`                     |
| `outreach`    | `site`, `channel`, `count`, `timestamp`         |

Visits written before sites were tagged have no `site` field and are counted as
`portfolio`.

Firestore rules need read access on `conversions` and `outreach` for the signed-in
owner, and create access for whatever writes them. If a collection is unreadable
the board keeps working and names it in an amber banner.

## Periods

Today / This week / This month compare against the immediately preceding window
of the same length. A previous period of zero shows as "new" rather than a
meaningless percentage. Conversion-rate movement is shown in points, not as a
percentage of a percentage.
