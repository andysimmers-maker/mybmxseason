import { useState, useEffect } from "react";

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

const SEASON_DATA = [
  {
    id: 1,
    round: 1,
    venue: "National Cycling Centre (Indoor)",
    city: "Manchester",
    date: "2026-04-11",
    practiceDate: "2026-04-10",
    entryOpen: "2026-02-01",
    entryClose: "2026-04-06",
    parkingOpen: "2026-03-01",
    campingAvailable: false,
    gazeboBookingOpen: null,
    gazeboInfo: "Indoor venue — no gazebos. Limited team area spaces; priority goes to top 10 elite teams from 2025. Spectator wristbands £10 (2-day pass), under 5s free. Card payments only.",
    travelTip: "Stuart Street, Manchester M11 4DQ. Parking at NCC; overflow at Car Park G, 9 Sportcity Way M11 3DU. Metrolink to 'Velopark' stop — every 12 mins from Piccadilly or Victoria. No bikes on trams. No food hampers or cool bags permitted inside.",
    practiceInfo: "Book via BC website. £6 (£5 + £1 admin). Must book by Thu 9 Apr 9am — no on-the-day purchase. Fri: Champs 15:30, 12&Under 16:30, 13&Over 18:05, Open 19:40.",
    website: "https://www.nationalcyclingcentre.com",
    facebook: "https://www.facebook.com/nationalcyclingcentre",
    status: "complete",
  },
  {
    id: 2,
    round: 2,
    venue: "National Cycling Centre (Indoor)",
    city: "Manchester",
    date: "2026-04-12",
    practiceDate: "2026-04-10",
    entryOpen: "2026-02-01",
    entryClose: "2026-04-06",
    parkingOpen: "2026-03-01",
    campingAvailable: false,
    gazeboBookingOpen: null,
    gazeboInfo: "Indoor venue — no gazebos. Limited team area spaces; priority goes to top 10 elite teams from 2025. Spectator wristbands £10 (2-day pass), under 5s free. Card payments only.",
    travelTip: "Stuart Street, Manchester M11 4DQ. Parking at NCC; overflow at Car Park G, 9 Sportcity Way M11 3DU. Metrolink to 'Velopark' stop — every 12 mins from Piccadilly or Victoria. No bikes on trams. No food hampers or cool bags permitted inside.",
    practiceInfo: "Book via BC website. £6 (£5 + £1 admin). Must book by Thu 9 Apr 9am — no on-the-day purchase. Fri: Champs 15:30, 12&Under 16:30, 13&Over 18:05, Open 19:40.",
    website: "https://www.nationalcyclingcentre.com",
    facebook: "https://www.facebook.com/nationalcyclingcentre",
    status: "complete",
  },
  {
    id: 3,
    round: 3,
    venue: "Glasgow BMX Centre (Movement Park)",
    city: "Glasgow",
    date: "2026-05-02",
    practiceDate: "2026-05-01",
    entryOpen: "2026-03-01",
    entryClose: "2026-04-27",
    parkingOpen: "2026-03-15",
    campingAvailable: false,
    gazeboBookingOpen: "TBC",
    gazeboInfo: "Team/club areas pre-booked via Movement Park system. BC-affiliated clubs only. No camping on site. Spectator areas along start hill and finish line — no camping chairs allowed in spectator zones.",
    travelTip: "137 Archerhill Road, Glasgow G13 3LS. M6 North to M74 North, exit Kinning Park, then A814/Danes Drive. 242 on-site spaces — must pre-book, first come first served. Overflow at Scotstoun Stadium with free shuttle bus Sat/Sun. On-site VIP parking £30, large vans £35. Scotstoun standard parking £10.",
    practiceInfo: "Book via movementpark.org.uk/bmxnationalseries. Fri: 12&Under 16:15, 13&Over 17:45, Champs 19:05, Open 19:50.",
    website: "https://www.movementpark.org.uk",
    facebook: "https://www.facebook.com/movementparkglasgow",
    status: "upcoming",
  },
  {
    id: 4,
    round: 4,
    venue: "Glasgow BMX Centre (Movement Park)",
    city: "Glasgow",
    date: "2026-05-03",
    practiceDate: "2026-05-01",
    entryOpen: "2026-03-01",
    entryClose: "2026-04-27",
    parkingOpen: "2026-03-15",
    campingAvailable: false,
    gazeboBookingOpen: "TBC",
    gazeboInfo: "Team/club areas pre-booked via Movement Park system. BC-affiliated clubs only. No camping on site. Spectator areas along start hill and finish line — no camping chairs allowed in spectator zones.",
    travelTip: "137 Archerhill Road, Glasgow G13 3LS. M6 North to M74 North, exit Kinning Park, then A814/Danes Drive. 242 on-site spaces — must pre-book, first come first served. Overflow at Scotstoun Stadium with free shuttle bus Sat/Sun. On-site VIP parking £30, large vans £35. Scotstoun standard parking £10.",
    practiceInfo: "Book via movementpark.org.uk/bmxnationalseries. Fri: 12&Under 16:15, 13&Over 17:45, Champs 19:05, Open 19:50.",
    website: "https://www.movementpark.org.uk",
    facebook: "https://www.facebook.com/movementparkglasgow",
    status: "upcoming",
  },
  {
    id: 5,
    round: 5,
    venue: "Gosport BMX Club",
    city: "Gosport",
    date: "2026-06-13",
    practiceDate: "2026-06-12",
    entryOpen: "2026-04-01",
    entryClose: "2026-06-08",
    parkingOpen: "2026-04-15",
    campingAvailable: true,
    campingOpen: "2026-04-15",
    gazeboBookingOpen: "TBC",
    gazeboInfo: "BC-affiliated teams only. Book via gosportbmx.co.uk. Elite team gazebos on bund behind berms 1 & 3 and along finish straight. Site plan published the week before. Spectator entry free. Parking hanger must be displayed at all times.",
    travelTip: "Alver Valley, Grange Road, Gosport PO13 8AS. Approx 6 miles from M27. Parking on HMS Sultan fields — £15 for the weekend, buy in advance at gosportbmx.co.uk or pay cash/card at gate. Parking open from 09:00 Fri 12 June, 07:30 Sat/Sun. Do not park on Grange Road grass verge.",
    campingInfo: "HMS Sultan Polo Fields. Entrance via Military Road opposite Cocked Hat Pub — use postcode PO12 3TR. £70 for the weekend. Toilets and showers on site. Opens 10:00 Fri 12 June. No dogs on campsite (dogs allowed trackside on lead). No disposable BBQs on grass. No noise after 10pm.",
    practiceInfo: "£5 per rider. Buy wristband via gosportbmx.co.uk or on the night. Fri: 12&Under 16:00, 13&Over 17:45, Champs 19:05, Open 19:45.",
    website: "https://www.gosportbmx.co.uk",
    facebook: "https://www.facebook.com/GosportBMX",
    status: "upcoming",
  },
  {
    id: 6,
    round: 6,
    venue: "Gosport BMX Club",
    city: "Gosport",
    date: "2026-06-14",
    practiceDate: "2026-06-12",
    entryOpen: "2026-04-01",
    entryClose: "2026-06-08",
    parkingOpen: "2026-04-15",
    campingAvailable: true,
    campingOpen: "2026-04-15",
    campingClose: "2026-05-25",
    gazeboBookingOpen: "TBC",
    gazeboInfo: "BC-affiliated teams only. Book via gosportbmx.co.uk. Elite team gazebos on bund behind berms 1 & 3 and along finish straight. Site plan published the week before. Spectator entry free. Parking hanger must be displayed at all times.",
    travelTip: "Alver Valley, Grange Road, Gosport PO13 8AS. Approx 6 miles from M27. Parking on HMS Sultan fields — £15 for the weekend, buy in advance at gosportbmx.co.uk or pay cash/card at gate. Parking open from 09:00 Fri 12 June, 07:30 Sat/Sun. Do not park on Grange Road grass verge.",
    campingInfo: "HMS Sultan Polo Fields. Entrance via Military Road opposite Cocked Hat Pub — use postcode PO12 3TR. £70 for the weekend. Toilets and showers on site. Opens 10:00 Fri 12 June. No dogs on campsite (dogs allowed trackside on lead). No disposable BBQs on grass. No noise after 10pm.",
    practiceInfo: "£5 per rider. Buy wristband via gosportbmx.co.uk or on the night. Fri: 12&Under 16:00, 13&Over 17:45, Champs 19:05, Open 19:45.",
    website: "https://www.gosportbmx.co.uk",
    facebook: "https://www.facebook.com/GosportBMX",
    status: "upcoming",
  },
  {
    id: 7,
    round: 7,
    venue: "Cardiff BMX Racing Club (National BMX Centre Wales)",
    city: "Cardiff",
    date: "2026-07-04",
    practiceDate: "2026-07-03",
    entryOpen: "2026-05-01",
    entryClose: "2026-06-29",
    parkingOpen: "2026-05-15",
    campingAvailable: true,
    campingOpen: "2026-05-15",
    campingClose: "2026-06-22",
    gazeboBookingOpen: "TBC",
    gazeboInfo: "Book via Cardiff BMX app. BC-registered clubs and teams only — one booking per club/team. Club gazebos £20 per 3x3, National teams £30, Elite teams £40. Spaces available as 3x3, 6x3, 9x3 or 6x6. Site plan published in lead-up. Spectating free — first and last straight plus berms 1 & 3. Keep space next to fence clear.",
    travelTip: "Riverside Park, Hartland Road, Llanrumney, Cardiff CF3 4JL (what3words: swim.trick.slip). VIP parking next to track £30, standard at University on Hartland Road £15 — both via Cardiff BMX app. Car park open Fri 12:00-14:30 & 16:30-21:00, Sat/Sun 07:00-19:00. No overnight parking except campers. Wales recycling bins — red plastic/metal, blue paper/card, orange general.",
    campingInfo: "Field adjacent to track. Campervans, caravans and motorhomes only (10x8m pitches). £120 for 3-day pass — 2-day stays charged same rate. Arrivals Thu 12:00-14:30 & 16:30-21:00, Fri 09:00-14:30 & 16:30-21:00. Depart within 1hr of racing finishing Sun. Gas stoves allowed, no BBQs or fires. 24hr security. Dogs welcome on lead — not permitted in track area.",
    practiceInfo: "Book via Cardiff BMX app. £5 per session. Fri (earlier due to Nat Champs): 12&Under 15:00, 13-16 16:10, 17+ 17:20, Champs 18:30. Nat Champs warm-up 19:00, racing 19:15. Nat Champs entry closes Mon 29 June 11am.",
    website: "https://www.cardiffbmx.co.uk",
    facebook: "https://www.facebook.com/cardiffbmxracingclub",
    status: "upcoming",
    isNatChamps: true,
  },
  {
    id: 8,
    round: 8,
    venue: "Cardiff BMX Racing Club (National BMX Centre Wales)",
    city: "Cardiff",
    date: "2026-07-05",
    practiceDate: "2026-07-03",
    entryOpen: "2026-05-01",
    entryClose: "2026-06-29",
    parkingOpen: "2026-05-15",
    campingAvailable: true,
    campingOpen: "2026-05-15",
    campingClose: "2026-06-22",
    gazeboBookingOpen: "TBC",
    gazeboInfo: "Book via Cardiff BMX app. BC-registered clubs and teams only — one booking per club/team. Club gazebos £20 per 3x3, National teams £30, Elite teams £40. Spaces available as 3x3, 6x3, 9x3 or 6x6. Site plan published in lead-up. Spectating free — first and last straight plus berms 1 & 3. Keep space next to fence clear.",
    travelTip: "Riverside Park, Hartland Road, Llanrumney, Cardiff CF3 4JL (what3words: swim.trick.slip). VIP parking next to track £30, standard at University on Hartland Road £15 — both via Cardiff BMX app. Car park open Fri 12:00-14:30 & 16:30-21:00, Sat/Sun 07:00-19:00. No overnight parking except campers. Wales recycling bins — red plastic/metal, blue paper/card, orange general.",
    campingInfo: "Field adjacent to track. Campervans, caravans and motorhomes only (10x8m pitches). £120 for 3-day pass — 2-day stays charged same rate. Arrivals Thu 12:00-14:30 & 16:30-21:00, Fri 09:00-14:30 & 16:30-21:00. Depart within 1hr of racing finishing Sun. Gas stoves allowed, no BBQs or fires. 24hr security. Dogs welcome on lead — not permitted in track area.",
    practiceInfo: "Book via Cardiff BMX app. £5 per session. Fri (earlier due to Nat Champs): 12&Under 15:00, 13-16 16:10, 17+ 17:20, Champs 18:30. Nat Champs warm-up 19:00, racing 19:15. Nat Champs entry closes Mon 29 June 11am.",
    website: "https://www.cardiffbmx.co.uk",
    facebook: "https://www.facebook.com/cardiffbmxracingclub",
    status: "upcoming",
    isNatChamps: true,
  },
  {
    id: 9,
    round: 9,
    venue: "Derby Arena",
    city: "Derby",
    date: "2026-08-01",
    practiceDate: "2026-07-31",
    entryOpen: "2026-05-15",
    entryClose: "2026-07-27",
    parkingOpen: "2026-06-30",
    campingAvailable: false,
    gazeboBookingOpen: "TBC",
    gazeboInfo: "Outdoor track at Derby Arena. Gazebo info TBC — check BC event info doc closer to the date.",
    travelTip: "Good central location. M1 or A38. Multi-storey parking nearby if on-site fills up.",
    website: "https://www.derbybmx.co.uk",
    facebook: "https://www.facebook.com/derbybmx",
    status: "upcoming",
  },
  {
    id: 10,
    round: 10,
    venue: "Derby Arena",
    city: "Derby",
    date: "2026-08-02",
    practiceDate: "2026-07-31",
    entryOpen: "2026-05-15",
    entryClose: "2026-07-27",
    parkingOpen: "2026-06-01",
    campingAvailable: false,
    gazeboBookingOpen: "TBC",
    gazeboInfo: "Outdoor track at Derby Arena. Gazebo info TBC — check BC event info doc closer to the date.",
    travelTip: "Good central location. M1 or A38. Multi-storey parking nearby if on-site fills up.",
    website: "https://www.derbybmx.co.uk",
    facebook: "https://www.facebook.com/derbybmx",
    status: "upcoming",
  },
];

