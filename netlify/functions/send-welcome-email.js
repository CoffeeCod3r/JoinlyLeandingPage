exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    const data = JSON.parse(event.body || "{}");

    const email = String(data.email || "").trim().toLowerCase();
    const city = data.city || "";
    const interest = data.interest || "";

    function generateReferralCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "JOIN-";

      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      return code;
    }

    const refCode = data.ref_code || generateReferralCode();

    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email" })
      };
    }

    const referralLink = `https://joinly.tech/?ref=${refCode}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,sans-serif;">

<div style="max-width:620px;margin:40px auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.08);">

<div style="background:linear-gradient(135deg,#111827,#312e81,#7c3aed);padding:60px 40px;text-align:center;">
<h1 style="margin:0;color:white;font-size:42px;">🚀 Joinly</h1>
<p style="color:#d1d5db;font-size:18px;">Poznawaj ludzi przez wspólne zainteresowania</p>
</div>

<div style="padding:40px;">
<h2>Witaj w Joinly 👋</h2>

<p>Dzięki za zapis do early access.</p>

<p>
Jesteś teraz wśród pierwszych użytkowników Joinly.
</p>

<div style="margin:30px 0;padding:30px;background:#f9fafb;border-radius:20px;text-align:center;">
<p>Twój link polecający:</p>
<p>${referralLink}</p>
</div>
</div>

<div style="padding:24px;background:#ede9fe;border-radius:20px;">
<h3>🎁 Bonus dla Ciebie</h3>
<p>Zaprosisz 5 znajomych?</p>
<p><b>Dostaniesz Joinly Premium za darmo na 1 miesiąc.</b></p>
</div>

<div style="margin-top:24px;padding:24px;background:#f8fafc;border-radius:20px;">
<p><b>Miasto:</b> ${city || "Nie podano"}</p>
<p><b>Zainteresowania:</b> ${interest || "Nie podano"}</p>
</div>

<p style="margin-top:30px;">
Do zobaczenia,<br>
<b>Zespół Joinly</b>
</p>
</div>
</div>

</body>
</html>
`;

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }]
          }
        ],
        from: {
          email: "hello@joinly.tech",
          name: "Joinly"
        },
        subject: "🚀 Witaj w Joinly",
        content: [
          {
            type: "text/html",
            value: emailHtml
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      return {
        statusCode: 500,
        body: JSON.stringify({ error: errorText })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        referralCode: refCode
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};

