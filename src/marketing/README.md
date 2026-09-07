# Marketing board

The signed-in default view (`components/MarketingBoard.js`) is a TV dashboard:
per-project traffic, conversion, and outreach volume, each against the previous
equal-length period.

## Where the numbers come from

Two sources, and a card says which one it is using:

| Badge       | Source                                                            |
| ----------- | ----------------------------------------------------------------- |
| `live · ga` | GA4 sessions, via the `getBoardTraffic` function                   |
| `live`      | First-party `visits` rows written by `logVisit()`                  |
| `no access` | A GA4 property is mapped but was never shared with the dashboard   |
| `no feed`   | No GA4 property mapped and nothing first-party has ever arrived    |

GA4 wins for traffic wherever the property is readable, because it needs no
code in the other app and it brings history with it. Conversions and outreach
are always first-party — GA has no idea what counts as a conversion here. On a
GA-fed card the conversion *rate* therefore spans both sources by design.

`getBoardTraffic` returns a 64-day daily series per property rather than a
total, so switching period (today / week / month) is arithmetic in the browser,
not another round trip. One property failing never blanks the board — it comes
back as a status beside the ones that worked.

### Granting GA access

Every property needs its own grant: GA Admin → Property Access Management → add
`302446346986-compute@developer.gserviceaccount.com` as a Viewer. The slug →
property map lives in `functions/index.js` (`GA4_PROPERTIES`), deliberately
server-side: the browser sends a slug, never a raw property id.

Until a property is granted, the board names it in an amber banner and the card
falls back to first-party visits.

## Wiring a project in

1. Add it to `projects.js` with a unique `site` slug.
2. Map its GA4 property in `GA4_PROPERTIES` (`functions/index.js`) and grant the
   service account Viewer on it — that alone is enough to light the card up.
3. Optionally, for conversions and outreach, report into this Firebase project:

```js
import { logVisit } from "./visitTracker";      // one visit per browser session
import { logConversion, logOutreach } from "./marketing/report";

logVisit("planful");                            // traffic
logConversion("planful", "signup");             // conversion numerator
logOutreach("planful", "LinkedIn");             // posts sent
```

4. Flip `tracking: true` on that project once a first-party feed is live. Until
   something reports, the card names what is missing rather than showing a
   misleading zero.

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
