# My BMX Season

myBMXseason.co.uk — personal organiser and community resource for BMX racing families following the 2026 British Cycling National BMX Series.

## Tech stack

- React 18
- Vite
- Cloudflare Pages

## Local development

```bash
npm install
npm run dev
```

## Updating data

All data lives in `src/data/`. Edit the JSON files directly — no code changes needed.

| File | What it controls |
|------|-----------------|
| `seasons.json` | Round dates, venues, parking, camping, gazebo, travel info |
| `coaching.json` | Coaching sessions per round |
| `accommodation.json` | Hotels and camping per venue weekend |

### Adding a coaching session

Add an object to `coaching.json`:

```json
{
  "id": "c10",
  "roundIds": [1, 2],
  "venue": "Venue name",
  "date": "2026-04-05",
  "time": "10:00",
  "coach": "Coach Name",
  "host": "Host Organisation",
  "bookingPlatform": "Spond",
  "bookingUrl": "https://...",
  "notes": "Any notes",
  "ageGroups": "All ages"
}
```

`bookingPlatform` should be either `"Spond"` or `"Website"`.

### Updating a round date or deadline

Find the round by `id` in `seasons.json` and update the relevant field. All dates use `YYYY-MM-DD` format.

### Updating gazebo booking date

Change `"gazeboBookingOpen"` from `"TBC"` to a date string e.g. `"2026-05-01"` and it will automatically appear in the dashboard deadlines.

## Deploying to Cloudflare Pages

1. Push this repo to GitHub (`andy-simmers-maker` account, new repo `mybmxseason`)
2. Go to Cloudflare Dashboard → Pages → Create a project
3. Connect your GitHub account and select the `mybmxseason` repo
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Click Save and Deploy

Cloudflare will build and deploy automatically on every push to `main`.

### Custom domain

Once deployed, go to your Pages project → Custom domains → Add domain, and enter `mybmxseason.co.uk`. Point the IONOS nameservers at Cloudflare the same way as the Merseyside site.

## Season rollover

At the start of each season, update `seasons.json` with the new round dates. The app has no hardcoded year references so it will work as-is.

---

## Roadmap

Planned features for future development. These require a backend (Supabase + Resend) and should be built together in a single phase.

### Phase 2 — Backend (Supabase + Resend)

**Email subscriptions and reminders**
- Users sign up with email and select which rounds they're attending
- Automated reminders fire when key deadlines approach (entries close, parking opens, camping opens, gazebo booking opens)
- Managed via Supabase for user/subscription data, Resend for email delivery

**Community submissions with admin approval**
- Any user can submit an update (e.g. gazebo booking date confirmed, new coaching session announced, accommodation tip)
- Submissions have a category: date update, coaching session, accommodation tip, general info
- Pending submissions are visible to all users with a "pending" badge on the relevant event — prevents duplicate submissions
- Admin review page (password protected) shows all pending submissions with approve/reject buttons
- Approved submissions update the live app automatically
- Rejected submissions are removed silently
- Admin is notified by email when a new submission comes in
- Submitter sees their submission in a pending state rather than it disappearing into a void

**User accounts**
- Persist My Rounds selections and booking tracker data across devices (currently localStorage only)
- Replace localStorage with Supabase for all user state

### Phase 3 — Regional and club racing

- Add `series` field to round data: `"national"`, `"regional"`, `"club"`
- Dashboard and calendar filter by series
- Separate data files: `regional.json`, `club.json`
- Simpler event detail for club rounds (no parking/camping/gazebo complexity)
- Entry often on the day — deadline tracker less relevant for club rounds
- Coaching sessions more likely to be club-run rather than external coaches
