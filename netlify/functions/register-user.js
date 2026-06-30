const { createClient } = require("@supabase/supabase-js");

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const data = JSON.parse(event.body || "{}");

    const email = String(data.email || "")
      .trim()
      .toLowerCase();
    const city = data.city || "";
    const interest = data.interest || "";
    const referredBy = data.referred_by || null;

    if (!email || !email.includes("@")) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid email" }),
      };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
    );

    function generateReferralCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "JOIN-";

      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      return code;
    }

    const referralCode = generateReferralCode();

    const { data: newUser, error } = await supabase
      .from("waitlist_users")
      .insert({
        email,
        city,
        interest,
        referral_code: referralCode,
        referred_by: referredBy,
      })
      .select()
      .single();

    if (error) throw error;

    if (referredBy) {
      await handleReferral(supabase, newUser, referredBy);
    }

    await sendWelcomeEmail(email, city, interest, referralCode);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        referralCode,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};

async function handleReferral(supabase, newUser, referredBy) {
  const { data: referrer } = await supabase
    .from("waitlist_users")
    .select("*")
    .eq("referral_code", referredBy)
    .single();

  if (!referrer) return;

  await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referred_user_id: newUser.id,
  });

  const newCount = (referrer.referral_count || 0) + 1;

  const updateData = {
    referral_count: newCount,
  };

  if (newCount >= 5) {
    const premiumDate = new Date();
    premiumDate.setMonth(premiumDate.getMonth() + 1);

    updateData.pro_unlocked = true;
    updateData.pro_expires_at = premiumDate.toISOString();
  }

  await supabase
    .from("waitlist_users")
    .update(updateData)
    .eq("id", referrer.id);
}

async function sendWelcomeEmail(email, city, interest, referralCode) {
  const referralLink = `https://joinly.tech/?ref=${referralCode}`;

  const emailHtml = `
  <html>
  <body>
    <h1>Witaj w Joinly 🚀</h1>
    <p>Dzięki za zapis do early access.</p>
    <p>Twój link referral:</p>
    <p>${referralLink}</p>
    <p>Zaprosisz 5 osób = 1 miesiąc Premium za darmo.</p>
    <hr/>
    <p>Miasto: ${city}</p>
    <p>Zainteresowania: ${interest}</p>
  </body>
  </html>
  `;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email }],
        },
      ],
      from: {
        email: "hello@joinly.tech",
        name: "Joinly",
      },
      subject: "🚀 Witaj w Joinly",
      content: [
        {
          type: "text/html",
          value: emailHtml,
        },
      ],
    }),
  });
}
