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
    const refCode = data.ref_code || 'JOINLY-EARLY';

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email' })
      };
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }]
          }
        ],
        from: {
          email: 'hello@joinly.tech',
          name: 'Joinly'
        },
        reply_to: {
          email: 'hello@joinly.tech',
          name: 'Joinly'
        },
        subject: 'Witaj w Joinly 🚀',
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;padding:24px">
                <h1>Witaj w Joinly 👋</h1>

                <p>Dzięki za zapis do early access Joinly.</p>

                <p>
                  Jesteś na liście pierwszych użytkowników.
                  Damy Ci znać, gdy ruszy beta w Twoim mieście.
                </p>

                <p>
                  <b>Miasto:</b> ${city || 'nie podano'}<br>
                  <b>Aktywność:</b> ${interest || 'nie podano'}<br>
                  <b>Twój kod early access:</b> ${refCode}
                </p>

                <p>
                  Do zobaczenia,<br>
                  Zespół Joinly
                </p>
              </div>
            `
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
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};