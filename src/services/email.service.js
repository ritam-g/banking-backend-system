/**
 * ============================================================
 *  EMAIL SERVICE — Backend Ledger
 * ============================================================
 *  Handles all transactional emails:
 *    • Registration welcome email
 *    • Login notification / security alert email
 *
 *  Uses Nodemailer with Gmail OAuth2 transport.
 * ============================================================
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// ──────────────────────────────────────────────
//  TRANSPORTER CONFIGURATION (Gmail OAuth2)
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

//! Verify the connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error connecting to email server:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// ──────────────────────────────────────────────
//  CORE sendEmail UTILITY
// ──────────────────────────────────────────────
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger 🏦" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('📧 Message sent: %s', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};


// ══════════════════════════════════════════════
//  1. REGISTRATION WELCOME EMAIL
// ══════════════════════════════════════════════

/**
 * Sends a premium welcome email when a new user registers.
 * @param {string} email - Recipient email address
 * @param {string} name  - User's display name
 */
async function sendRegistrationEmail({ email, name }) {
  const subject = '🎉 Welcome to Backend Ledger — Your Account is Ready!';

  const text = `
Welcome to Backend Ledger, ${name}!

Your account has been successfully created.

Here's what you can do now:
  ✔ View your financial dashboard
  ✔ Track transactions in real-time
  ✔ Generate detailed reports
  ✔ Bank-grade security for your data

If you did not create this account, please ignore this email.

Cheers,
The Backend Ledger Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Backend Ledger</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="background:#1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">

          <!-- ═══ HEADER GRADIENT ═══ -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%);padding:50px 40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:10px;">🏦</div>
              <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px 0;font-weight:700;letter-spacing:-0.5px;">
                Welcome to Backend Ledger
              </h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;letter-spacing:1px;text-transform:uppercase;">
                Your Financial Command Center
              </p>
            </td>
          </tr>

          <!-- ═══ GREETING ═══ -->
          <tr>
            <td style="padding:40px 40px 10px 40px;">
              <h2 style="color:#e0e0ff;font-size:22px;margin:0 0 12px 0;">
                Hey ${name} 👋
              </h2>
              <p style="color:#a0a0c0;font-size:15px;line-height:1.7;margin:0;">
                Your account has been successfully created. We're excited to have you on board!
                Below are some of the things you can start doing right away.
              </p>
            </td>
          </tr>

          <!-- ═══ FEATURE CARDS ═══ -->
          <tr>
            <td style="padding:20px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- Feature 1 -->
                <tr>
                  <td style="padding:10px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="background:linear-gradient(135deg,#1e1e3a,#2a2a4a);border-radius:12px;border:1px solid rgba(102,126,234,0.2);">
                      <tr>
                        <td style="padding:20px;width:50px;text-align:center;vertical-align:top;">
                          <div style="font-size:28px;">📊</div>
                        </td>
                        <td style="padding:20px 20px 20px 0;">
                          <p style="color:#667eea;font-size:14px;font-weight:700;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Dashboard</p>
                          <p style="color:#a0a0c0;font-size:13px;margin:0;line-height:1.5;">View your complete financial overview with real-time analytics and charts.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 2 -->
                <tr>
                  <td style="padding:10px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="background:linear-gradient(135deg,#1e1e3a,#2a2a4a);border-radius:12px;border:1px solid rgba(118,75,162,0.2);">
                      <tr>
                        <td style="padding:20px;width:50px;text-align:center;vertical-align:top;">
                          <div style="font-size:28px;">💸</div>
                        </td>
                        <td style="padding:20px 20px 20px 0;">
                          <p style="color:#764ba2;font-size:14px;font-weight:700;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Transactions</p>
                          <p style="color:#a0a0c0;font-size:13px;margin:0;line-height:1.5;">Track every transaction in real-time with detailed breakdowns and filters.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Feature 3 -->
                <tr>
                  <td style="padding:10px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                           style="background:linear-gradient(135deg,#1e1e3a,#2a2a4a);border-radius:12px;border:1px solid rgba(240,147,251,0.2);">
                      <tr>
                        <td style="padding:20px;width:50px;text-align:center;vertical-align:top;">
                          <div style="font-size:28px;">🔒</div>
                        </td>
                        <td style="padding:20px 20px 20px 0;">
                          <p style="color:#f093fb;font-size:14px;font-weight:700;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">Bank-Grade Security</p>
                          <p style="color:#a0a0c0;font-size:13px;margin:0;line-height:1.5;">Your data is encrypted and protected with industry-leading security protocols.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ═══ CTA BUTTON ═══ -->
          <tr>
            <td align="center" style="padding:20px 40px 10px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50px;text-align:center;">
                    <a href="#" style="display:inline-block;padding:16px 48px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
                      🚀 Get Started Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ DIVIDER ═══ -->
          <tr>
            <td style="padding:30px 40px 0 40px;">
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0;" />
            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="padding:25px 40px 35px 40px;text-align:center;">
              <p style="color:#555577;font-size:12px;margin:0 0 8px 0;">
                You received this email because you signed up for Backend Ledger.
              </p>
              <p style="color:#444466;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Backend Ledger · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  await sendEmail(email, subject, text, html);
  console.log(`📧 Registration email sent to ${email}`);
}


// ══════════════════════════════════════════════
//  2. LOGIN NOTIFICATION / SECURITY ALERT EMAIL
// ══════════════════════════════════════════════

/**
 * Sends a login notification email when a user signs in.
 * Includes timestamp and security advisory.
 * @param {string} email - Recipient email address
 * @param {string} name  - User's display name (can be email if name not available)
 */
async function sendLoginEmail({ email, name }) {
  const loginTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const subject = '🔐 New Sign-In to Your Backend Ledger Account';

  const text = `
Hi ${name},

We detected a new sign-in to your Backend Ledger account.

  🕐 Time: ${loginTime}
  📧 Email: ${email}

If this was you, no further action is needed.

If you did NOT sign in, please secure your account immediately by changing your password.

Stay safe,
The Backend Ledger Security Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login Alert — Backend Ledger</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0"
               style="background:#1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);padding:45px 40px;text-align:center;">
              <div style="font-size:44px;margin-bottom:10px;">🔐</div>
              <h1 style="color:#ffffff;font-size:24px;margin:0 0 6px 0;font-weight:700;">
                New Sign-In Detected
              </h1>
              <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;letter-spacing:1px;text-transform:uppercase;">
                Security Notification
              </p>
            </td>
          </tr>

          <!-- ═══ GREETING ═══ -->
          <tr>
            <td style="padding:35px 40px 15px 40px;">
              <h2 style="color:#e0e0ff;font-size:20px;margin:0 0 10px 0;">
                Hi ${name} 👋
              </h2>
              <p style="color:#a0a0c0;font-size:15px;line-height:1.7;margin:0;">
                We noticed a new sign-in to your <strong style="color:#38ef7d;">Backend Ledger</strong> account.
                Here are the details:
              </p>
            </td>
          </tr>

          <!-- ═══ LOGIN DETAILS CARD ═══ -->
          <tr>
            <td style="padding:10px 40px 25px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(135deg,#1e1e3a,#2a2a4a);border-radius:12px;border:1px solid rgba(56,239,125,0.15);">

                <!-- Time Row -->
                <tr>
                  <td style="padding:20px 24px 10px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;text-align:center;vertical-align:middle;">
                          <span style="font-size:20px;">🕐</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#666688;font-size:11px;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;">Time of Sign-In</p>
                          <p style="color:#e0e0ff;font-size:14px;margin:0;font-weight:600;">${loginTime}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 24px;">
                    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:10px 0;" />
                  </td>
                </tr>

                <!-- Email Row -->
                <tr>
                  <td style="padding:10px 24px 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;text-align:center;vertical-align:middle;">
                          <span style="font-size:20px;">📧</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#666688;font-size:11px;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;">Account</p>
                          <p style="color:#e0e0ff;font-size:14px;margin:0;font-weight:600;">${email}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Status Row -->
                <tr>
                  <td style="padding:0 24px 20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;text-align:center;vertical-align:middle;">
                          <span style="font-size:20px;">✅</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#666688;font-size:11px;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;">Status</p>
                          <p style="color:#38ef7d;font-size:14px;margin:0;font-weight:700;">Successful Login</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ═══ SECURITY WARNING BOX ═══ -->
          <tr>
            <td style="padding:0 40px 25px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background:linear-gradient(135deg,#2a1a1a,#3a2020);border-radius:12px;border:1px solid rgba(255,100,100,0.15);">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;text-align:center;vertical-align:top;">
                          <span style="font-size:24px;">⚠️</span>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="color:#ff6b6b;font-size:14px;font-weight:700;margin:0 0 6px 0;">
                            Wasn't you?
                          </p>
                          <p style="color:#cc9999;font-size:13px;margin:0;line-height:1.6;">
                            If you did not sign in, your account may be compromised. Please change your password immediately and contact our support team.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══ DIVIDER ═══ -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0;" />
            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="padding:25px 40px 35px 40px;text-align:center;">
              <p style="color:#555577;font-size:12px;margin:0 0 8px 0;">
                This is an automated security notification from Backend Ledger.
              </p>
              <p style="color:#444466;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Backend Ledger · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  await sendEmail(email, subject, text, html);
  console.log(`📧 Login notification email sent to ${email}`);
}



