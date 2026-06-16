import { useState, useEffect } from "react";
import SEASON_DATA from "./seasons.json";
import COACHING_DATA from "./coaching.json";
import ACCOMMODATION_DATA from "./accommodation.json";
import { supabase } from "./supabase";

const COLORS = {
  bg: "#0d0d0d",
  surface: "#161616",
  card: "#1e1e1e",
  border: "#2a2a2a",
  red: "#e63329",
  blue: "#1a6fd4",
  yellow: "#f5a623",
  green: "#2ecc71",
  textPrimary: "#f0f0f0",
  textSecondary: "#888",
  textMuted: "#555",
};

const PLATFORM_COLORS = { "Spond": "#00b894", "Website": COLORS.blue };

const WEEKENDS = (() => {
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
  bike: COLORS.blue,
  safety: COLORS.red,
  kit: "#9b59b6",
  admin: COLORS.yellow,
  equipment: "#1abc9c",
  race: COLORS.green,
  travel: "#e67e22",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const [year, month, day] = dateStr.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function DeadlinePill({ label, date }) {
  const days = daysUntil(date);
  if (days < 0) return null;
  const color = days <= 7 ? COLORS.red : days <= 21 ? COLORS.yellow : COLORS.green;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 8, marginBottom: 8,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{formatDate(date)}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color, background: `${color}22`, padding: "3px 10px", borderRadius: 20 }}>
        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
      </div>
    </div>
  );
}

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
              color: filterCoach === c ? COLORS.red : COLORS.textSecondary,
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
            const platformColor = PLATFORM_COLORS[s.bookingPlatform] || COLORS.blue;
            return (
              <div key={s.id} style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderLeft: `4px solid ${past ? COLORS.textMuted : "#9b59b6"}`,
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
                      <div style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? COLORS.red : COLORS.yellow }}>
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