const COACHING_DATA = [
  { id: "c1", roundIds: [1, 2], venue: "National Cycling Centre, Manchester", date: "2026-04-05", time: "10:00", coach: "Quillan Isidore", host: "Quillan Isidore Coaching", bookingPlatform: "Spond", bookingUrl: "https://www.spond.com", notes: "Indoor track session. Limited spaces.", ageGroups: "All ages" },
  { id: "c2", roundIds: [1, 2], venue: "National Cycling Centre, Manchester", date: "2026-04-06", time: "09:00", coach: "Ellie Featherstone", host: "Ellie Featherstone Coaching", bookingPlatform: "Website", bookingUrl: "https://www.elliefeatherstone.co.uk", notes: "Girls and mixed groups welcome.", ageGroups: "Under 16" },
  { id: "c3", roundIds: [3, 4], venue: "Glasgow BMX Centre", date: "2026-04-26", time: "10:00", coach: "Quillan Isidore", host: "Quillan Isidore Coaching", bookingPlatform: "Spond", bookingUrl: "https://www.spond.com", notes: "Track walk and race simulation included.", ageGroups: "All ages" },
  { id: "c4", roundIds: [3, 4], venue: "Glasgow BMX Centre", date: "2026-04-27", time: "09:30", coach: "Club Session", host: "Movement Park BMX", bookingPlatform: "Website", bookingUrl: "https://www.movementpark.org.uk", notes: "Hosted by Movement Park. Open to all BC members.", ageGroups: "All ages" },
  { id: "c5", roundIds: [5, 6], venue: "Gosport BMX Club", date: "2026-06-07", time: "10:00", coach: "Ellie Featherstone", host: "Ellie Featherstone Coaching", bookingPlatform: "Spond", bookingUrl: "https://www.spond.com", notes: "Pre-nationals prep session.", ageGroups: "All ages" },
  { id: "c6", roundIds: [5, 6], venue: "Gosport BMX Club", date: "2026-06-08", time: "09:00", coach: "Club Session", host: "Gosport BMX Club", bookingPlatform: "Website", bookingUrl: "https://www.gosportbmx.co.uk", notes: "Club-run open session on race weekend eve.", ageGroups: "All ages" },
  { id: "c7", roundIds: [7, 8], venue: "Cardiff BMX Racing Club", date: "2026-06-28", time: "10:00", coach: "Quillan Isidore", host: "Quillan Isidore Coaching", bookingPlatform: "Spond", bookingUrl: "https://www.spond.com", notes: "Nat Champs prep. Race format focus.", ageGroups: "13+" },
  { id: "c8", roundIds: [7, 8], venue: "Cardiff BMX Racing Club", date: "2026-06-29", time: "09:00", coach: "Ellie Featherstone", host: "Ellie Featherstone Coaching", bookingPlatform: "Website", bookingUrl: "https://www.elliefeatherstone.co.uk", notes: "Open to all ages and abilities.", ageGroups: "All ages" },
  { id: "c9", roundIds: [9, 10], venue: "Derby Arena", date: "2026-07-26", time: "10:00", coach: "Quillan Isidore", host: "Quillan Isidore Coaching", bookingPlatform: "Spond", bookingUrl: "https://www.spond.com", notes: "Season finale prep.", ageGroups: "All ages" },
];