// ══════════════════════════════════════════════
//  3. TRANSACTION SUCCESS EMAIL
// ══════════════════════════════════════════════

/**
 * Sends a transaction confirmation email.
 * Triggered when money is successfully transferred.
 * 
 * @param {Object} param0
 * @param {string} param0.email      - Recipient email
 * @param {string} param0.name       - User name
 * @param {number} param0.amount     - Transaction amount
 * @param {string} param0.type       - "sent" | "received"
 * @param {string} param0.reference  - Transaction reference ID
 */
// ══════════════════════════════════════════════
//  3. TRANSACTION SUCCESS EMAIL
// ══════════════════════════════════════════════

async function sendTransactionEmail(userEmail, name, amount, toAccount) {

  const reference = `TXN-${Date.now()}`;

  const transactionTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });

  const subject = `💸 ₹${amount} Sent Successfully`;

  const text = `
Hi ${name},

Your transaction was successful.

Amount: ₹${amount}
To Account: ${toAccount}
Reference ID: ${reference}
Time: ${transactionTime}

If you did not authorize this transaction, please contact support immediately.

Backend Ledger Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:Segoe UI,Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#0f0f1a;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">

<tr>
<td style="background:linear-gradient(135deg,#ff512f,#dd2476);padding:45px;text-align:center;">
<div style="font-size:40px;">💸</div>
<h1 style="color:#ffffff;margin:10px 0 0 0;font-size:24px;">
Transaction Successful
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">
<h2 style="color:#e0e0ff;margin:0 0 10px 0;">Hi ${name} 👋</h2>

<table width="100%" cellpadding="0" cellspacing="0"
style="margin-top:20px;background:#222240;border-radius:12px;padding:20px;">

<tr>
<td style="color:#8888aa;font-size:13px;">Amount</td>
<td style="color:#ff6b6b;font-weight:700;text-align:right;">₹${amount}</td>
</tr>

<tr>
<td style="color:#8888aa;font-size:13px;padding-top:10px;">To Account</td>
<td style="color:#ffffff;text-align:right;padding-top:10px;">${toAccount}</td>
</tr>

<tr>
<td style="color:#8888aa;font-size:13px;padding-top:10px;">Reference ID</td>
<td style="color:#ffffff;text-align:right;padding-top:10px;">${reference}</td>
</tr>

<tr>
<td style="color:#8888aa;font-size:13px;padding-top:10px;">Time</td>
<td style="color:#ffffff;text-align:right;padding-top:10px;">${transactionTime}</td>
</tr>

</table>

<p style="color:#777799;font-size:13px;margin-top:30px;">
If you did not authorize this transaction, please contact support immediately.
</p>

</td>
</tr>

<tr>
<td style="padding:20px;text-align:center;color:#444466;font-size:12px;">
© ${new Date().getFullYear()} Backend Ledger · Secure Banking
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>
`;

  await sendEmail(userEmail, subject, text, html);

  console.log(`📧 Transaction email sent to ${userEmail}`);
}