function Dashboard({ onSelectWeekend, myRounds, toggleMyRound }) {
  const now = new Date();
  const upcomingWeekends = WEEKENDS.filter(w => new Date(w.dates[w.dates.length - 1]) >= now);
  const nextWeekend = upcomingWeekends[0];

  const allDeadlines = [];
  WEEKENDS.forEach(w => {
    if (new Date(w.dates[0]) >= now) {
      if (daysUntil(w.entryClose) >= 0) allDeadlines.push({ label: `${w.city} entries close`, date: w.entryClose });
      if (daysUntil(w.parkingOpen) >= 0) allDeadlines.push({ label: `${w.city} parking opens`, date: w.parkingOpen });
      if (w.campingAvailable && daysUntil(w.campingOpen) >= 0) allDeadlines.push({ label: `${w.city} camping opens`, date: w.campingOpen });
      if (w.gazeboBookingOpen && w.gazeboBookingOpen !== "TBC" && daysUntil(w.gazeboBookingOpen) >= 0) allDeadlines.push({ label: `${w.city} gazebo booking opens`, date: w.gazeboBookingOpen });
    }
  });
  allDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  const soonDeadlines = allDeadlines.slice(0, 5);

  const upcomingCoaching = COACHING_DATA
    .filter(s => daysUntil(s.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const myWeekendsList = WEEKENDS.filter(w => myRounds.has(w.weekendId) && new Date(w.dates[0]) >= now);
  const myDeadlines = [];
  myWeekendsList.forEach(w => {
    if (daysUntil(w.entryClose) >= 0) myDeadlines.push({ label: `${w.city} entries close`, date: w.entryClose, city: w.city });
    if (daysUntil(w.parkingOpen) >= 0) myDeadlines.push({ label: `${w.city} parking opens`, date: w.parkingOpen, city: w.city });
    if (w.campingAvailable && daysUntil(w.campingOpen) >= 0) myDeadlines.push({ label: `${w.city} camping opens`, date: w.campingOpen, city: w.city });
    if (w.gazeboBookingOpen && w.gazeboBookingOpen !== "TBC" && daysUntil(w.gazeboBookingOpen) >= 0) myDeadlines.push({ label: `${w.city} gazebo opens`, date: w.gazeboBookingOpen, city: w.city });
  });
  myDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      {nextWeekend && (
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.red}22, ${COLORS.blue}22)`,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12, padding: 24, marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.red, fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>
            Next Weekend
          </div>
          <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, color: COLORS.textPrimary, marginBottom: 4 }}>
            Rounds {nextWeekend.roundNumbers.join(" & ")} — {nextWeekend.venue}
          </div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>
            {nextWeekend.dates.map(formatDate).join(" · ")} · {nextWeekend.city}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Practice", date: nextWeekend.practiceDate },
              { label: "Day 1", date: nextWeekend.dates[0] },
              { label: "Day 2", date: nextWeekend.dates[1] },
              { label: "Entries close", date: nextWeekend.entryClose },
            ].filter(item => item.date).map(item => {
              const d = daysUntil(item.date);
              return (
                <div key={item.label} style={{
                  background: COLORS.card, border: `1px solid ${COLORS.border}`,
                  borderRadius: 8, padding: "10px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: d <= 14 ? COLORS.red : COLORS.textPrimary }}>
                    {d < 0 ? "—" : d === 0 ? "Today" : `${d}d`}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{item.label}</div>
                </div>
              );
            })}
          </div>
          <button onClick={() => onSelectWeekend(nextWeekend)} style={{
            marginTop: 16, background: COLORS.red, color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            View Weekend Details →
          </button>
        </div>
      )}

      {myWeekendsList.length > 0 && (
        <div style={{
          background: `${COLORS.blue}0d`, border: `1px solid ${COLORS.blue}44`,
          borderRadius: 12, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: COLORS.blue, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
            My Season — {myWeekendsList.length} weekend{myWeekendsList.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: myDeadlines.length > 0 ? 14 : 0 }}>
            {myWeekendsList.map(w => {
              const days = daysUntil(w.dates[0]);
              return (
                <div key={w.weekendId} onClick={() => onSelectWeekend(w)} style={{
                  background: COLORS.card, border: `1px solid ${COLORS.blue}55`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: COLORS.blue, fontWeight: 700, marginBottom: 2 }}>R{w.roundNumbers.join("&")}</div>
                  <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{w.city}</div>
                  <div style={{ fontSize: 11, color: days <= 14 ? COLORS.red : COLORS.textSecondary, fontWeight: days <= 14 ? 700 : 400 }}>
                    {days === 0 ? "Today" : `${days}d`}
                  </div>
                </div>
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
                  {(() => {
                    const days = daysUntil(d.date);
                    const color = days <= 7 ? COLORS.red : days <= 21 ? COLORS.yellow : COLORS.green;
                    return (
                      <div style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
            Upcoming Deadlines
          </div>
          {soonDeadlines.length === 0
            ? <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No upcoming deadlines</div>
            : soonDeadlines.map((d, i) => <DeadlinePill key={i} label={d.label} date={d.date} />)
          }
        </div>

        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
            Season Overview
          </div>
          {WEEKENDS.map(w => {
            const past = new Date(w.dates[w.dates.length - 1]) < now;
            const isNext = nextWeekend && w.weekendId === nextWeekend.weekendId;
            const isMine = myRounds.has(w.weekendId);
            return (
              <div key={w.weekendId} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                borderBottom: `1px solid ${COLORS.border}`,
                background: isMine ? `${COLORS.blue}0a` : "transparent",
                borderLeft: isMine ? `3px solid ${COLORS.blue}` : "3px solid transparent",
                paddingLeft: isMine ? 8 : 0,
                opacity: past ? 0.45 : 1,
                transition: "all 0.15s",
              }}>
                <div onClick={() => onSelectWeekend(w)} style={{
                  height: 28, borderRadius: 14, cursor: "pointer",
                  background: isMine ? COLORS.blue : isNext ? COLORS.red : past ? COLORS.textMuted : COLORS.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, padding: "0 8px",
                }}>
                  {w.roundNumbers.join("·")}
                </div>
                <div onClick={() => onSelectWeekend(w)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: isMine ? 600 : 500 }}>{w.city}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{formatDate(w.dates[0])} – {formatDate(w.dates[w.dates.length - 1])}</div>
                </div>
                {isNext && !isMine && <div style={{ fontSize: 10, color: COLORS.red, fontWeight: 700, letterSpacing: 1 }}>NEXT</div>}
                {past && <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: 1 }}>DONE</div>}
                {!past && (
                  <button onClick={(e) => { e.stopPropagation(); toggleMyRound(w.weekendId); }} style={{
                    background: isMine ? `${COLORS.blue}22` : "none",
                    border: `1px solid ${isMine ? COLORS.blue : COLORS.border}`,
                    color: isMine ? COLORS.blue : COLORS.textMuted,
                    borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 10, fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {isMine ? "✓ Going" : "+ Going"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {upcomingCoaching.length > 0 && (
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
            Upcoming Coaching
          </div>
          {upcomingCoaching.map(s => {
            const days = daysUntil(s.date);
            const platformColor = PLATFORM_COLORS[s.bookingPlatform] || COLORS.blue;
            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9b59b6", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: COLORS.textPrimary, fontWeight: 600 }}>{s.coach}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{s.venue.split(",")[0]} · {formatDate(s.date)} · {s.time}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? COLORS.red : COLORS.yellow, marginRight: 8 }}>
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
      color: COLORS.red,
    })),
    { key: "practice", label: "Practice Day", date: weekend.practiceDate, color: COLORS.blue },
    { key: "entry_open", label: "Entries Open", date: weekend.entryOpen, color: COLORS.green },
    { key: "entry_close", label: "Entries Close", date: weekend.entryClose, color: COLORS.yellow },
    { key: "parking_open", label: "Parking Opens", date: weekend.parkingOpen, color: "#e67e22" },
    ...(weekend.campingAvailable ? [
      { key: "camping_open", label: "Camping Opens", date: weekend.campingOpen, color: "#1abc9c" },
    ] : []),
    ...(weekend.gazeboBookingOpen && weekend.gazeboBookingOpen !== "TBC" ? [
      { key: "gazebo_open", label: "Gazebo Booking Opens", date: weekend.gazeboBookingOpen, color: "#9b59b6" },
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
        <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
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
                borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#1877f2",
                textDecoration: "none", fontWeight: 500,
              }}>f Facebook</a>
            )}
            {toggleMyRound && (
              <button onClick={() => toggleMyRound(weekend.weekendId)} style={{
                background: isMine ? `${COLORS.blue}22` : COLORS.card,
                border: `1px solid ${isMine ? COLORS.blue : COLORS.border}`,
                color: isMine ? COLORS.blue : COLORS.textSecondary,
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
          { key: "hotel", label: "Accommodation booked", hasDetails: true },
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
                  <div onClick={() => updateBooking(item.key, !isChecked)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
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
                      <span style={{ fontSize: 11, color: COLORS.blue, marginLeft: "auto" }}>
                        {details.name ? "Edit details" : "Add details"}
                      </span>
                    )}
                  </div>
                  {showForm && (
                    <div style={{ marginTop: 12, paddingLeft: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { key: "name", label: "Hotel / campsite name", full: true },
                        { key: "address", label: "Address / postcode", full: true },
                        { key: "confirmation", label: "Confirmation / booking ref." },
                        { key: "checkIn", label: "Arrival date" },
                        { key: "checkOut", label: "Departure date" },
                        { key: "phone", label: "Phone number" },
                      ].map(field => (
                        <div key={field.key} style={{ gridColumn: field.full ? "1 / -1" : "auto" }}>
                          <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{field.label}</div>
                          <input
                            value={details[field.key] || ""}
                            onChange={e => updateBooking(`${item.key}_details`, { ...details, [field.key]: e.target.value })}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                              borderRadius: 6, padding: "7px 10px", fontSize: 13, color: COLORS.textPrimary,
                              outline: "none", boxSizing: "border-box",
                            }}
                          />
                        </div>
                      ))}
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
              {d >= 0 && <div style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>{d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`}</div>}
              {d < 0 && <div style={{ fontSize: 11, color: COLORS.textMuted }}>Passed</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Gazebo / Team Area</div>
          {weekend.gazeboBookingOpen && (
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, marginBottom: 10,
              color: weekend.gazeboBookingOpen === "TBC" ? COLORS.textMuted : "#9b59b6",
              background: weekend.gazeboBookingOpen === "TBC" ? `${COLORS.textMuted}18` : "#9b59b622",
              border: `1px solid ${weekend.gazeboBookingOpen === "TBC" ? COLORS.textMuted : "#9b59b6"}44`,
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
            <div style={{ fontSize: 12, color: COLORS.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Practice Info</div>
            <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{weekend.practiceInfo}</div>
          </div>
        )}
        {weekend.campingInfo && (
          <div style={{ background: COLORS.card, border: `1px solid #1abc9c44`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: "#1abc9c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Camping Details</div>
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
          <div style={{ background: COLORS.card, border: `1px solid #9b59b644`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#9b59b6", textTransform: "uppercase", letterSpacing: 1 }}>Coaching Sessions</div>
              <button onClick={onViewCoaching} style={{
                background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary,
                borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 11,
              }}>View all →</button>
            </div>
            {sessions.map(s => {
              const days = daysUntil(s.date);
              const past = days < 0;
              const platformColor = PLATFORM_COLORS[s.bookingPlatform] || COLORS.blue;
              return (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: `1px solid ${COLORS.border}`, opacity: past ? 0.5 : 1,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: past ? COLORS.textMuted : "#9b59b6", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{s.coach}</div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{formatDate(s.date)} · {s.time} · {s.ageGroups}</div>
                  </div>
                  {!past && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? COLORS.red : COLORS.yellow, marginRight: 4 }}>
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
                    color: a.type === "Camping" ? "#1abc9c" : COLORS.blue,
                    background: a.type === "Camping" ? "#1abc9c22" : `${COLORS.blue}22`,
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
          <div style={{ fontSize: 13, fontWeight: 700, color: checkedCount === totalItems ? COLORS.green : COLORS.yellow }}>
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
              <div key={item.id} onClick={() => onToggle(weekend.weekendId, item.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "9px 0",
                borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer",
              }}>
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
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarView({ onSelectWeekend, myRounds }) {
  const now = new Date();
  return (
    <div>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>
        2026 National Series
      </div>
      {WEEKENDS.map(w => {
        const past = new Date(w.dates[w.dates.length - 1]) < now;
        const deadlines = [
          { label: "Entries open", date: w.entryOpen },
          { label: "Parking opens", date: w.parkingOpen },
          ...(w.campingAvailable ? [{ label: "Camping opens", date: w.campingOpen }] : []),
          ...(w.gazeboBookingOpen && w.gazeboBookingOpen !== "TBC" ? [{ label: "Gazebo booking opens", date: w.gazeboBookingOpen }] : []),
          { label: "Entries close", date: w.entryClose },
          { label: "Practice", date: w.practiceDate },
          ...w.dates.map((date, i) => ({ label: w.dates.length > 1 ? `Day ${i + 1}` : "Race day", date })),
        ].filter(d => d.date).sort((a, b) => new Date(a.date) - new Date(b.date));

        return (
          <div key={w.weekendId} style={{
            background: COLORS.card,
            border: `1px solid ${myRounds && myRounds.has(w.weekendId) ? COLORS.blue : COLORS.border}`,
            borderLeft: `4px solid ${past ? COLORS.textMuted : myRounds && myRounds.has(w.weekendId) ? COLORS.blue : COLORS.red}`,
            borderRadius: 10, padding: 20, marginBottom: 16, opacity: past ? 0.55 : 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                  Rounds {w.roundNumbers.join(" & ")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 0.5, color: COLORS.textPrimary }}>
                    {w.venue} — {w.city}
                  </div>
                  {w.isNatChamps && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                      background: `${COLORS.yellow}22`, color: COLORS.yellow,
                      border: `1px solid ${COLORS.yellow}55`, borderRadius: 20, padding: "3px 10px",
                    }}>★ Nat Champs</div>
                  )}
                </div>
              </div>
              <button onClick={() => onSelectWeekend(w)} style={{
                background: COLORS.red, color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>
                Details →
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {deadlines.map((d, i) => {
                const days = daysUntil(d.date);
                const isRaceDay = d.label.startsWith("Day") || d.label === "Race day";
                return (
                  <div key={i} style={{
                    padding: "5px 12px", borderRadius: 20,
                    background: isRaceDay ? `${COLORS.red}22` : COLORS.surface,
                    border: `1px solid ${isRaceDay ? COLORS.red : COLORS.border}`,
                    fontSize: 12,
                  }}>
                    <span style={{ color: COLORS.textSecondary }}>{d.label}: </span>
                    <span style={{ color: isRaceDay ? COLORS.red : COLORS.textPrimary, fontWeight: 500 }}>{formatDate(d.date)}</span>
                    {days >= 0 && days <= 30 && (
                      <span style={{ color: COLORS.yellow, fontWeight: 700, marginLeft: 6 }}>{days}d</span>
                    )}
                  </div>
                );
              })}
            </div>
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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSent, setLoginSent] = useState(false);

  const [checklist, setChecklist] = useState({});
  const [myRounds, setMyRounds] = useState(new Set());
  const [bookings, setBookings] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) loadUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
      else { setMyRounds(new Set()); setBookings({}); setChecklist({}); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadUserData(userId) {
    const [roundsRes, bookingsRes, checklistRes] = await Promise.all([
      supabase.from("user_rounds").select("weekend_id").eq("user_id", userId),
      supabase.from("user_bookings").select("weekend_id, data").eq("user_id", userId),
      supabase.from("user_checklist").select("weekend_id, data").eq("user_id", userId),
    ]);
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
  }

  async function sendMagicLink(e) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoginSent(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function toggleMyRound(weekendId) {
    setMyRounds(prev => {
      const next = new Set(prev);
      if (next.has(weekendId)) {
        next.delete(weekendId);
        supabase.from("user_rounds").delete()
          .eq("user_id", session.user.id).eq("weekend_id", weekendId).then();
      } else {
        next.add(weekendId);
        supabase.from("user_rounds").insert({ user_id: session.user.id, weekend_id: weekendId }).then();
      }
      return next;
    });
  }

  function updateBooking(weekendId, key, value) {
    setBookings(prev => {
      const updated = { ...(prev[weekendId] || {}), [key]: value };
      const next = { ...prev, [weekendId]: updated };
      supabase.from("user_bookings").upsert(
        { user_id: session.user.id, weekend_id: weekendId, data: updated, updated_at: new Date().toISOString() },
        { onConflict: "user_id,weekend_id" }
      ).then();
      return next;
    });
  }

  function handleSelectWeekend(weekend) {
    setSelectedWeekend(weekend);
    setView("detail");
  }

  function handleToggle(weekendId, itemId) {
    setChecklist(prev => {
      const updated = { ...(prev[weekendId] || {}), [itemId]: !(prev[weekendId]?.[itemId]) };
      const next = { ...prev, [weekendId]: updated };
      supabase.from("user_checklist").upsert(
        { user_id: session.user.id, weekend_id: weekendId, data: updated, updated_at: new Date().toISOString() },
        { onConflict: "user_id,weekend_id" }
      ).then();
      return next;
    });
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
          <div style={{ width: 32, height: 32, background: COLORS.red, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff" }}>B</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary }}>My BMX Season</span>
        </div>
        {!loginSent ? (
          <form onSubmit={sendMagicLink}>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>Enter your email to sign in</div>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              style={{
                width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 14, color: COLORS.textPrimary,
                outline: "none", boxSizing: "border-box", marginBottom: 12,
              }}
            />
            <button type="submit" style={{
              width: "100%", background: COLORS.red, color: "#fff", border: "none",
              borderRadius: 8, padding: 11, cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}>
              Send sign-in link
            </button>
          </form>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, marginBottom: 8 }}>Check your email</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary }}>We sent a sign-in link to <strong style={{ color: COLORS.textPrimary }}>{loginEmail}</strong></div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.textPrimary, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, position: "sticky", top: 0, background: COLORS.bg, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: COLORS.red, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>B</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3 }}>My BMX Season</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {navItems.map(n => (
              <button key={n.key} onClick={() => { setView(n.key); setSelectedWeekend(null); }} style={{
                background: view === n.key && !selectedWeekend ? `${COLORS.red}22` : "none",
                border: `1px solid ${view === n.key && !selectedWeekend ? COLORS.red : "transparent"}`,
                color: view === n.key && !selectedWeekend ? COLORS.red : COLORS.textSecondary,
                borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500,
              }}>
                {n.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{session.user.email}</span>
            <button onClick={signOut} style={{
              background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted,
              borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11,
            }}>Sign out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {view === "detail" && selectedWeekend
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
          ? <CalendarView onSelectWeekend={handleSelectWeekend} myRounds={myRounds} />
          : view === "coaching"
          ? <CoachingView />
          : <Dashboard onSelectWeekend={handleSelectWeekend} myRounds={myRounds} toggleMyRound={toggleMyRound} />
        }
      </div>
    </div>
  );
}