const PLATFORM_COLORS = { "Spond": "#00b894", "Website": COLORS.blue };

const ACCOMMODATION_DATA = {
  // Manchester R1&2
  "1,2": [
    { id: "m1", name: "Travelodge Manchester Sportcity", type: "Hotel", distance: "0.3 miles", url: "https://www.travelodge.co.uk", communityRating: 4, communityNotes: "Closest to venue. Book early." },
    { id: "m2", name: "Premier Inn Manchester City Centre", type: "Hotel", distance: "1.5 miles", url: "https://www.premierinn.com", communityRating: 4, communityNotes: "Good value. Easy tram into venue." },
    { id: "m3", name: "Ibis Manchester Centre", type: "Hotel", distance: "2 miles", url: "https://www.ibis.com", communityRating: 3, communityNotes: "Budget option. Fine for one night." },
  ],
  // Glasgow R3&4
  "3,4": [
    { id: "g1", name: "Travelodge Glasgow Braehead", type: "Hotel", distance: "2 miles", url: "https://www.travelodge.co.uk", communityRating: 4, communityNotes: "Popular with BMX families. Book well in advance." },
    { id: "g2", name: "Premier Inn Glasgow Braehead", type: "Hotel", distance: "2.5 miles", url: "https://www.premierinn.com", communityRating: 4, communityNotes: "Reliable. Good breakfast." },
    { id: "g3", name: "Travelodge Glasgow Govan", type: "Hotel", distance: "1.5 miles", url: "https://www.travelodge.co.uk", communityRating: 3, communityNotes: "Budget option close to track." },
  ],
  // Gosport R5&6
  "5,6": [
    { id: "gos1", name: "HMS Sultan Polo Fields Camping", type: "Camping", distance: "On site", url: "https://www.gosportbmx.co.uk", communityRating: 5, communityNotes: "Best option. Toilets and showers on site. Book via gosportbmx.co.uk. £70 weekend." },
    { id: "gos2", name: "Premier Inn Fareham", type: "Hotel", distance: "4 miles", url: "https://www.premierinn.com", communityRating: 4, communityNotes: "Most families stay here. 10 min drive." },
    { id: "gos3", name: "Travelodge Fareham", type: "Hotel", distance: "4 miles", url: "https://www.travelodge.co.uk", communityRating: 3, communityNotes: "Budget fallback if Premier Inn full." },
  ],
  // Cardiff R7&8
  "7,8": [
    { id: "car1", name: "Campsite — Adjacent to Track", type: "Camping", distance: "On site", url: "https://www.cardiffbmx.co.uk", communityRating: 5, communityNotes: "Motorhomes/caravans only. £120 for 3 days. Best for avoiding traffic. Book via Cardiff BMX app." },
    { id: "car2", name: "Premier Inn Cardiff North", type: "Hotel", distance: "10 mins", url: "https://www.premierinn.com", communityRating: 4, communityNotes: "Solid choice. Easy drive to track." },
    { id: "car3", name: "Travelodge Cardiff Llanederyn", type: "Hotel", distance: "10 mins", url: "https://www.travelodge.co.uk", communityRating: 4, communityNotes: "Closest budget hotel to the track." },
    { id: "car4", name: "Premier Inn Cardiff City Centre", type: "Hotel", distance: "15 mins", url: "https://www.premierinn.com", communityRating: 3, communityNotes: "Good if you want city centre. Slightly longer drive." },
  ],
  // Derby R9&10
  "9,10": [
    { id: "der1", name: "Premier Inn Derby City Centre", type: "Hotel", distance: "1 mile", url: "https://www.premierinn.com", communityRating: 4, communityNotes: "Most popular with race families. Walk or short drive." },
    { id: "der2", name: "Travelodge Derby Central", type: "Hotel", distance: "1 mile", url: "https://www.travelodge.co.uk", communityRating: 3, communityNotes: "Budget option. Does the job." },
    { id: "der3", name: "Holiday Inn Derby Nottingham", type: "Hotel", distance: "2 miles", url: "https://www.holidayinn.com", communityRating: 4, communityNotes: "More space — good for families needing a twin/family room." },
  ],
};

