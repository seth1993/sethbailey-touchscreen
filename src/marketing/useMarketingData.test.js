// These tests run at TZ=Europe/Berlin, pinned in the "test" script. Setting it
// here would be too late -- imports hoist above it -- and it has to be east of
// Greenwich: dayKey() normalizes to local midnight before formatting, so a
// UTC-formatted key is only wrong at a positive offset, where local midnight
// is still yesterday in UTC. In UTC, which is what CI runs in, and anywhere in
// the Americas, the regression below is invisible.

import { renderHook, waitFor } from "@testing-library/react";

// The hook's job is arithmetic over two feeds, so both feeds are stubbed and
// the tests assert on the numbers that reach a card. Firestore is mocked at
// the SDK boundary rather than at loadCollection() so the real query path,
// including the timestamp -> Date conversion, still runs.
jest.mock("../firebase", () => ({ db: {}, auth: { currentUser: null } }));

const mockGetDocs = jest.fn();
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: (...args) => mockGetDocs(...args),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: { fromDate: (d) => d },
}));

const mockTraffic = { traffic: null, loading: false, error: null, refresh: jest.fn(), needsAccess: [] };
jest.mock("./useBoardTraffic", () => ({
  useBoardTraffic: () => mockTraffic,
}));

const { useMarketingData } = require("./useMarketingData");

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
};

// The local-day key the hook buckets by. Written out longhand here on purpose:
// if this ever drifts back to toISOString(), these tests should fail.
const localKey = (d) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;

// Firestore hands back a snapshot, not an array.
const snapshotOf = (rows) => ({
  forEach: (fn) =>
    rows.forEach((row, i) =>
      fn({ id: `row-${i}`, data: () => ({ ...row, timestamp: { toDate: () => row.date } }) })
    ),
});

// Every collection the hook asks for, keyed by the order it asks: visits,
// conversions, outreach.
const withCollections = ({ visits = [], conversions = [], outreach = [] }) => {
  const queue = [visits, conversions, outreach];
  let i = 0;
  mockGetDocs.mockImplementation(() => Promise.resolve(snapshotOf(queue[i++] ?? [])));
};

const gaSites = (sites) => ({
  fetchedAt: new Date().toISOString(),
  lookbackDays: 64,
  serviceAccount: "svc@example.com",
  sites,
});

const cardFor = (result, site, period = "day") =>
  result.current.buildStats(period).projects.find((p) => p.site === site);

const noon = (offsetDays = 0) => {
  const day = addDays(startOfDay(new Date()), offsetDays);
  day.setHours(12);
  return day;
};

const renderBoard = async () => {
  const view = renderHook(() => useMarketingData(false));
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockTraffic.traffic = null;
  mockTraffic.error = null;
  mockTraffic.needsAccess = [];
  withCollections({});
});

describe("traffic source", () => {
  it("counts GA4 sessions for today when the property reports", async () => {
    mockTraffic.traffic = gaSites({
      portfolio: {
        status: "ok",
        propertyId: "277870276",
        realtimeUsers: 4,
        daily: [
          { date: localKey(new Date()), sessions: 120, users: 90 },
          { date: localKey(addDays(new Date(), -1)), sessions: 80, users: 60 },
        ],
      },
    });

    const { result } = await renderBoard();
    const card = cardFor(result, "portfolio");

    expect(card.visits.now).toBe(120);
    expect(card.visits.prev).toBe(80);
    expect(card.feed.source).toBe("ga4");
    expect(card.feed.realtimeUsers).toBe(4);
    expect(card.reporting).toBe(true);
  });

  it("ignores first-party visits on a GA-fed card rather than double counting", async () => {
    withCollections({
      visits: [{ site: "portfolio", date: noon() }, { site: "portfolio", date: noon() }],
    });
    mockTraffic.traffic = gaSites({
      portfolio: {
        status: "ok",
        propertyId: "277870276",
        realtimeUsers: 0,
        daily: [{ date: localKey(new Date()), sessions: 120, users: 90 }],
      },
    });

    const { result } = await renderBoard();

    expect(cardFor(result, "portfolio").visits.now).toBe(120);
  });

  it("falls back to first-party visits when the property was never shared", async () => {
    withCollections({ visits: [{ site: "portfolio", date: noon() }, { site: "portfolio", date: noon() }] });
    mockTraffic.traffic = gaSites({
      portfolio: { status: "no_access", propertyId: "277870276", error: "Share it." },
    });

    const { result } = await renderBoard();
    const card = cardFor(result, "portfolio");

    expect(card.visits.now).toBe(2);
    expect(card.feed.source).toBe("firestore");
    // The card still knows why GA is absent, so it can say so.
    expect(card.feed.status).toBe("no_access");
    expect(card.feed.propertyId).toBe("277870276");
  });

  it("reports nothing rather than zero when no source has ever fed a card", async () => {
    const { result } = await renderBoard();
    const card = cardFor(result, "drone");

    expect(card.reporting).toBe(false);
    expect(card.feed.source).toBeNull();
  });
});

