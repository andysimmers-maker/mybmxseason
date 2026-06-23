import SEASON_DATA from "./seasons.json";
import NORTH_REGION_DATA from "./northRegion.json";
import CLUB_RACES_DATA from "./clubRaces.json";

export const WEEKENDS = (() => {
  const map = new Map();
  SEASON_DATA.forEach(r => {
    if (!map.has(r.weekend)) map.set(r.weekend, []);
    map.get(r.weekend).push(r);
  });
  return Array.from(map.values()).map(rounds => ({
    ...rounds[0],
    weekendId: rounds[0].weekend,
    rounds,
    roundNumbers: rounds.map(r => r.round),
    dates: rounds.map(r => r.date),
    isNatChamps: rounds.some(r => r.isNatChamps),
  }));
})();

export const NATIONAL = WEEKENDS.map(w => ({ ...w, type: "national", key: w.weekendId }));
export const NORTH_REGION = NORTH_REGION_DATA.map(r => ({ ...r, type: "north", key: `north-${r.id}` }));
export const CLUB_RACES = CLUB_RACES_DATA.map(r => ({ ...r, type: "club", key: `club-${r.id}` }));
export const ALL_EVENTS = [...NATIONAL, ...NORTH_REGION, ...CLUB_RACES];

export const EVENT_TYPE_LABELS = { national: "National", north: "North Region", club: "Club" };

export function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(dateStr, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export function dayBefore(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function eventDate(e) {
  return e.type === "national" ? e.dates[0] : e.date;
}

export function eventEndDate(e) {
  return e.type === "national" ? e.dates[e.dates.length - 1] : e.date;
}

export function eventLabel(e) {
  if (e.type === "national") return e.city;
  if (e.type === "north") return e.location;
  return e.club;
}

// Single source of truth for national deadline fields — used to build both the
// city-prefixed labels (Dashboard/email digest) and the short labels (Calendar cards),
// so adding/removing a deadline only needs updating in one place.
const NATIONAL_DEADLINE_FIELDS = [
  { bookingKey: "entry", dateField: "entryClose", shortLabel: "Entries close" },
  { bookingKey: "parking", dateField: "parkingOpen", shortLabel: "Parking opens" },
  { bookingKey: "practice", dateField: "practiceBookingClose", shortLabel: "Practice booking closes" },
  { bookingKey: "hotel", dateField: "campingOpen", shortLabel: "Camping opens", condition: e => e.campingAvailable },
  { bookingKey: "gazebo", dateField: "gazeboBookingOpen", shortLabel: "Gazebo booking opens", condition: e => e.gazeboBookingOpen !== "TBC" },
];

function nationalDeadlineItems(e, bookings) {
  const b = (bookings && bookings[e.weekendId]) || {};
  return NATIONAL_DEADLINE_FIELDS
    .filter(f => !f.condition || f.condition(e))
    .map(f => e[f.dateField] && { label: f.shortLabel, date: e[f.dateField], done: !!b[f.bookingKey] })
    .filter(Boolean);
}

export function eventDeadlines(e, bookings) {
  if (e.type === "national") {
    const b = (bookings && bookings[e.weekendId]) || {};
    return nationalDeadlineItems(e, bookings).map(item => ({ ...item, label: `${e.city} ${item.label.toLowerCase()}` }));
  }
  if (e.type === "north") {
    if (e.status === "tbc") return [];
    return [{ label: `${e.location} registration closes (11:45am)`, date: dayBefore(e.date) }];
  }
  if (e.type === "club") {
    return [{ label: `${e.club} race day`, date: e.date }];
  }
  return [];
}

export function eventCalendarItems(e, bookings) {
  if (e.type === "national") {
    const items = [
      { label: "Entries open", date: e.entryOpen },
      ...nationalDeadlineItems(e, bookings),
      { label: "Practice", date: e.practiceDate },
      ...e.dates.map((date, i) => ({ label: e.dates.length > 1 ? `Day ${i + 1}` : "Race day", date })),
    ];
    return items.filter(d => d.date);
  }
  if (e.type === "north") {
    if (e.status === "tbc") return [];
    return [...eventDeadlines(e, bookings), { label: "Race day", date: e.date }];
  }
  return eventDeadlines(e, bookings);
}

export function eventHeroTitle(e) {
  if (e.type === "national") return e.venue;
  if (e.type === "north") return e.location;
  return e.club;
}

export function eventHeroSubtitle(e) {
  if (e.type === "national") return `${e.dates.map(formatDate).join(" · ")} · ${e.city}`;
  if (e.type === "north") return `${e.name} · ${e.venue} · ${formatDate(e.date)}`;
  return `${e.series} R${e.round} · ${formatDate(e.date)}`;
}

export function eventHeroEyebrow(e) {
  if (e.type === "national") return `Rounds ${e.roundNumbers.join(" & ")}`;
  return EVENT_TYPE_LABELS[e.type];
}

export function eventHeroTiles(e) {
  if (e.type === "national") {
    return [
      { label: "Practice", date: e.practiceDate },
      { label: "Day 1", date: e.dates[0] },
      { label: "Day 2", date: e.dates[1] },
      { label: "Entries close", date: e.entryClose },
    ].filter(t => t.date);
  }
  if (e.type === "north") {
    return [...eventDeadlines(e), { label: "Race day", date: e.date }];
  }
  return [{ label: "Race day", date: e.date }];
}

export function eventReminderItems(e, bookings) {
  if (e.type === "club") return eventDeadlines(e, bookings);
  const title = eventLabel(e);
  const items = [...eventDeadlines(e, bookings)];
  if (e.type === "national" && e.practiceDate) {
    items.push({ label: `${title} practice day`, date: e.practiceDate });
  }
  items.push({ label: `${title} race day`, date: eventDate(e) });
  return items;
}
