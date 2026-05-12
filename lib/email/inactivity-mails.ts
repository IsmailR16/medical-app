/**
 * Email templates for inactivity-based account deletion.
 *
 * Sent by /api/cron/cleanup-inactive at the 30-day and 7-day warning marks,
 * plus a confirmation mail on actual deletion.
 *
 * Sender: configured via RESEND_FROM_ADDRESS env var (e.g. "Diagnostika <noreply@diagnostika.se>")
 *
 * NOTE: keep these in HTML + plain text. Use simple inline styles since
 * email clients vary wildly in CSS support.
 */

interface MailTemplate {
  subject: string;
  html: string;
  text: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://diagnostika.se";

const baseHtml = (heading: string, body: string) => `
<!doctype html>
<html lang="sv">
  <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#F9FAFB; color:#1d3557;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;">
      <tr><td align="center" style="padding:32px 16px;">
        <table role="presentation" width="540" cellpadding="0" cellspacing="0" style="max-width:540px; width:100%; background:#ffffff; border-radius:16px; border:1px solid rgba(29,53,87,0.06);">
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px; font-size:22px; font-weight:800; color:#1d3557; letter-spacing:-0.01em;">${heading}</h1>
            <div style="font-size:15px; line-height:1.6; color:rgba(29,53,87,0.85);">${body}</div>
          </td></tr>
        </table>
        <p style="margin-top:24px; font-size:12px; color:#94A3B8;">Diagnostika · <a href="${APP_URL}/integritetspolicy" style="color:#457b9d; text-decoration:none;">Integritetspolicy</a></p>
      </td></tr>
    </table>
  </body>
</html>`.trim();

export function warning30dMail(name: string | null): MailTemplate {
  const greeting = name ? `Hej ${name},` : "Hej!";
  const body = `
<p>${greeting}</p>
<p>Ditt Diagnostika-konto har inte använts på <strong>23 månader</strong>. Enligt vår
<a href="${APP_URL}/integritetspolicy" style="color:#457b9d;">integritetspolicy</a>
raderas inaktiva konton efter 24 månader.</p>
<p><strong>Om du inte loggar in inom 30 dagar raderas:</strong></p>
<ul>
  <li>Ditt konto och kontaktinformation</li>
  <li>Alla dina sessioner och chathistorik</li>
  <li>All feedback och utvärderingar</li>
</ul>
<p>Vill du behålla kontot? <a href="${APP_URL}/dashboard" style="color:#457b9d; font-weight:600;">Logga in</a> så återställs räknaren automatiskt.</p>
<p>Vill du redan nu radera kontot? Det kan du göra under Inställningar efter inloggning.</p>
<p style="margin-top:24px;">/Diagnostika</p>`;
  return {
    subject: "Ditt Diagnostika-konto raderas om 30 dagar",
    html: baseHtml("Ditt konto raderas om 30 dagar", body),
    text: `${greeting}

Ditt Diagnostika-konto har inte använts på 23 månader. Enligt vår integritetspolicy raderas inaktiva konton efter 24 månader.

Om du inte loggar in inom 30 dagar raderas:
- Ditt konto och kontaktinformation
- Alla dina sessioner och chathistorik
- All feedback och utvärderingar

Vill du behålla kontot? Logga in på ${APP_URL}/dashboard så återställs räknaren.

/Diagnostika`,
  };
}

export function warning7dMail(name: string | null): MailTemplate {
  const greeting = name ? `Hej ${name},` : "Hej!";
  const body = `
<p>${greeting}</p>
<p>Detta är en <strong>påminnelse</strong>: ditt Diagnostika-konto raderas om <strong>7 dagar</strong> på grund av inaktivitet.</p>
<p>Vill du behålla det? <a href="${APP_URL}/dashboard" style="color:#457b9d; font-weight:600;">Logga in</a> - det räcker.</p>
<p>Annars raderas allt om 7 dagar.</p>
<p style="margin-top:24px;">/Diagnostika</p>`;
  return {
    subject: "Påminnelse: ditt Diagnostika-konto raderas om 7 dagar",
    html: baseHtml("7 dagar kvar", body),
    text: `${greeting}

Påminnelse: ditt Diagnostika-konto raderas om 7 dagar på grund av inaktivitet.

Vill du behålla det? Logga in på ${APP_URL}/dashboard - det räcker.

Annars raderas allt om 7 dagar.

/Diagnostika`,
  };
}

export function deletionConfirmationMail(name: string | null): MailTemplate {
  const greeting = name ? `Hej ${name},` : "Hej!";
  const body = `
<p>${greeting}</p>
<p>Ditt Diagnostika-konto har raderats på grund av inaktivitet (24+ månader utan inloggning).</p>
<p>Vi har raderat:</p>
<ul>
  <li>Ditt konto och kontaktinformation</li>
  <li>Alla sessioner och chathistorik</li>
  <li>All feedback och utvärderingar</li>
</ul>
<p>Eventuell betalningshistorik finns kvar hos Stripe i 7 år enligt bokföringslagen.</p>
<p>Du är varmt välkommen tillbaka när som helst - registrera då ett nytt konto på <a href="${APP_URL}" style="color:#457b9d;">${APP_URL}</a>.</p>
<p style="margin-top:24px;">/Diagnostika</p>`;
  return {
    subject: "Ditt Diagnostika-konto har raderats",
    html: baseHtml("Ditt konto har raderats", body),
    text: `${greeting}

Ditt Diagnostika-konto har raderats på grund av inaktivitet (24+ månader utan inloggning).

Vi har raderat: ditt konto, sessioner, chathistorik och utvärderingar.

Eventuell betalningshistorik finns kvar hos Stripe i 7 år enligt bokföringslagen.

Du är välkommen tillbaka när som helst på ${APP_URL}.

/Diagnostika`,
  };
}