// ══════════════════════════════════════════════
//  4. TRANSACTION FAILED EMAIL
// ══════════════════════════════════════════════

async function sendTransactionFailedEmail(userEmail, name, amount, toAccount, reason) {

  const reference = `TXN-${Date.now()}`;
  
  const failedTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });

  const subject = `❌ Transaction Failed — ₹${amount}`;

  const text = `
Hi ${name},

Unfortunately, your recent transaction could not be completed.

Amount: ₹${amount}
To Account: ${toAccount}
Reference ID: ${reference}
Time: ${failedTime}

Reason: ${reason}

No money has been deducted from your account.

If you continue to face issues, please contact support.

Backend Ledger Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:Segoe UI,Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;background:#0f0f1a;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#1a1a2e;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">

<tr>
<td style="background:linear-gradient(135deg,#ff416c,#ff4b2b);padding:45px;text-align:center;">
<div style="font-size:40px;">❌</div>
<h1 style="color:#ffffff;margin:10px 0 0 0;font-size:24px;">
Transaction Failed
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">
<h2 style="color:#e0e0ff;margin:0 0 10px 0;">Hi ${name} 👋</h2>

<p style="color:#ff6b6b;font-size:15px;">
We were unable to process your transaction.
</p>

<table width="100%" cellpadding="0" cellspacing="0"
style="margin-top:20px;background:#2a1a1a;border-radius:12px;padding:20px;">

<tr>
<td style="color:#8888aa;font-size:13px;">Amount</td>
<td style="color:#ff6b6b;font-weight:700;text-align:right;">₹${amount}</td>
</tr>

<tr>
<td style="color:#8888aa;font-size:13px;padding-top:10px;">To Account</td>
<td style="color:#ffffff;text-align:right;padding-top:10px;">${toAccount}</td>
</tr>

<tr>
<td style="color:#8888aa;font-size:13px;padding-top:10px;">Reference ID</td>
<td style="color:#ffffff;text-align:right;padding-top:10px;">${reference}</td>
</tr>

<tr>
<td style="color:#8888aa;font-size:13px;padding-top:10px;">Time</td>
<td style="color:#ffffff;text-align:right;padding-top:10px;">${failedTime}</td>
</tr>

<tr>
<td style="color:#8888aa;font-size:13px;padding-top:10px;">Reason</td>
<td style="color:#ff9a9a;text-align:right;padding-top:10px;">${reason}</td>
</tr>

</table>

<p style="color:#9999bb;font-size:13px;margin-top:30px;">
Good news: No amount has been deducted from your account.
</p>

</td>
</tr>

<tr>
<td style="padding:20px;text-align:center;color:#444466;font-size:12px;">
© ${new Date().getFullYear()} Backend Ledger · Secure Banking
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>
`;

  await sendEmail(userEmail, subject, text, html);

  console.log(`📧 Transaction failed email sent to ${userEmail}`);
}
// ──────────────────────────────────────────────
//  MODULE EXPORTS
// ──────────────────────────────────────────────
module.exports = { sendRegistrationEmail, sendLoginEmail,sendTransactionEmail,sendTransactionFailedEmail };