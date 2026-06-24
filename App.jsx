import { useState, useEffect, useRef } from "react";
import COACHING_DATA from "./coaching.json";
import ACCOMMODATION_DATA from "./accommodation.json";
import { supabase } from "./supabase";
import {
  WEEKENDS, ALL_EVENTS, EVENT_TYPE_LABELS,
  formatDate, daysUntil, dayBefore,
  eventDate, eventEndDate, eventLabel, eventDeadlines, eventCalendarItems,
  eventHeroTitle, eventHeroSubtitle, eventHeroEyebrow, eventHeroTiles,
} from "./events.js";

const COLORS = {
  bg: "#0d0d0d",
  surface: "#161616",
  card: "#1e1e1e",
  border: "#2a2a2a",
  red: "#e63329",
  redText: "#fa4a3e", // lighter red, used for text-on-dark — #e63329 fails WCAG AA as text
  blue: "#1a6fd4",
  blueText: "#4d9fff", // lighter blue, used for text-on-dark — #1a6fd4 fails WCAG AA as text
  yellow: "#f5a623",
  green: "#2ecc71",
  textPrimary: "#f0f0f0",
  textSecondary: "#9a9a9a",
  textMuted: "#8a8a8a", // lightened from #6b6b6b — original failed WCAG AA contrast on dark backgrounds
};

const DEFAULT_CHECKLIST = [
  { id: "bike", label: "Bike checked and race-ready", category: "bike" },
  { id: "helmet", label: "Helmet (approved, no cracks)", category: "safety" },
  { id: "goggles", label: "Goggles", category: "safety" },
  { id: "gloves", label: "Gloves", category: "safety" },
  { id: "pads", label: "Knee and elbow pads", category: "safety" },
  { id: "jersey", label: "Race jersey + number plate fitted", category: "kit" },
  { id: "spares", label: "Inner tube, tyre levers, pump", category: "bike" },
  { id: "tools", label: "Allen keys + spanner set", category: "bike" },
  { id: "chain", label: "Chain lube", category: "bike" },
  { id: "bc_card", label: "British Cycling membership card", category: "admin" },
  { id: "entry_confirm", label: "Entry confirmation printed/saved", category: "admin" },
  { id: "parking", label: "Parking booked/confirmed", category: "admin" },
  { id: "camping", label: "Camping booked (if applicable)", category: "admin" },
  { id: "gazebo", label: "Gazebo + pegs + guy ropes", category: "equipment" },
  { id: "chairs", label: "Chairs and table", category: "equipment" },
  { id: "food", label: "Food and drinks packed", category: "equipment" },
  { id: "shelter", label: "Waterproofs / sun cream", category: "equipment" },
  { id: "warmup", label: "Warm-up plan agreed with rider", category: "race" },
  { id: "schedule", label: "Race schedule downloaded", category: "race" },
  { id: "fuel", label: "Car fuelled", category: "travel" },
];

const CATEGORY_COLORS = {
  bike: COLORS.blueText,
  safety: COLORS.redText,
  kit: COLORS.blueText,
  admin: COLORS.blueText,
  equipment: COLORS.blueText,
  race: COLORS.blueText,
  travel: COLORS.blueText,
};

