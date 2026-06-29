exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const data = JSON.parse(event.body || '{}');

    const email = String(data.email || '').trim().toLowerCase();
    const city = data.city || '';
    const interest = data.interest || '';
    
    function generateReferralCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'JOIN-';

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

const refCode = data.ref_code || generateReferralCode();

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email' })
      };
    }


content: [
  {
    type: 'text/html',
    value: ` <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,sans-serif;">

    <table width="100%" cellspacing="0" cellpadding="0" style="padding:40px 16px;background:#eef2ff;">
    <tr>
    <td align="center">

    <table width="620" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);">

    <tr>
    <td style="background:linear-gradient(135deg,#111827,#312e81,#7c3aed);padding:60px 40px;text-align:center;">
    <div style="font-size:44px;margin-bottom:16px;">🚀</div>

    <h1 style="margin:0;color:#ffffff;font-size:42px;font-weight:700;">
    Joinly
    </h1>

    <p style="margin-top:16px;color:#d1d5db;font-size:18px;line-height:1.6;">
    Poznawaj ludzi przez wspólne zainteresowania
    </p>
    </td>
    </tr>

    <tr>
    <td style="padding:48px 40px;">

    <h2 style="margin:0;color:#111827;font-size:30px;">
    Witaj w Joinly 👋
    </h2>

    <p style="margin-top:24px;color:#4b5563;font-size:17px;line-height:1.8;">
    Dzięki za zapis do early access.
    </p>

    <p style="color:#4b5563;font-size:17px;line-height:1.8;">
    Jesteś teraz wśród pierwszych użytkowników Joinly.
    Budujemy platformę, która pomaga poznawać ludzi offline przez aktywności, eventy i wspólne pasje.
    </p>

    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:36px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:22px;">
    <tr>
    <td align="center" style="padding:36px;">

    <p style="margin:0;color:#6b7280;font-size:14px;">
    Twój kod referral
    </p>

    <div style="margin-top:18px;font-size:32px;font-weight:700;color:#111827;letter-spacing:3px;">
    ${refCode}
    </div>

    </td>
    </tr>
    </table>

    <p style="margin-top:30px;color:#4b5563;font-size:17px;line-height:1.8;">
    Udostępnij swój kod znajomym i zapraszaj ich do Joinly.
    </p>

    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;background:#ede9fe;border-radius:18px;">
    <tr>
    <td style="padding:28px;">

    <h3 style="margin:0;color:#4c1d95;font-size:22px;">
    🎁 Bonus dla Ciebie
    </h3>

    <p style="margin-top:16px;color:#5b21b6;font-size:16px;line-height:1.8;">
    Zaprosisz <b>5 znajomych</b>, którzy zapiszą się do waitlisty?
    </p>

    <p style="color:#5b21b6;font-size:16px;line-height:1.8;">
    Otrzymasz <b>Joinly Premium za darmo na 1 miesiąc.</b>
    </p>

    </td>
    </tr>
    </table>

    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;background:#f8fafc;border-radius:18px;">
    <tr>
    <td style="padding:24px;">
    <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.8;">
    <b>Miasto:</b> ${city || 'Nie podano'}<br>
    <b>Zainteresowania:</b> ${interest || 'Nie podano'}
    </p>
    </td>
    </tr>
    </table>

    <p style="margin-top:34px;color:#4b5563;font-size:17px;line-height:1.8;">
    Wkrótce odezwiemy się z kolejnymi aktualizacjami.
    </p>

    <p style="margin-top:30px;color:#4b5563;font-size:17px;">
    Do zobaczenia,<br>
    <b>Zespół Joinly</b>
    </p>

    </td>
    </tr>
    </table>

    <table width="620" style="max-width:620px;margin-top:20px;">
    <tr>
    <td align="center">
    <p style="color:#9ca3af;font-size:13px;line-height:1.6;">
    © 2026 Joinly • Built for meaningful connections
    </p>
    </td>
    </tr>
    </table>

    </td>
    </tr>
    </table>

    </body>
    </html>
    `
      }
    ]


    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: 500,
        body: JSON.stringify({ error: errorText })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};