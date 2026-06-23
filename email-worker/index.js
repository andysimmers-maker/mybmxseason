import { ALL_EVENTS, eventEndDate, eventReminderItems, daysUntil, formatDate } from "../events.js";

async function supabaseGet(env, path) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed (${path}): ${res.status} ${await res.text()}`);
  return res.json();
}

async function sendEmail(env, to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: "My BMX Season <reminders@mybmxseason.co.uk>", to, subject, html }),
  });
  if (!res.ok) console.error(`Resend send failed for ${to}: ${res.status} ${await res.text()}`);
  return res.ok;
}

async function runDigest(env, now = new Date()) {
  const optedIn = await supabaseGet(env, "user_settings?email_notifications=eq.true&select=user_id,email");
  const summary = [];

  for (const { user_id, email } of optedIn) {
    if (!email) continue;
    try {
      const [roundsRows, bookingsRows] = await Promise.all([
        supabaseGet(env, `user_rounds?user_id=eq.${user_id}&select=weekend_id`),
        supabaseGet(env, `user_bookings?user_id=eq.${user_id}&select=weekend_id,data`),
      ]);

      const myKeys = new Set(roundsRows.map(r => r.weekend_id));
      const bookings = {};
      bookingsRows.forEach(row => { bookings[row.weekend_id] = row.data; });

      const dueTomorrow = [];
      ALL_EVENTS.forEach(e => {
        if (!myKeys.has(e.key)) return;
        if (new Date(eventEndDate(e)) < now) return;
        eventReminderItems(e, bookings).forEach(item => {
          if (!item.done && daysUntil(item.date, now) === 1) dueTomorrow.push(item);
        });
      });

      if (dueTomorrow.length === 0) {
        summary.push({ email, sent: false, items: 0 });
        continue;
      }

      const html = `
        <p>Tomorrow in your BMX season:</p>
        <ul>${dueTomorrow.map(item => `<li>${item.label} — ${formatDate(item.date)}</li>`).join("")}</ul>
        <p><a href="https://mybmxseason.co.uk">Open My BMX Season</a></p>
      `;
      const sent = await sendEmail(env, email, "Tomorrow in your BMX season", html);
      summary.push({ email, sent, items: dueTomorrow.length });
    } catch (err) {
      console.error(`Failed processing ${email}: ${err.message}`);
      summary.push({ email, sent: false, error: err.message });
    }
  }

  return summary;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDigest(env));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.searchParams.get("key") !== env.ADMIN_KEY) {
      return new Response("Not found", { status: 404 });
    }
    const nowParam = url.searchParams.get("now");
    const now = nowParam ? new Date(nowParam) : new Date();
    const summary = await runDigest(env, now);
    return new Response(JSON.stringify(summary, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