function CoachingView() {
  const [filterCoach, setFilterCoach] = useState("All");
  const now = new Date();
  const allCoaches = ["All", ...Array.from(new Set(COACHING_DATA.map(s => s.coach)))];
  const filtered = COACHING_DATA.filter(s => filterCoach === "All" || s.coach === filterCoach);

  const seen = new Set();
  const weekendGroups = [];
  WEEKENDS.forEach(w => {
    const sessions = filtered.filter(s => w.rounds.some(r => s.roundIds.includes(r.id)));
    if (sessions.length === 0 || seen.has(w.weekendId)) return;
    seen.add(w.weekendId);
    weekendGroups.push({ weekend: w, sessions });
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>2026 Coaching Sessions</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allCoaches.map(c => (
            <button key={c} onClick={() => setFilterCoach(c)} style={{
              background: filterCoach === c ? `${COLORS.red}22` : COLORS.surface,
              border: `1px solid ${filterCoach === c ? COLORS.red : COLORS.border}`,
              color: filterCoach === c ? COLORS.redText : COLORS.textSecondary,
              borderRadius: 20, padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 500,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {weekendGroups.length === 0 && (
        <div style={{ color: COLORS.textMuted, fontSize: 13, padding: 24, textAlign: "center" }}>No sessions found.</div>
      )}

      {weekendGroups.map(({ weekend: w, sessions }) => (
        <div key={w.weekendId} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              height: 24, borderRadius: 12, background: COLORS.red,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, padding: "0 8px",
            }}>R{w.roundNumbers.join("&")}</div>
            <div style={{ fontSize: 16, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 0.5, color: COLORS.textPrimary }}>
              {w.city} — {w.venue.split("(")[0].trim()}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{w.dates.map(formatDate).join(" · ")}</div>
          </div>
          {sessions.map(s => {
            const past = new Date(`${s.date}T${s.time}`) < now;
            const days = daysUntil(s.date);
            const platformColor = COLORS.blue;
            return (
              <div key={s.id} style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderLeft: `4px solid ${past ? COLORS.textMuted : COLORS.blue}`,
                borderRadius: 10, padding: 16, marginBottom: 10, opacity: past ? 0.5 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{s.coach}</div>
                      {s.host !== s.coach && <div style={{ fontSize: 11, color: COLORS.textSecondary }}>· {s.host}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>📅 {formatDate(s.date)} · {s.time}</div>
                      <div style={{ fontSize: 12, color: COLORS.textSecondary }}>👥 {s.ageGroups}</div>
                    </div>
                    {s.notes && <div style={{ fontSize: 12, color: COLORS.textSecondary, fontStyle: "italic" }}>{s.notes}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    {!past && days >= 0 && (
                      <div style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? COLORS.redText : COLORS.textSecondary }}>
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                      </div>
                    )}
                    {s.groupCode && (
                      <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Code: <span style={{ fontWeight: 700, color: COLORS.textPrimary }}>{s.groupCode}</span></div>
                    )}
                    <a href={s.bookingUrl} target="_blank" rel="noreferrer" style={{
                      background: platformColor, color: "#fff", borderRadius: 8,
                      padding: "7px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none",
                    }}>Book · {s.bookingPlatform}</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Dashboard({ onSelectWeekend, onGoToCalendar, myRounds, toggleMyRound, bookings }) {
  const now = new Date();

  const upcomingCoaching = COACHING_DATA
    .filter(s => daysUntil(s.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const myEventsList = [...ALL_EVENTS.filter(e => myRounds.has(e.key) && new Date(eventEndDate(e)) >= now)]
    .sort((a, b) => new Date(eventDate(a)) - new Date(eventDate(b)));
  const nextEvent = myEventsList[0];
  const myDeadlines = [];
  myEventsList.forEach(e => {
    eventDeadlines(e, bookings).forEach(d => { if (!d.done || daysUntil(d.date) >= 0) myDeadlines.push({ ...d, city: eventLabel(e) }); });
  });
  myDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      {myEventsList.length === 0 ? (
        <div style={{
          background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
          padding: 32, textAlign: "center", marginBottom: 24,
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏁</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary, marginBottom: 8 }}>No races added yet</div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 }}>
            Mark races "Going" from the Calendar to build your season and see your deadlines here.
          </div>
          <button onClick={onGoToCalendar} style={{
            background: COLORS.red, color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            Browse Calendar →
          </button>
        </div>
      ) : (
        <>
      {nextEvent && (
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.red}22, ${COLORS.blue}22)`,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12, padding: 24, marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.redText, fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>
            Next Up · {eventHeroEyebrow(nextEvent)}
          </div>
          <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, color: COLORS.textPrimary, marginBottom: 4 }}>
            {eventHeroTitle(nextEvent)}
          </div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>
            {eventHeroSubtitle(nextEvent)}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {eventHeroTiles(nextEvent).map(item => {
              const d = daysUntil(item.date);
              return (
                <div key={item.label} style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, padding: "10px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: d <= 14 ? COLORS.redText : COLORS.textPrimary }}>
                    {d < 0 ? "—" : d === 0 ? "Today" : `${d}d`}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                </div>
              );
            })}
          </div>
          <button onClick={() => onSelectWeekend(nextEvent)} style={{
            marginTop: 16, background: COLORS.red, color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            View Details →
          </button>
        </div>
      )}

      {myEventsList.length > 0 && (
        <div style={{
          background: `${COLORS.blue}0d`, border: `1px solid ${COLORS.blue}44`,
          borderRadius: 12, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: COLORS.blueText, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
            My Season — {myEventsList.length} event{myEventsList.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: myDeadlines.length > 0 ? 14 : 0 }}>
            {myEventsList.map(e => {
              const days = daysUntil(eventDate(e));
              const badge = e.type === "national" ? `R${e.roundNumbers.join("&")}`
                : e.type === "north" ? (e.round ? `NR${e.round}` : "CC")
                : "CLUB";
              const title = e.type === "national" ? e.city : e.type === "north" ? e.location : e.club;
              return (
                <button type="button" key={e.key} onClick={() => onSelectWeekend(e)} style={{
                  background: COLORS.card, border: `1px solid ${COLORS.blue}55`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", textAlign: "center",
                  font: "inherit", color: "inherit",
                }}>
                  <div style={{ fontSize: 11, color: COLORS.blueText, fontWeight: 700, marginBottom: 2 }}>{badge}</div>
                  <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 11, color: days <= 14 ? COLORS.redText : COLORS.textSecondary, fontWeight: days <= 14 ? 700 : 400 }}>
                    {days === 0 ? "Today" : `${days}d`}
                  </div>
                </button>
              );
            })}
          </div>
          {myDeadlines.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Your next deadlines</div>
              {myDeadlines.slice(0, 4).map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "7px 0",
                  borderTop: `1px solid ${COLORS.border}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, color: COLORS.textPrimary }}>{d.label}</span>
                    <span style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 }}>{formatDate(d.date)}</span>
                  </div>
                  {d.done ? (
                    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, flexShrink: 0 }}>✓ Done</div>
                  ) : (() => {
                    const days = daysUntil(d.date);
                    const color = days <= 7 ? COLORS.red : COLORS.textSecondary;
                    return (
                      <div style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
                        {days < 0 ? "Overdue" : days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </>
          )}
        </div>
      )}
        </>
      )}

      {upcomingCoaching.length > 0 && (
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
            Upcoming Coaching
          </div>
          {upcomingCoaching.map(s => {
            const days = daysUntil(s.date);
            const platformColor = COLORS.blue;
            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.blue, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{s.coach}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{s.venue.split(",")[0]} · {formatDate(s.date)} · {s.time}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? COLORS.redText : COLORS.textSecondary, marginRight: 8 }}>
                  {days === 0 ? "Today" : `${days}d`}
                </div>
                {s.groupCode && (
                  <div style={{ fontSize: 11, color: COLORS.textSecondary, marginRight: 4 }}>Code: <span style={{ fontWeight: 700, color: COLORS.textPrimary }}>{s.groupCode}</span></div>
                )}
                <a href={s.bookingUrl} target="_blank" rel="noreferrer" style={{
                  background: platformColor, color: "#fff", borderRadius: 6,
                  padding: "5px 10px", fontSize: 11, fontWeight: 600, textDecoration: "none", flexShrink: 0,
                }}>Book</a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EventDetail({ weekend, checklist, onToggle, onBack, onViewCoaching, myRounds, toggleMyRound, bookings, updateBooking }) {
  const isMine = myRounds && myRounds.has(weekend.weekendId);
  const accomKey = Object.keys(ACCOMMODATION_DATA).find(k =>
    k.split(",").map(Number).some(id => weekend.rounds.map(r => r.id).includes(id))
  );
  const accommodation = accomKey ? ACCOMMODATION_DATA[accomKey] : [];

  const sections = [
    ...weekend.dates.map((date, i) => ({
      key: `race_${i}`,
      label: weekend.dates.length > 1 ? `Race Day ${i + 1}` : "Race Day",
      date,
    })),
    { key: "practice", label: "Practice Day", date: weekend.practiceDate },
    ...(weekend.practiceBookingOpen ? [
      { key: "practice_booking_open", label: "Practice Booking Opens", date: weekend.practiceBookingOpen, done: !!bookings.practice },
    ] : []),
    { key: "entry", label: "Race Entry Closes", date: weekend.entryClose, done: !!bookings.entry },
    { key: "parking_open", label: "Parking Booking Opens", date: weekend.parkingOpen, done: !!bookings.parking },
    ...(weekend.campingAvailable ? [
      { key: "camping_open", label: "Camping Booking Opens", date: weekend.campingOpen, done: !!bookings.hotel },
    ] : []),
    ...(weekend.gazeboBookingOpen && weekend.gazeboBookingOpen !== "TBC" ? [
      { key: "gazebo_open", label: "Gazebo Booking Opens", date: weekend.gazeboBookingOpen, done: !!bookings.gazebo },
    ] : []),
  ];

  const categories = [...new Set(DEFAULT_CHECKLIST.map(i => i.category))];
  const checked = checklist[weekend.weekendId] || {};
  const totalItems = DEFAULT_CHECKLIST.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <button onClick={onBack} style={{
        background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
        borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 20, fontSize: 13,
      }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: COLORS.redText, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          Rounds {weekend.roundNumbers.join(" & ")}
        </div>
        <div style={{ fontSize: 32, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, color: COLORS.textPrimary }}>
          {weekend.venue}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 15, color: COLORS.textSecondary }}>{weekend.city} · {weekend.dates.map(formatDate).join(" & ")}</div>
          {weekend.isNatChamps && (
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              background: `${COLORS.yellow}22`, color: COLORS.yellow,
              border: `1px solid ${COLORS.yellow}55`, borderRadius: 20, padding: "3px 10px",
            }}>★ Nat Champs Weekend</div>
          )}
        </div>
        {(weekend.website || weekend.facebook) && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {weekend.website && (
              <a href={weekend.website} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: 6,
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
                textDecoration: "none", fontWeight: 500,
              }}>🌐 Website</a>
            )}
            {weekend.facebook && (
              <a href={weekend.facebook} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: 6,
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
                textDecoration: "none", fontWeight: 500,
              }}>f Facebook</a>
            )}
            {toggleMyRound && (
              <button onClick={() => toggleMyRound(weekend.weekendId)} style={{
                background: isMine ? `${COLORS.blue}22` : COLORS.card,
                border: `1px solid ${isMine ? COLORS.blue : COLORS.border}`,
                color: isMine ? COLORS.blueText : COLORS.textSecondary,
                borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>
                {isMine ? "✓ I'm Going" : "+ I'm Going"}
              </button>
            )}
          </div>
        )}
      </div>

      {(() => {
        const items = [
          { key: "entry", label: "Race entry submitted" },
          { key: "parking", label: "Parking booked" },
          { key: "gazebo", label: "Gazebo booked", showIf: !!weekend.gazeboBookingOpen },
          { key: "hotel", label: weekend.campingAvailable ? "Camping/accommodation booked" : "Accommodation booked", hasDetails: true },
          { key: "practice", label: "Practice session booked" },
        ].filter(i => i.showIf !== false);

        return (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              Booking Tracker
            </div>
            {items.map(item => {
              const isChecked = !!bookings[item.key];
              const details = bookings[`${item.key}_details`] || {};
              const showForm = isChecked && item.hasDetails;
              return (
                <div key={item.key} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 12, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => updateBooking(item.key, !isChecked)}
                    aria-pressed={isChecked}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                      width: "100%", textAlign: "left", background: "none", border: "none",
                      padding: 0, font: "inherit", color: "inherit",
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${isChecked ? COLORS.green : COLORS.border}`,
                      background: isChecked ? COLORS.green : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                      {isChecked && <span style={{ color: "#000", fontSize: 13, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: isChecked ? COLORS.textMuted : COLORS.textPrimary,
                      textDecoration: isChecked ? "line-through" : "none",
                    }}>{item.label}</span>
                    {item.hasDetails && isChecked && (
                      <span style={{ fontSize: 11, color: COLORS.blueText, marginLeft: "auto" }}>
                        {details.name ? "Edit details" : "Add details"}
                      </span>
                    )}
                  </button>
                  {showForm && (
                    <div style={{ marginTop: 12, paddingLeft: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                      {[
                        { key: "name", label: "Hotel / campsite name", full: true },
                        { key: "address", label: "Address / postcode", full: true },
                        { key: "confirmation", label: "Confirmation / booking ref." },
                        { key: "checkIn", label: "Arrival date" },
                        { key: "checkOut", label: "Departure date" },
                        { key: "phone", label: "Phone number" },
                      ].map(field => {
                        const fieldId = `${item.key}_${field.key}`;
                        return (
                          <div key={field.key} style={{ gridColumn: field.full ? "1 / -1" : "auto" }}>
                            <label htmlFor={fieldId} style={{ display: "block", fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{field.label}</label>
                            <input
                              id={fieldId}
                              value={details[field.key] || ""}
                              onChange={e => updateBooking(`${item.key}_details`, { ...details, [field.key]: e.target.value })}
                              onClick={e => e.stopPropagation()}
                              style={{
                                width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                                borderRadius: 6, padding: "7px 10px", fontSize: 13, color: COLORS.textPrimary,
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {item.hasDetails && isChecked && details.name && !showForm && (
                    <div style={{ marginTop: 6, paddingLeft: 32, fontSize: 12, color: COLORS.textSecondary }}>
                      {details.name}{details.checkIn ? ` · Check-in ${details.checkIn}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
        {sections.map(s => {
          const d = daysUntil(s.date);
          return (
            <div key={s.key} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, marginBottom: 4 }}>{formatDate(s.date)}</div>
              {s.done && <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 700 }}>✓ Done</div>}
              {!s.done && d >= 0 && <div style={{ fontSize: 12, color: d <= 7 ? COLORS.redText : COLORS.textSecondary, fontWeight: 700 }}>{d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`}</div>}
              {!s.done && d < 0 && <div style={{ fontSize: 11, color: COLORS.textMuted }}>Passed</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Gazebo / Team Area</div>
          {weekend.gazeboBookingOpen && (
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, marginBottom: 10,
              color: weekend.gazeboBookingOpen === "TBC" ? COLORS.textMuted : COLORS.blueText,
              background: weekend.gazeboBookingOpen === "TBC" ? `${COLORS.textMuted}18` : `${COLORS.blue}22`,
              border: `1px solid ${weekend.gazeboBookingOpen === "TBC" ? COLORS.textMuted : COLORS.blue}44`,
              borderRadius: 20, padding: "3px 10px",
            }}>
              Booking opens: {weekend.gazeboBookingOpen === "TBC" ? "TBC" : formatDate(weekend.gazeboBookingOpen)}
            </div>
          )}
          <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{weekend.gazeboInfo}</div>
        </div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Travel & Parking</div>
          <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{weekend.travelTip}</div>
        </div>
        {weekend.practiceInfo && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.blue}44`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: COLORS.blueText, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Practice Info</div>
            <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{weekend.practiceInfo}</div>
          </div>
        )}
        {weekend.campingInfo && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.blue}44`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: COLORS.blueText, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Camping Details</div>
            <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{weekend.campingInfo}</div>
          </div>
        )}
        {!weekend.campingAvailable && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Camping</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: "italic" }}>No camping available at this venue.</div>
          </div>
        )}
      </div>

      {(() => {
        const sessions = COACHING_DATA.filter(s => weekend.rounds.some(r => s.roundIds.includes(r.id)));
        if (sessions.length === 0) return null;
        return (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.blue}44`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: COLORS.blueText, textTransform: "uppercase", letterSpacing: 1 }}>Coaching Sessions</div>
              <button onClick={onViewCoaching} style={{
                background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
                borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 11,
              }}>View all →</button>
            </div>
            {sessions.map(s => {
              const days = daysUntil(s.date);
              const past = days < 0;
              const platformColor = COLORS.blue;
              return (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: `1px solid ${COLORS.border}`, opacity: past ? 0.5 : 1,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: past ? COLORS.textMuted : COLORS.blue, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{s.coach}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{formatDate(s.date)} · {s.time} · {s.ageGroups}</div>
                  </div>
                  {!past && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? COLORS.redText : COLORS.textSecondary, marginRight: 4 }}>
                      {days === 0 ? "Today" : `${days}d`}
                    </div>
                  )}
                  {s.groupCode && (
                    <div style={{ fontSize: 11, color: COLORS.textSecondary, marginRight: 4 }}>Code: <span style={{ fontWeight: 700, color: COLORS.textPrimary }}>{s.groupCode}</span></div>
                  )}
                  <a href={s.bookingUrl} target="_blank" rel="noreferrer" style={{
                    background: platformColor, color: "#fff", borderRadius: 6,
                    padding: "5px 10px", fontSize: 11, fontWeight: 600, textDecoration: "none", flexShrink: 0,
                  }}>Book · {s.bookingPlatform}</a>
                </div>
              );
            })}
          </div>
        );
      })()}

      {accommodation.length > 0 && (
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
            Accommodation
          </div>
          {accommodation.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{a.name}</div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                    color: COLORS.blueText,
                    background: `${COLORS.blue}22`,
                    borderRadius: 10, padding: "2px 8px",
                  }}>{a.type}</div>
                </div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 }}>📍 {a.distance}</div>
                {a.communityNotes && <div style={{ fontSize: 12, color: COLORS.textSecondary, fontStyle: "italic" }}>"{a.communityNotes}"</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ fontSize: 12, color: star <= a.communityRating ? COLORS.yellow : COLORS.border }}>★</span>
                  ))}
                </div>
                <a href={a.url} target="_blank" rel="noreferrer" style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                  color: COLORS.textSecondary, borderRadius: 6, padding: "4px 10px",
                  fontSize: 11, fontWeight: 600, textDecoration: "none",
                }}>Book</a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>
            Race Day Checklist
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: checkedCount === totalItems ? COLORS.green : COLORS.textSecondary }}>
            {checkedCount}/{totalItems}
          </div>
        </div>
        <div style={{ height: 6, background: COLORS.border, borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${(checkedCount / totalItems) * 100}%`,
            background: checkedCount === totalItems ? COLORS.green : COLORS.red,
            borderRadius: 3, transition: "width 0.3s ease",
          }} />
        </div>
        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: CATEGORY_COLORS[cat], textTransform: "uppercase", marginBottom: 8 }}>
              {cat}
            </div>
            {DEFAULT_CHECKLIST.filter(i => i.category === cat).map(item => (
              <button
                type="button"
                key={item.id}
                onClick={() => onToggle(weekend.weekendId, item.id)}
                aria-pressed={!!checked[item.id]}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "9px 0",
                  borderTop: "none", borderLeft: "none", borderRight: "none",
                  borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer",
                  width: "100%", textAlign: "left", background: "none",
                  font: "inherit", color: "inherit",
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  border: `2px solid ${checked[item.id] ? COLORS.green : COLORS.border}`,
                  background: checked[item.id] ? COLORS.green : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {checked[item.id] && <span style={{ color: "#000", fontSize: 13, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: 13, color: checked[item.id] ? COLORS.textMuted : COLORS.textPrimary,
                  textDecoration: checked[item.id] ? "line-through" : "none",
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function NorthRegionDetail({ event, onBack, myRounds, toggleMyRound }) {
  const isMine = myRounds && myRounds.has(event.key);
  const isTbc = event.status === "tbc";

  const sections = [
    ...(isTbc ? [] : [{ key: "reg", label: "Registration closes (11:45am)", date: dayBefore(event.date) }]),
    { key: "race", label: "Race day", date: event.date },
  ];

  return (
    <div>
      <button onClick={onBack} style={{
        background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
        borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 20, fontSize: 13,
      }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: COLORS.redText, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          North Region · {event.name}
        </div>
        <div style={{ fontSize: 32, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, color: COLORS.textPrimary }}>
          {event.location}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 15, color: COLORS.textSecondary }}>
            {event.venue}{event.address ? ` · ${event.address}` : ""} · {formatDate(event.date)}
          </div>
          {isTbc && (
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              background: `${COLORS.textMuted}22`, color: COLORS.textMuted,
              border: `1px solid ${COLORS.textMuted}55`, borderRadius: 20, padding: "3px 10px",
            }}>Date TBC</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {event.website && (
            <a href={event.website} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
              textDecoration: "none", fontWeight: 500,
            }}>🌐 Website</a>
          )}
          {event.facebook && (
            <a href={event.facebook} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
              textDecoration: "none", fontWeight: 500,
            }}>f Facebook</a>
          )}
          {event.instagram && (
            <a href={event.instagram} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
              textDecoration: "none", fontWeight: 500,
            }}>📷 Instagram</a>
          )}
          {toggleMyRound && (
            <button onClick={() => toggleMyRound(event.key)} style={{
              background: isMine ? `${COLORS.blue}22` : COLORS.card,
              border: `1px solid ${isMine ? COLORS.blue : COLORS.border}`,
              color: isMine ? COLORS.blueText : COLORS.textSecondary,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>
              {isMine ? "✓ I'm Going" : "+ I'm Going"}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {sections.map(s => {
          const d = daysUntil(s.date);
          return (
            <div key={s.key} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, marginBottom: 4 }}>{formatDate(s.date)}</div>
              {s.done && <div style={{ fontSize: 12, color: COLORS.green, fontWeight: 700 }}>✓ Done</div>}
              {!s.done && d >= 0 && <div style={{ fontSize: 12, color: d <= 7 ? COLORS.redText : COLORS.textSecondary, fontWeight: 700 }}>{d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`}</div>}
              {!s.done && d < 0 && <div style={{ fontSize: 11, color: COLORS.textMuted }}>Passed</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClubRaceDetail({ event, onBack, myRounds, toggleMyRound }) {
  const isMine = myRounds && myRounds.has(event.key);
  const d = daysUntil(event.date);

  return (
    <div>
      <button onClick={onBack} style={{
        background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
        borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 20, fontSize: 13,
      }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: COLORS.redText, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          Club · {event.series} R{event.round}
        </div>
        <div style={{ fontSize: 32, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, color: COLORS.textPrimary }}>
          {event.club}
        </div>
        <div style={{ fontSize: 15, color: COLORS.textSecondary }}>{formatDate(event.date)}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {event.website && (
            <a href={event.website} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
              textDecoration: "none", fontWeight: 500,
            }}>🌐 Website</a>
          )}
          {event.facebook && (
            <a href={event.facebook} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
              textDecoration: "none", fontWeight: 500,
            }}>f Facebook</a>
          )}
          {event.instagram && (
            <a href={event.instagram} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 6,
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
              textDecoration: "none", fontWeight: 500,
            }}>📷 Instagram</a>
          )}
          {toggleMyRound && (
            <button onClick={() => toggleMyRound(event.key)} style={{
              background: isMine ? `${COLORS.blue}22` : COLORS.card,
              border: `1px solid ${isMine ? COLORS.blue : COLORS.border}`,
              color: isMine ? COLORS.blueText : COLORS.textSecondary,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>
              {isMine ? "✓ I'm Going" : "+ I'm Going"}
            </button>
          )}
        </div>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px", maxWidth: 160 }}>
        <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 }}>Race day</div>
        <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, marginBottom: 4 }}>{formatDate(event.date)}</div>
        {d >= 0 && <div style={{ fontSize: 12, color: COLORS.redText, fontWeight: 700 }}>{d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`}</div>}
        {d < 0 && <div style={{ fontSize: 11, color: COLORS.textMuted }}>Passed</div>}
      </div>
    </div>
  );
}

function CalendarView({ onSelectWeekend, myRounds, toggleMyRound, bookings }) {
  const now = new Date();
  const [filterType, setFilterType] = useState("All");
  const filterChips = ["All", "National", "North Region", "Club"];
  const filtered = [...ALL_EVENTS]
    .filter(e => filterType === "All" || EVENT_TYPE_LABELS[e.type] === filterType)
    .sort((a, b) => new Date(eventDate(a)) - new Date(eventDate(b)));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>2026 Race Calendar</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterChips.map(c => (
            <button key={c} onClick={() => setFilterType(c)} style={{
              background: filterType === c ? `${COLORS.red}22` : COLORS.surface,
              border: `1px solid ${filterType === c ? COLORS.red : COLORS.border}`,
              color: filterType === c ? COLORS.redText : COLORS.textSecondary,
              borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500,
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.map(e => {
        const past = new Date(eventEndDate(e)) < now;
        const isMine = myRounds && myRounds.has(e.key);
        const isTbc = e.type === "north" && e.status === "tbc";

        const deadlines = [...eventCalendarItems(e, bookings)].sort((a, b) => new Date(a.date) - new Date(b.date));

        const title = e.type === "national" ? `${e.venue} — ${e.city}`
          : e.type === "north" ? e.location
          : `${e.club} — ${e.series} R${e.round}`;
        const eyebrow = e.type === "national" ? `Rounds ${e.roundNumbers.join(" & ")}`
          : e.type === "north" ? `North Region · ${e.name}`
          : EVENT_TYPE_LABELS[e.type];

        return (
          <div key={e.key} style={{
            background: COLORS.card,
            border: `1px solid ${isMine ? COLORS.blue : COLORS.border}`,
            borderLeft: `4px solid ${past ? COLORS.textMuted : isMine ? COLORS.blue : COLORS.red}`,
            borderRadius: 10, padding: 20, marginBottom: 16, opacity: past ? 0.55 : 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.redText, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                  {eyebrow}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 0.5, color: COLORS.textPrimary }}>
                    {title}
                  </div>
                  {e.type === "national" && e.isNatChamps && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                      background: `${COLORS.yellow}22`, color: COLORS.yellow,
                      border: `1px solid ${COLORS.yellow}55`, borderRadius: 20, padding: "3px 10px",
                    }}>★ Nat Champs</div>
                  )}
                  {isTbc && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                      background: `${COLORS.textMuted}22`, color: COLORS.textMuted,
                      border: `1px solid ${COLORS.textMuted}55`, borderRadius: 20, padding: "3px 10px",
                    }}>Date TBC</div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                {!past && (
                  <button onClick={() => toggleMyRound && toggleMyRound(e.key)} style={{
                    background: isMine ? `${COLORS.blue}22` : "none",
                    border: `1px solid ${isMine ? COLORS.blue : COLORS.border}`,
                    color: isMine ? COLORS.blueText : COLORS.textMuted,
                    borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}>
                    {isMine ? "✓ Going" : "+ Going"}
                  </button>
                )}
                <button onClick={() => onSelectWeekend(e)} style={{
                  background: COLORS.red, color: "#fff", border: "none",
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                }}>
                  Details →
                </button>
              </div>
            </div>
            {e.type !== "club" && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {deadlines.length === 0
                  ? <div style={{ fontSize: 12, color: COLORS.textMuted }}>Date to be confirmed</div>
                  : deadlines.map((d, i) => {
                    const days = daysUntil(d.date);
                    const isRaceDay = d.label.startsWith("Day") || d.label === "Race day";
                    return (
                      <div key={i} style={{
                        padding: "5px 12px", borderRadius: 20,
                        background: d.done ? `${COLORS.green}18` : isRaceDay ? `${COLORS.red}22` : COLORS.surface,
                        border: `1px solid ${d.done ? COLORS.green : isRaceDay ? COLORS.red : COLORS.border}`,
                        fontSize: 12,
                      }}>
                        <span style={{ color: COLORS.textSecondary }}>{d.label}: </span>
                        <span style={{ color: isRaceDay ? COLORS.redText : COLORS.textPrimary, fontWeight: 500 }}>{formatDate(d.date)}</span>
                        {d.done ? (
                          <span style={{ color: COLORS.green, fontWeight: 700, marginLeft: 6 }}>✓ Done</span>
                        ) : days >= 0 && days <= 30 && (
                          <span style={{ color: days <= 7 ? COLORS.redText : COLORS.textSecondary, fontWeight: 700, marginLeft: 6 }}>{days}d</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
            {e.type === "club" && (
              <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{formatDate(e.date)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedWeekend, setSelectedWeekend] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [checklist, setChecklist] = useState({});
  const [myRounds, setMyRounds] = useState(new Set());
  const [bookings, setBookings] = useState({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const loadedUserId = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session && loadedUserId.current !== session.user.id) {
        loadedUserId.current = session.user.id;
        loadUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        if (loadedUserId.current !== session.user.id) {
          loadedUserId.current = session.user.id;
          loadUserData(session.user.id);
        }
      } else {
        loadedUserId.current = null;
        setMyRounds(new Set()); setBookings({}); setChecklist({}); setNotificationsEnabled(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(userId) {
    try {
      const [roundsRes, bookingsRes, checklistRes, settingsRes] = await Promise.all([
        supabase.from("user_rounds").select("weekend_id").eq("user_id", userId),
        supabase.from("user_bookings").select("weekend_id, data").eq("user_id", userId),
        supabase.from("user_checklist").select("weekend_id, data").eq("user_id", userId),
        supabase.from("user_settings").select("email_notifications").eq("user_id", userId).maybeSingle(),
      ]);
      const firstError = [roundsRes, bookingsRes, checklistRes, settingsRes].find(r => r.error)?.error;
      if (firstError) throw firstError;
      if (roundsRes.data) setMyRounds(new Set(roundsRes.data.map(r => r.weekend_id)));
      if (bookingsRes.data) {
        const b = {};
        bookingsRes.data.forEach(row => { b[row.weekend_id] = row.data; });
        setBookings(b);
      }
      if (checklistRes.data) {
        const c = {};
        checklistRes.data.forEach(row => { c[row.weekend_id] = row.data; });
        setChecklist(c);
      }
      setNotificationsEnabled(!!settingsRes.data?.email_notifications);
    } catch (err) {
      setSaveError("Couldn't load your season data — try refreshing the page.");
    }
  }

  function toggleNotifications() {
    const previous = notificationsEnabled;
    const next = !previous;
    setNotificationsEnabled(next);
    supabase.from("user_settings").upsert(
      { user_id: session.user.id, email: session.user.email, email_notifications: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    ).then(({ error }) => {
      if (error) { setNotificationsEnabled(previous); setSaveError("Couldn't save that change — check your connection and try again."); }
    }).catch(() => { setNotificationsEnabled(previous); setSaveError("Couldn't save that change — check your connection and try again."); });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function toggleMyRound(weekendId) {
    const wasMine = myRounds.has(weekendId);
    setMyRounds(prev => {
      const next = new Set(prev);
      if (wasMine) next.delete(weekendId); else next.add(weekendId);
      return next;
    });
    const revert = () => {
      setMyRounds(prev => {
        const next = new Set(prev);
        if (wasMine) next.add(weekendId); else next.delete(weekendId);
        return next;
      });
      setSaveError("Couldn't save that change — check your connection and try again.");
    };
    const op = wasMine
      ? supabase.from("user_rounds").delete().eq("user_id", session.user.id).eq("weekend_id", weekendId)
      : supabase.from("user_rounds").insert({ user_id: session.user.id, weekend_id: weekendId });
    op.then(({ error }) => { if (error) revert(); }).catch(revert);
  }

  function updateBooking(weekendId, key, value) {
    const previous = bookings[weekendId] || {};
    const updated = { ...previous, [key]: value };
    setBookings(prev => ({ ...prev, [weekendId]: updated }));
    const revert = () => {
      setBookings(prev => ({ ...prev, [weekendId]: previous }));
      setSaveError("Couldn't save that change — check your connection and try again.");
    };
    supabase.from("user_bookings").upsert(
      { user_id: session.user.id, weekend_id: weekendId, data: updated, updated_at: new Date().toISOString() },
      { onConflict: "user_id,weekend_id" }
    ).then(({ error }) => { if (error) revert(); }).catch(revert);
  }

  function handleSelectWeekend(weekend) {
    setSelectedWeekend(weekend);
    setView("detail");
  }

  function handleToggle(weekendId, itemId) {
    const previous = checklist[weekendId] || {};
    const updated = { ...previous, [itemId]: !previous[itemId] };
    setChecklist(prev => ({ ...prev, [weekendId]: updated }));
    const revert = () => {
      setChecklist(prev => ({ ...prev, [weekendId]: previous }));
      setSaveError("Couldn't save that change — check your connection and try again.");
    };
    supabase.from("user_checklist").upsert(
      { user_id: session.user.id, weekend_id: weekendId, data: updated, updated_at: new Date().toISOString() },
      { onConflict: "user_id,weekend_id" }
    ).then(({ error }) => { if (error) revert(); }).catch(revert);
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "calendar", label: "Calendar" },
    { key: "coaching", label: "Coaching" },
  ];

  if (authLoading) return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Loading...</div>
    </div>
  );

  if (!session) return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 40, width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <img src="/logo.png" alt="" width={32} height={32} style={{ borderRadius: "50%", flexShrink: 0 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>My BMX Season</span>
        </div>
        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })}
          style={{
            width: "100%", background: "#fff", color: "#1f1f1f", border: "1px solid #dadce0",
            borderRadius: 8, padding: 11, cursor: "pointer", fontSize: 14, fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="app-header" style={{
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, position: "sticky", top: 0, background: COLORS.bg, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="" width={28} height={28} style={{ borderRadius: "50%", flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3 }}>My BMX Season</span>
        </div>
        <div className="app-header-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {navItems.map(n => (
              <button key={n.key} onClick={() => { setView(n.key); setSelectedWeekend(null); }} style={{
                background: view === n.key && !selectedWeekend ? `${COLORS.red}22` : "none",
                border: `1px solid ${view === n.key && !selectedWeekend ? COLORS.red : "transparent"}`,
                color: view === n.key && !selectedWeekend ? COLORS.redText : COLORS.textSecondary,
                borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500,
              }}>
                {n.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: `1px solid ${COLORS.border}` }}>
            <button onClick={toggleNotifications} title="Email reminders the day before a deadline or race" style={{
              background: notificationsEnabled ? `${COLORS.blue}22` : "none",
              border: `1px solid ${notificationsEnabled ? COLORS.blue : COLORS.border}`,
              color: notificationsEnabled ? COLORS.blueText : COLORS.textMuted,
              borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600,
            }}>
              🔔 Reminders {notificationsEnabled ? "On" : "Off"}
            </button>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{session.user.email}</span>
            <button onClick={signOut} style={{
              background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted,
              borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11,
            }}>Sign out</button>
          </div>
        </div>
      </div>

      {saveError && (
        <div style={{
          background: `${COLORS.red}1a`, borderBottom: `1px solid ${COLORS.red}55`,
          color: COLORS.redText, padding: "10px 24px", fontSize: 13,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <span>{saveError}</span>
          <button type="button" onClick={() => setSaveError(null)} aria-label="Dismiss" style={{
            background: "none", border: "none", color: COLORS.redText, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0,
          }}>×</button>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {view === "detail" && selectedWeekend && selectedWeekend.type === "north"
          ? <NorthRegionDetail
              event={selectedWeekend}
              onBack={() => { setView("dashboard"); setSelectedWeekend(null); }}
              myRounds={myRounds}
              toggleMyRound={toggleMyRound}
            />
          : view === "detail" && selectedWeekend && selectedWeekend.type === "club"
          ? <ClubRaceDetail
              event={selectedWeekend}
              onBack={() => { setView("dashboard"); setSelectedWeekend(null); }}
              myRounds={myRounds}
              toggleMyRound={toggleMyRound}
            />
          : view === "detail" && selectedWeekend
          ? <EventDetail
              weekend={selectedWeekend}
              checklist={checklist}
              onToggle={handleToggle}
              onBack={() => { setView("dashboard"); setSelectedWeekend(null); }}
              onViewCoaching={() => { setView("coaching"); setSelectedWeekend(null); }}
              myRounds={myRounds}
              toggleMyRound={toggleMyRound}
              bookings={bookings[selectedWeekend.weekendId] || {}}
              updateBooking={(key, value) => updateBooking(selectedWeekend.weekendId, key, value)}
            />
          : view === "calendar"
          ? <CalendarView onSelectWeekend={handleSelectWeekend} myRounds={myRounds} toggleMyRound={toggleMyRound} bookings={bookings} />
          : view === "coaching"
          ? <CoachingView />
          : <Dashboard onSelectWeekend={handleSelectWeekend} onGoToCalendar={() => setView("calendar")} myRounds={myRounds} toggleMyRound={toggleMyRound} bookings={bookings} />
        }
      </div>
    </div>
  );
}