describe("day bucketing", () => {
  // First-party rows and buckets are keyed by the same function, so this holds
  // under any dayKey -- it pins the plain behaviour, not the regression below.
  it("puts a late-evening local visit in today's sparkline bucket", async () => {
    const tonight = startOfDay(new Date());
    tonight.setHours(23, 30);
    withCollections({ visits: [{ site: "portfolio", date: tonight }] });

    const { result } = await renderBoard();
    const card = cardFor(result, "portfolio");

    expect(card.spark[card.spark.length - 1]).toBe(1);
    expect(card.visits.now).toBe(1);
  });

  // Regression: dayKey() used toISOString(). It normalizes to local midnight
  // first, so east of Greenwich every key slid back a day. First-party numbers
  // survived that -- rows and buckets shifted together -- but GA sends true
  // local dates, so its series stopped matching the buckets and a GA-fed card
  // went to zero. This test and the two GA totals above are what catch it.
  it("lines the sparkline up with GA's local-day series", async () => {
    mockTraffic.traffic = gaSites({
      portfolio: {
        status: "ok",
        propertyId: "277870276",
        realtimeUsers: 0,
        daily: [
          { date: localKey(new Date()), sessions: 7, users: 5 },
          { date: localKey(addDays(new Date(), -2)), sessions: 3, users: 2 },
        ],
      },
    });

    const { result } = await renderBoard();
    const spark = cardFor(result, "portfolio").spark;

    // Oldest first, so today is last and two days back is third from the end.
    expect(spark[spark.length - 1]).toBe(7);
    expect(spark[spark.length - 3]).toBe(3);
  });
});

describe("windows", () => {
  it("compares a period against the equal-length period before it", async () => {
    withCollections({
      visits: [
        { site: "portfolio", date: noon(-1) },
        { site: "portfolio", date: noon(-2) },
        { site: "portfolio", date: noon(-9) },
      ],
    });

    const { result } = await renderBoard();
    const card = cardFor(result, "portfolio", "week");

    // Last 7 days holds the -1 and -2 rows; the prior 7 holds the -9 row.
    expect(card.visits.now).toBe(2);
    expect(card.visits.prev).toBe(1);
    expect(card.visits.pct).toBe(100);
  });

  it("excludes rows that fall outside the lookback entirely", async () => {
    withCollections({ visits: [{ site: "portfolio", date: noon(-40) }] });

    const { result } = await renderBoard();

    expect(cardFor(result, "portfolio", "week").visits.now).toBe(0);
  });
});

describe("mixed sources", () => {
  it("keeps conversions and outreach first-party on a GA-fed card", async () => {
    withCollections({
      conversions: [{ site: "portfolio", type: "signup", date: noon() }],
      outreach: [{ site: "portfolio", channel: "LinkedIn", count: 3, date: noon() }],
    });
    mockTraffic.traffic = gaSites({
      portfolio: {
        status: "ok",
        propertyId: "277870276",
        realtimeUsers: 0,
        daily: [{ date: localKey(new Date()), sessions: 200, users: 150 }],
      },
    });

    const { result } = await renderBoard();
    const card = cardFor(result, "portfolio");

    expect(card.conversions.now).toBe(1);
    // Outreach rows carry a count; they are not one apiece.
    expect(card.outreach.now).toBe(3);
    // GA sessions as the denominator, first-party conversions as numerator.
    expect(card.conversionRate.now).toBeCloseTo(0.5);
  });

  it("marks growth from nothing as new instead of dividing by zero", async () => {
    withCollections({ visits: [{ site: "portfolio", date: noon() }] });

    const { result } = await renderBoard();
    const card = cardFor(result, "portfolio");

    expect(card.visits.prev).toBe(0);
    expect(card.visits.pct).toBeNull();
    expect(card.visits.isNew).toBe(true);
  });
});

describe("resilience", () => {
  it("still renders every card when Firestore is unreadable", async () => {
    // The hook logs each failed collection; that is the point, not noise to
    // fix, so it is silenced here rather than in the hook.
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetDocs.mockRejectedValue(new Error("permission-denied"));

    const { result } = await renderBoard();

    expect(result.current.errors).toEqual(["visits", "conversions", "outreach"]);
    expect(result.current.buildStats("week").projects).toHaveLength(8);
  });
});