function CoachingView({ rounds }) {
  const [filterCoach, setFilterCoach] = useState("All");
  const now = new Date();
  const allCoaches = ["All", ...Array.from(new Set(COACHING_DATA.map(s => s.coach)))];
  const filtered = COACHING_DATA.filter(s => filterCoach === "All" || s.coach === filterCoach);

  const seen = new Set();
  const weekends = [];
  rounds.forEach(r => {
    const sessions = filtered.filter(s => s.roundIds.includes(r.id));
    if (sessions.length === 0) return;
    const weekendKey = sessions[0].roundIds.join("-");
    if (seen.has(weekendKey)) return;
    seen.add(weekendKey);
    weekends.push({ round: r, sessions });
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

      {weekends.length === 0 && (
        <div style={{ color: COLORS.textMuted, fontSize: 13, padding: 24, textAlign: "center" }}>No sessions found.</div>
      )}

      {weekends.map(({ round: r, sessions }) => (
        <div key={r.id} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{r.round}</div>
            <div style={{ fontSize: 16, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 0.5, color: COLORS.textPrimary }}>{r.city} — {r.venue.split("(")[0].trim()}</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{formatDate(r.date)}</div>
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
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function DeadlinePill({ label, date, urgent }) {
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
      <div style={{
        fontSize: 13, fontWeight: 700, color: color,
        background: `${color}22`, padding: "3px 10px", borderRadius: 20,
      }}>
        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
      </div>
    </div>
  );
}

function Dashboard({ rounds, onSelectRound, myRounds, toggleMyRound }) {
  const now = new Date();
  const upcoming = rounds.filter(r => new Date(r.date) >= now);
  const nextRound = upcoming[0];

  const allDeadlines = [];
  rounds.forEach(r => {
    if (new Date(r.date) >= now) {
      if (daysUntil(r.entryClose) >= 0) allDeadlines.push({ label: `Round ${r.round} entries close — ${r.city}`, date: r.entryClose, round: r.id });
      if (daysUntil(r.parkingOpen) >= 0) allDeadlines.push({ label: `Round ${r.round} parking opens — ${r.city}`, date: r.parkingOpen, round: r.id });
      if (r.campingAvailable && daysUntil(r.campingOpen) >= 0) allDeadlines.push({ label: `Round ${r.round} camping opens — ${r.city}`, date: r.campingOpen, round: r.id });
      if (r.gazeboBookingOpen && r.gazeboBookingOpen !== "TBC" && daysUntil(r.gazeboBookingOpen) >= 0) allDeadlines.push({ label: `Round ${r.round} gazebo booking opens — ${r.city}`, date: r.gazeboBookingOpen, round: r.id });
    }
  });
  allDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  const soonDeadlines = allDeadlines.slice(0, 5);

  const upcomingCoaching = COACHING_DATA
    .filter(s => daysUntil(s.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const myRoundsList = rounds.filter(r => myRounds.has(r.id) && new Date(r.date) >= now);
  const myDeadlines = [];
  myRoundsList.forEach(r => {
    if (daysUntil(r.entryClose) >= 0) myDeadlines.push({ label: `R${r.round} entries close`, date: r.entryClose, city: r.city, roundId: r.id });
    if (daysUntil(r.parkingOpen) >= 0) myDeadlines.push({ label: `R${r.round} parking opens`, date: r.parkingOpen, city: r.city, roundId: r.id });
    if (r.campingAvailable && daysUntil(r.campingOpen) >= 0) myDeadlines.push({ label: `R${r.round} camping opens`, date: r.campingOpen, city: r.city, roundId: r.id });
    if (r.gazeboBookingOpen && r.gazeboBookingOpen !== "TBC" && daysUntil(r.gazeboBookingOpen) >= 0) myDeadlines.push({ label: `R${r.round} gazebo opens`, date: r.gazeboBookingOpen, city: r.city, roundId: r.id });
  });
  myDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      {nextRound && (
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.red}22, ${COLORS.blue}22)`,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12, padding: 24, marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.red, fontFamily: "monospace", marginBottom: 8, textTransform: "uppercase" }}>
            Next Round
          </div>
          <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, color: COLORS.textPrimary, marginBottom: 4 }}>
            Round {nextRound.round} — {nextRound.venue}
          </div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 }}>
            {formatDate(nextRound.date)} · {nextRound.city}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Race Day", date: nextRound.date },
              { label: "Practice", date: nextRound.practiceDate },
              { label: "Entries close", date: nextRound.entryClose },
            ].map(item => {
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
          <button onClick={() => onSelectRound(nextRound)} style={{
            marginTop: 16, background: COLORS.red, color: "#fff", border: "none",
            borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>
            View Round Details →
          </button>
        </div>
      )}

      {myRoundsList.length > 0 && (
        <div style={{
          background: `${COLORS.blue}0d`, border: `1px solid ${COLORS.blue}44`,
          borderRadius: 12, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: COLORS.blue, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
            My Season — {myRoundsList.length} round{myRoundsList.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: myDeadlines.length > 0 ? 14 : 0 }}>
            {myRoundsList.map(r => {
              const days = daysUntil(r.date);
              return (
                <div key={r.id} onClick={() => onSelectRound(r)} style={{
                  background: COLORS.card, border: `1px solid ${COLORS.blue}55`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: COLORS.blue, fontWeight: 700, marginBottom: 2 }}>R{r.round}</div>
                  <div style={{ fontSize: 12, color: COLORS.textPrimary, fontWeight: 600 }}>{r.city}</div>
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
                    <span style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 }}>{d.city} · {formatDate(d.date)}</span>
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
          {rounds.map(r => {
            const past = new Date(r.date) < now;
            const isNext = nextRound && r.id === nextRound.id;
            const isMine = myRounds.has(r.id);
            return (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                borderBottom: `1px solid ${COLORS.border}`,
                background: isMine ? `${COLORS.blue}0a` : "transparent",
                borderLeft: isMine ? `3px solid ${COLORS.blue}` : "3px solid transparent",
                paddingLeft: isMine ? 8 : 0,
                opacity: past ? 0.45 : 1,
                transition: "all 0.15s",
              }}>
                <div onClick={() => onSelectRound(r)} style={{
                  width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
                  background: isMine ? COLORS.blue : isNext ? COLORS.red : past ? COLORS.textMuted : COLORS.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {r.round}
                </div>
                <div onClick={() => onSelectRound(r)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ fontSize: 13, color: isMine ? COLORS.textPrimary : COLORS.textPrimary, fontWeight: isMine ? 600 : 500 }}>{r.city}</div>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{formatDate(r.date)}</div>
                </div>
                {isNext && !isMine && <div style={{ fontSize: 10, color: COLORS.red, fontWeight: 700, letterSpacing: 1 }}>NEXT</div>}
                {past && <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: 1 }}>DONE</div>}
                {!past && (
                  <button onClick={(e) => { e.stopPropagation(); toggleMyRound(r.id); }} style={{
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

function EventDetail({ round, checklist, onToggle, onBack, onViewCoaching, myRounds, toggleMyRound, bookings, updateBooking }) {
  const isMine = myRounds && myRounds.has(round.id);
  const accomKey = Object.keys(ACCOMMODATION_DATA).find(k => k.split(",").map(Number).includes(round.id));
  const accommodation = accomKey ? ACCOMMODATION_DATA[accomKey] : [];
  const sections = [
    { key: "race", label: "Race Day", date: round.date, color: COLORS.red },
    { key: "practice", label: "Practice Day", date: round.practiceDate, color: COLORS.blue },
    { key: "entry_open", label: "Entries Open", date: round.entryOpen, color: COLORS.green },
    { key: "entry_close", label: "Entries Close", date: round.entryClose, color: COLORS.yellow },
    { key: "parking_open", label: "Parking Opens", date: round.parkingOpen, color: "#e67e22" },
    ...(round.campingAvailable ? [
      { key: "camping_open", label: "Camping Opens", date: round.campingOpen, color: "#1abc9c" },
    ] : []),
    ...(round.gazeboBookingOpen && round.gazeboBookingOpen !== "TBC" ? [
      { key: "gazebo_open", label: "Gazebo Booking Opens", date: round.gazeboBookingOpen, color: "#9b59b6" },
    ] : []),
  ];

  const categories = [...new Set(DEFAULT_CHECKLIST.map(i => i.category))];
  const checked = checklist[round.id] || {};
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
          Round {round.round}
        </div>
        <div style={{ fontSize: 32, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, color: COLORS.textPrimary }}>
          {round.venue}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 15, color: COLORS.textSecondary }}>{round.city} · {formatDate(round.date)}</div>
          {round.isNatChamps && (
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              background: `${COLORS.yellow}22`, color: COLORS.yellow,
              border: `1px solid ${COLORS.yellow}55`, borderRadius: 20, padding: "3px 10px",
            }}>★ Nat Champs Weekend</div>
          )}
        </div>
        {(round.website || round.facebook) && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {round.website && (
              <a href={round.website} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: 6,
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "6px 12px", fontSize: 12, color: COLORS.textSecondary,
                textDecoration: "none", fontWeight: 500,
              }}>🌐 Website</a>
            )}
            {round.facebook && (
              <a href={round.facebook} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: 6,
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#1877f2",
                textDecoration: "none", fontWeight: 500,
              }}>f Facebook</a>
            )}
            {toggleMyRound && (
              <button onClick={() => toggleMyRound(round.id)} style={{
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
          { key: "gazebo", label: "Gazebo booked", showIf: !!round.gazeboBookingOpen },
          { key: "hotel", label: "Accommodation booked", hasDetails: true },
          { key: "practice", label: "Practice session booked" },
        ].filter(i => i.showIf !== false);

        return (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              Booking Tracker
            </div>
            {items.map(item => {
              const checked = !!bookings[item.key];
              const details = bookings[`${item.key}_details`] || {};
              const showForm = checked && item.hasDetails;
              return (
                <div key={item.key} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 12, marginBottom: 12 }}>
                  <div
                    onClick={() => updateBooking(item.key, !checked)}
                    style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${checked ? COLORS.green : COLORS.border}`,
                      background: checked ? COLORS.green : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                      {checked && <span style={{ color: "#000", fontSize: 13, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: checked ? COLORS.textMuted : COLORS.textPrimary,
                      textDecoration: checked ? "line-through" : "none",
                    }}>{item.label}</span>
                    {item.hasDetails && checked && (
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
                  {item.hasDetails && checked && details.name && !showForm && (
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
            <div key={s.key} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: 600, marginBottom: 4 }}>{formatDate(s.date)}</div>
              {d >= 0 && (
                <div style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>
                  {d === 0 ? "Today" : d === 1 ? "Tomorrow" : `${d} days`}
                </div>
              )}
              {d < 0 && <div style={{ fontSize: 11, color: COLORS.textMuted }}>Passed</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Gazebo / Team Area</div>
          {round.gazeboBookingOpen && (
            <div style={{
              display: "inline-block", fontSize: 11, fontWeight: 700, marginBottom: 10,
              color: round.gazeboBookingOpen === "TBC" ? COLORS.textMuted : "#9b59b6",
              background: round.gazeboBookingOpen === "TBC" ? `${COLORS.textMuted}18` : "#9b59b622",
              border: `1px solid ${round.gazeboBookingOpen === "TBC" ? COLORS.textMuted : "#9b59b6"}44`,
              borderRadius: 20, padding: "3px 10px",
            }}>
              Booking opens: {round.gazeboBookingOpen === "TBC" ? "TBC" : formatDate(round.gazeboBookingOpen)}
            </div>
          )}
          <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{round.gazeboInfo}</div>
        </div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Travel & Parking</div>
          <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{round.travelTip}</div>
        </div>
        {round.practiceInfo && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.blue}44`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: COLORS.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Practice Info</div>
            <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{round.practiceInfo}</div>
          </div>
        )}
        {round.campingInfo && (
          <div style={{ background: COLORS.card, border: `1px solid #1abc9c44`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: "#1abc9c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Camping Details</div>
            <div style={{ fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.6 }}>{round.campingInfo}</div>
          </div>
        )}
        {!round.campingAvailable && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Camping</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, fontStyle: "italic" }}>No camping available at this venue.</div>
          </div>
        )}
      </div>

      {(() => {
        const sessions = COACHING_DATA.filter(s => s.roundIds.includes(round.id));
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
            <div key={a.id} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0",
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
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
                {a.communityNotes && (
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, fontStyle: "italic" }}>"{a.communityNotes}"</div>
                )}
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

        <div style={{
          height: 6, background: COLORS.border, borderRadius: 3, marginBottom: 20, overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${(checkedCount / totalItems) * 100}%`,
            background: checkedCount === totalItems ? COLORS.green : COLORS.red,
            borderRadius: 3, transition: "width 0.3s ease",
          }} />
        </div>

        {categories.map(cat => (
          <div key={cat} style={{ marginBottom: 18 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              color: CATEGORY_COLORS[cat], textTransform: "uppercase", marginBottom: 8,
            }}>
              {cat}
            </div>
            {DEFAULT_CHECKLIST.filter(i => i.category === cat).map(item => (
              <div key={item.id} onClick={() => onToggle(round.id, item.id)} style={{
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

function CalendarView({ rounds, onSelectRound, myRounds }) {
  const now = new Date();
  return (
    <div>
      <div style={{ fontSize: 12, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>
        2026 National Series
      </div>
      {rounds.map(r => {
        const past = new Date(r.date) < now;
        const deadlines = [
          { label: "Entries open", date: r.entryOpen },
          { label: "Parking opens", date: r.parkingOpen },
          ...(r.campingAvailable ? [{ label: "Camping opens", date: r.campingOpen }] : []),
          ...(r.gazeboBookingOpen && r.gazeboBookingOpen !== "TBC" ? [{ label: "Gazebo booking opens", date: r.gazeboBookingOpen }] : []),
          { label: "Entries close", date: r.entryClose },
          { label: "Practice", date: r.practiceDate },
          { label: "Race day", date: r.date },
        ].sort((a, b) => new Date(a.date) - new Date(b.date));

        return (
          <div key={r.id} style={{
            background: COLORS.card,
            border: `1px solid ${myRounds && myRounds.has(r.id) ? COLORS.blue : COLORS.border}`,
            borderLeft: `4px solid ${past ? COLORS.textMuted : myRounds && myRounds.has(r.id) ? COLORS.blue : COLORS.red}`,
            borderRadius: 10, padding: 20, marginBottom: 16, opacity: past ? 0.55 : 1,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.red, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                  Round {r.round}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 0.5, color: COLORS.textPrimary }}>
                    {r.venue} — {r.city}
                  </div>
                  {r.isNatChamps && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                      background: `${COLORS.yellow}22`, color: COLORS.yellow,
                      border: `1px solid ${COLORS.yellow}55`, borderRadius: 20, padding: "3px 10px",
                    }}>★ Nat Champs</div>
                  )}
                </div>
              </div>
              <button onClick={() => onSelectRound(r)} style={{
                background: COLORS.red, color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
              }}>
                Details →
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {deadlines.map((d, i) => {
                const days = daysUntil(d.date);
                const isRace = d.label === "Race day";
                return (
                  <div key={i} style={{
                    padding: "5px 12px", borderRadius: 20,
                    background: isRace ? `${COLORS.red}22` : COLORS.surface,
                    border: `1px solid ${isRace ? COLORS.red : COLORS.border}`,
                    fontSize: 12,
                  }}>
                    <span style={{ color: COLORS.textSecondary }}>{d.label}: </span>
                    <span style={{ color: isRace ? COLORS.red : COLORS.textPrimary, fontWeight: 500 }}>{formatDate(d.date)}</span>
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
  const [selectedRound, setSelectedRound] = useState(null);

  const [checklist, setChecklist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("msbmx_checklist") || "{}"); } catch { return {}; }
  });
  const [myRounds, setMyRounds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("msbmx_myRounds") || "[]")); } catch { return new Set(); }
  });
  const [bookings, setBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("msbmx_bookings") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("msbmx_checklist", JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem("msbmx_myRounds", JSON.stringify([...myRounds]));
  }, [myRounds]);

  useEffect(() => {
    localStorage.setItem("msbmx_bookings", JSON.stringify(bookings));
  }, [bookings]);

  function toggleMyRound(roundId) {
    setMyRounds(prev => {
      const next = new Set(prev);
      next.has(roundId) ? next.delete(roundId) : next.add(roundId);
      return next;
    });
  }

  function updateBooking(roundId, key, value) {
    setBookings(prev => ({
      ...prev,
      [roundId]: { ...(prev[roundId] || {}), [key]: value },
    }));
  }

  function handleSelectRound(round) {
    setSelectedRound(round);
    setView("detail");
  }

  function handleToggle(roundId, itemId) {
    setChecklist(prev => ({
      ...prev,
      [roundId]: {
        ...(prev[roundId] || {}),
        [itemId]: !(prev[roundId]?.[itemId]),
      },
    }));
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "calendar", label: "Calendar" },
    { key: "coaching", label: "Coaching" },
  ];

  return (
    <div style={{
      background: COLORS.bg, minHeight: "100vh", color: COLORS.textPrimary,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56, position: "sticky", top: 0, background: COLORS.bg, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: COLORS.red, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 900, color: "#fff",
          }}>B</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3 }}>My BMX Season</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {navItems.map(n => (
            <button key={n.key} onClick={() => { setView(n.key); setSelectedRound(null); }} style={{
              background: view === n.key && !selectedRound ? `${COLORS.red}22` : "none",
              border: `1px solid ${view === n.key && !selectedRound ? COLORS.red : "transparent"}`,
              color: view === n.key && !selectedRound ? COLORS.red : COLORS.textSecondary,
              borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {view === "detail" && selectedRound
          ? <EventDetail round={selectedRound} checklist={checklist} onToggle={handleToggle} onBack={() => { setView("dashboard"); setSelectedRound(null); }} onViewCoaching={() => { setView("coaching"); setSelectedRound(null); }} myRounds={myRounds} toggleMyRound={toggleMyRound} bookings={bookings[selectedRound.id] || {}} updateBooking={(key, value) => updateBooking(selectedRound.id, key, value)} />
          : view === "calendar"
          ? <CalendarView rounds={SEASON_DATA} onSelectRound={handleSelectRound} myRounds={myRounds} />
          : view === "coaching"
          ? <CoachingView rounds={SEASON_DATA} />
          : <Dashboard rounds={SEASON_DATA} onSelectRound={handleSelectRound} myRounds={myRounds} toggleMyRound={toggleMyRound} />
        }
      </div>
    </div>
  );
}
