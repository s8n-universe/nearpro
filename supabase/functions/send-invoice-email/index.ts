import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "NearPro <onboarding@s8n.in>";
const SUPPORT_EMAIL = "support@s8n.in";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const {
      type = "invoice", // 'invoice' | 'welcome' | 'upgrade' | 'cancellation' | 'waitlist'
      user_email,
      user_name,
      plan_id,
      net_paid,
      payment_id,
      company_name,
      gst_number
    } = payload;

    if (!user_email) {
      return new Response(JSON.stringify({ error: "user_email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const tierUpper = (plan_id || 'hunter').toUpperCase();
    const invoiceNumber = `INV NEARPRO ${new Date().getFullYear()} ${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const recipientDisplayName = user_name || user_email.split('@')[0];

    let subject = `NearPro Notification`;
    let emailHTML = ``;

    // Common Header HTML — High-Contrast Space Grotesk Header Badge
    const commonHeader = `
    <!-- Top Accent Brand Gradient Bar -->
    <tr>
      <td style="height:5px; background:linear-gradient(90deg, #ec4899 0%, #ffa000 100%); font-size:1px; line-height:1px;">&nbsp;</td>
    </tr>
    <!-- Header / Brand Bar -->
    <tr>
      <td style="background-color:#0b081d; padding:32px 36px; text-align:center; border-bottom:3px solid #ec4899;">
        <img src="https://nearpro.s8n.in/NearPro_logo_nobg.png" alt="NearPro Logo" height="48" style="height:48px; width:auto; display:inline-block; border:0; margin:0 0 10px 0;" />
        <br>
        <div style="display:inline-block; background:rgba(255, 160, 0, 0.15); border:1px solid rgba(255, 160, 0, 0.4); color:#ffa000; font-size:12px; font-weight:800; padding:6px 16px; border-radius:20px; letter-spacing:1.5px; text-transform:uppercase; font-family:'Space Grotesk', 'Plus Jakarta Sans', 'Helvetica Neue', Arial, sans-serif;">
          NEARPRO™ &bull; AUTONOMOUS B2B LEAD INTELLIGENCE OS
        </div>
      </td>
    </tr>
    `;

    // Common Signature & Footer HTML — Clean NearPro Team & Links
    const commonFooter = `
    <!-- Signature -->
    <tr>
      <td style="padding:28px 36px; border-top:1px solid #e8e8f0; background-color:#ffffff;">
        <p style="font-size:15px; color:#0b081d; margin:0 0 4px 0; font-family:'Plus Jakarta Sans', sans-serif; font-weight:800;">NearPro Platform Team</p>
        <p style="font-size:13px; color:#666480; margin:0 0 16px 0; font-family:'Inter', sans-serif;">S8N Technologies &bull; India's Trusted B2B Lead OS</p>
        
        <p style="margin:0; font-family:'Inter', sans-serif; font-size:13px; line-height:1.8; color:#475569;">
          <span style="display:inline-block; margin-right:16px; vertical-align:middle;">
            <span style="font-size:14px; margin-right:4px; vertical-align:middle;">✉️</span>
            <a href="mailto:${SUPPORT_EMAIL}" style="color:#0b081d; text-decoration:underline; font-weight:600;">${SUPPORT_EMAIL}</a>
          </span>
          <span style="display:inline-block; margin-right:16px; vertical-align:middle;">
            <span style="font-size:14px; margin-right:4px; vertical-align:middle;">🚀</span>
            <a href="https://nearpro.s8n.in" style="color:#0b081d; text-decoration:underline; font-weight:600;">nearpro.s8n.in</a>
          </span>
          <span style="display:inline-block; margin-right:16px; vertical-align:middle;">
            <span style="font-size:14px; margin-right:4px; vertical-align:middle;">🌐</span>
            <a href="https://www.s8n.in" style="color:#0b081d; text-decoration:underline; font-weight:600;">s8n.in</a>
          </span>
          <span style="display:inline-block; vertical-align:middle;">
            <span style="font-size:14px; margin-right:4px; vertical-align:middle;">💼</span>
            <a href="https://www.linkedin.com/company/s8n-ai-services" style="color:#0b081d; text-decoration:underline; font-weight:600;">LinkedIn</a>
          </span>
        </p>
      </td>
    </tr>
    `;

    if (type === 'welcome') {
      subject = `🚀 Welcome to NearPro : Your Autonomous Agency Operating System!`;
      emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to NearPro</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f6; font-family:'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6; padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(8, 7, 16, 0.08);">
              ${commonHeader}
              <tr>
                <td style="padding:40px 36px 32px 36px;">
                  <p style="font-size:20px; color:#0b081d; margin:0 0 16px 0; line-height:1.4; font-weight:800; font-family:'Space Grotesk', 'Plus Jakarta Sans', sans-serif; letter-spacing:-0.2px;">
                    Welcome to NearPro : Autonomous B2B Lead Intelligence 🚀
                  </p>
                  <p style="font-size:15px; color:#2d2b3d; margin:0 0 24px 0; font-family:'Inter', sans-serif; line-height:1.6;">
                    Your workspace is officially provisioned and live. Here is how NearPro accelerates your B2B client acquisition pipeline from day one:
                  </p>

                  <!-- Professional Bulletins Section (No Hyphens) -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0; background-color:#fff1f6; border-radius:10px; border:1px solid #fbcfe8;">
                    <tr>
                      <td style="padding:24px 24px 8px 24px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom:18px; vertical-align:top; width:28px; font-size:16px; color:#ec4899; font-weight:bold;">•</td>
                            <td style="padding-bottom:18px; font-size:14.5px; color:#2d2b3d; line-height:1.5; font-family:'Inter', sans-serif;">
                              <strong style="color:#0b081d; font-family:'Space Grotesk', sans-serif;">12,358+ Verified B2B Lead Records</strong><br>
                              <span style="font-size:13.5px; color:#666480;">Direct phone numbers, ratings, and website tech stacks across India.</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:18px; vertical-align:top; width:28px; font-size:16px; color:#ec4899; font-weight:bold;">•</td>
                            <td style="padding-bottom:18px; font-size:14.5px; color:#2d2b3d; line-height:1.5; font-family:'Inter', sans-serif;">
                              <strong style="color:#0b081d; font-family:'Space Grotesk', sans-serif;">Instant 1 Click PageSpeed Audits and Revenue Drop Off</strong><br>
                              <span style="font-size:13.5px; color:#666480;">Instantly expose mobile load speed bottlenecks to prospects.</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:18px; vertical-align:top; width:28px; font-size:16px; color:#ec4899; font-weight:bold;">•</td>
                            <td style="padding-bottom:18px; font-size:14.5px; color:#2d2b3d; line-height:1.5; font-family:'Inter', sans-serif;">
                              <strong style="color:#0b081d; font-family:'Space Grotesk', sans-serif;">3 Page Agency PDF Proposals</strong><br>
                              <span style="font-size:13.5px; color:#666480;">Auto generate high converting pitch decks tailored to target clients.</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom:18px; vertical-align:top; width:28px; font-size:16px; color:#ec4899; font-weight:bold;">•</td>
                            <td style="padding-bottom:18px; font-size:14.5px; color:#2d2b3d; line-height:1.5; font-family:'Inter', sans-serif;">
                              <strong style="color:#0b081d; font-family:'Space Grotesk', sans-serif;">AI Teleprompter Cold Calling Scripts</strong><br>
                              <span style="font-size:13.5px; color:#666480;">Live objection response cards with male and female inflection support.</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Primary CTA Button -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://nearpro.s8n.in/#/dashboard/directory" style="display:inline-block; padding:14px 36px; background:linear-gradient(90deg, #ec4899 0%, #ffa000 100%); color:#0b081d; text-decoration:none; font-size:15px; font-weight:800; border-radius:8px; border:2px solid #0b081d; font-family:'Space Grotesk', 'Plus Jakarta Sans', sans-serif; box-shadow:0 6px 18px rgba(236, 72, 153, 0.35);">
                          Launch Workspace Dashboard &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${commonFooter}
            </table>
          </td>
        </tr>
      </table>
      </body>
      </html>
      `;
    } else if (type === 'upgrade') {
      subject = `🎉 Confirmed : You have Upgraded to NearPro ${tierUpper} Plan!`;
      
      const quotaBullets = plan_id === 'scout' ? `
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>8 AI Tele Sales Call Scripts</strong> / month</td></tr>
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>40 Web AI and Antigravity Prompt Copies</strong> / month</td></tr>
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>5 Custom Smart Lead Lists and Pipeline Tracking</strong></td></tr>
      ` : plan_id === 'agency' ? `
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>150 AI Tele Sales Call Scripts</strong> / month (Male and Female inflections)</td></tr>
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>150 Antigravity and Web AI Prompt Copies</strong> / month</td></tr>
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>Unlimited Smart Lead Lists and CRM Board Columns</strong></td></tr>
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>Team Workspaces and Priority API Pipeline Sync</strong></td></tr>
      ` : `
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>45 AI Tele Sales Call Scripts</strong> / month</td></tr>
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>80 Antigravity and Web AI Prompt Copies</strong> / month</td></tr>
        <tr><td style="padding-bottom:10px; font-size:14px; color:#0b081d;">✓ <strong>20 Custom Smart Lead Lists and Pipeline Tracking</strong></td></tr>
      `;

      emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NearPro Plan Upgraded</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f6; font-family:'Plus Jakarta Sans', 'Inter', sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6; padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(8, 7, 16, 0.08);">
              ${commonHeader}
              <tr>
                <td style="padding:40px 36px 32px 36px;">
                  <p style="font-size:15px; color:#2d2b3d; margin:0 0 12px 0; font-family:'Inter', sans-serif;">
                    Hello <strong>${recipientDisplayName}</strong>,
                  </p>
                  <h2 style="font-size:22px; color:#0b081d; margin:0 0 20px 0; font-weight:800; font-family:'Space Grotesk', 'Plus Jakarta Sans', sans-serif;">
                    Your Subscription is Upgraded to <span style="color:#ec4899;">${tierUpper} Tier</span>! 🎉
                  </h2>
                  <p style="font-size:15px; color:#2d2b3d; margin:0 0 24px 0; font-family:'Inter', sans-serif; line-height:1.6;">
                    Your account limits and premium agency tools are unlocked immediately. Here are your active monthly quotas:
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0; background-color:#eff6ff; border-radius:10px; border:1px solid #bfdbfe;">
                    <tr>
                      <td style="padding:24px;">
                        <div style="font-size:12px; font-weight:800; color:#1d4ed8; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; font-family:'Space Grotesk', sans-serif;">
                          Unlocked ${tierUpper} Plan Inclusions:
                        </div>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:'Inter', sans-serif;">
                          ${quotaBullets}
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Primary CTA Button -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://nearpro.s8n.in/#/dashboard/crm" style="display:inline-block; padding:14px 36px; background:linear-gradient(90deg, #ec4899 0%, #ffa000 100%); color:#0b081d; text-decoration:none; font-size:15px; font-weight:800; border-radius:8px; border:2px solid #0b081d; font-family:'Space Grotesk', sans-serif; box-shadow:0 6px 18px rgba(236, 72, 153, 0.35);">
                          Access CRM Workspace &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${commonFooter}
            </table>
          </td>
        </tr>
      </table>
      </body>
      </html>
      `;
    } else if (type === 'waitlist') {
      subject = `✨ You are on the NearPro Priority Waitlist!`;
      emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NearPro Priority Waitlist</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f6; font-family:'Plus Jakarta Sans', 'Inter', sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6; padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(8, 7, 16, 0.08);">
              ${commonHeader}
              <tr>
                <td style="padding:40px 36px 32px 36px;">
                  <p style="font-size:15px; color:#2d2b3d; margin:0 0 12px 0; font-family:'Inter', sans-serif;">
                    Hello <strong>${recipientDisplayName}</strong>,
                  </p>
                  <h2 style="font-size:22px; color:#0b081d; margin:0 0 20px 0; font-weight:800; font-family:'Space Grotesk', sans-serif;">
                    Priority Waitlist Confirmed 🚀
                  </h2>
                  <p style="font-size:15px; color:#2d2b3d; margin:0 0 24px 0; font-family:'Inter', sans-serif; line-height:1.6;">
                    Thank you for requesting early city access. Your priority reservation is locked in our launch queue.
                  </p>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0; background-color:#fff1f6; border-radius:10px; border:1px solid #fbcfe8;">
                    <tr>
                      <td style="padding:20px; text-align:center;">
                        <div style="font-size:14px; font-weight:800; color:#ec4899; font-family:'Space Grotesk', sans-serif;">
                          📍 Priority Status: Reserved and Locked
                        </div>
                        <div style="font-size:13.5px; color:#666480; margin-top:6px; font-family:'Inter', sans-serif;">
                          You will receive 1 Month Free Scout Tier access the moment data for your requested city drops!
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Primary CTA Button -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://nearpro.s8n.in/#/dashboard/directory" style="display:inline-block; padding:14px 36px; background:linear-gradient(90deg, #ec4899 0%, #ffa000 100%); color:#0b081d; text-decoration:none; font-size:15px; font-weight:800; border-radius:8px; border:2px solid #0b081d; font-family:'Space Grotesk', sans-serif; box-shadow:0 6px 18px rgba(236, 72, 153, 0.35);">
                          Explore Live Mumbai Directory &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${commonFooter}
            </table>
          </td>
        </tr>
      </table>
      </body>
      </html>
      `;
    } else {
      // Default: Invoice Email (No Hyphens)
      subject = `Tax Invoice ${invoiceNumber} : NearPro ${tierUpper} Plan Purchase`;
      const numericPaid = parseFloat(net_paid) || (plan_id === 'scout' ? 499 : (plan_id === 'agency' ? 2499 : 999));
      const baseAmount = (numericPaid / 1.18).toFixed(2);
      const gstAmount = (numericPaid - parseFloat(baseAmount)).toFixed(2);
      const halfGst = (parseFloat(gstAmount) / 2).toFixed(2);

      emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice NearPro</title>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f6; font-family:'Plus Jakarta Sans', 'Inter', sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f6; padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(8, 7, 16, 0.08);">
              ${commonHeader}
              <tr>
                <td style="padding:40px 36px 32px 36px;">
                  
                  <!-- Badge & Invoice Header -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td>
                        <span style="background:#fff1f6; color:#ec4899; font-size:11px; font-weight:800; padding:6px 12px; border-radius:4px; border:1px solid #fbcfe8; text-transform:uppercase; letter-spacing:0.5px; font-family:'Space Grotesk', sans-serif;">
                          PAID TAX INVOICE
                        </span>
                        <h2 style="font-size:20px; color:#0b081d; margin:12px 0 4px 0; font-weight:800; font-family:'Space Grotesk', sans-serif;">
                          ${invoiceNumber}
                        </h2>
                        <p style="font-size:13px; color:#666480; margin:0; font-family:'Inter', sans-serif;">
                          Date: ${invoiceDate} &bull; Payment Ref: ${payment_id || 'RZP_SUCCESS'}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Info Grid -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px; background-color:#f8f8fa; border-radius:8px; padding:20px; border:1px solid #e8e8f0;">
                    <tr>
                      <td style="vertical-align:top; font-size:13.5px; color:#2d2b3d; line-height:1.6; font-family:'Inter', sans-serif;">
                        <strong style="color:#0b081d; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:4px;">Billed To:</strong>
                        <strong>${recipientDisplayName}</strong><br>
                        ${user_email}<br>
                        ${company_name ? `Company: ${company_name}<br>` : ''}
                        ${gst_number ? `GSTIN: ${gst_number}` : ''}
                      </td>
                      <td style="vertical-align:top; text-align:right; font-size:13.5px; color:#2d2b3d; line-height:1.6; font-family:'Inter', sans-serif;">
                        <strong style="color:#0b081d; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:4px;">Seller Info:</strong>
                        <strong>S8N Technologies</strong><br>
                        NearPro Platform<br>
                        Mumbai, Maharashtra, India
                      </td>
                    </tr>
                  </table>

                  <!-- Itemized Table -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px; border-collapse:collapse; font-size:13.5px; font-family:'Inter', sans-serif;">
                    <thead>
                      <tr style="background-color:#0b081d; color:#ffffff;">
                        <th style="padding:12px 14px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-radius:6px 0 0 6px;">Description</th>
                        <th style="padding:12px 14px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:0.5px;">Base Rate</th>
                        <th style="padding:12px 14px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:0.5px;">GST (18%)</th>
                        <th style="padding:12px 14px; text-align:right; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; border-radius:0 6px 6px 0;">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style="border-bottom:1px solid #e8e8f0;">
                        <td style="padding:14px; color:#0b081d;">
                          <strong>NearPro ${tierUpper} Plan</strong><br>
                          <span style="font-size:12px; color:#666480;">1 Month Business Intelligence and Lead Access</span>
                        </td>
                        <td style="padding:14px; text-align:right; color:#2d2b3d;">₹${baseAmount}</td>
                        <td style="padding:14px; text-align:right; color:#2d2b3d;">₹${gstAmount}</td>
                        <td style="padding:14px; text-align:right; font-weight:bold; color:#0b081d;">₹${numericPaid.toFixed(2)}</td>
                      </tr>
                      <tr style="border-bottom:1px solid #e8e8f0;">
                        <td colspan="3" style="padding:10px 14px; text-align:right; color:#666480; font-size:12px;">CGST (9%)</td>
                        <td style="padding:10px 14px; text-align:right; font-size:12px; color:#2d2b3d;">₹${halfGst}</td>
                      </tr>
                      <tr style="border-bottom:1px solid #e8e8f0;">
                        <td colspan="3" style="padding:10px 14px; text-align:right; color:#666480; font-size:12px;">SGST (9%)</td>
                        <td style="padding:10px 14px; text-align:right; font-size:12px; color:#2d2b3d;">₹${halfGst}</td>
                      </tr>
                      <tr style="background-color:#ecfdf5;">
                        <td colspan="3" style="padding:14px; text-align:right; font-weight:800; color:#047857; font-size:14px;">Total Net Paid:</td>
                        <td style="padding:14px; text-align:right; font-weight:800; color:#047857; font-size:16px;">₹${numericPaid.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Primary CTA Button -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://nearpro.s8n.in/#/dashboard/directory" style="display:inline-block; padding:14px 36px; background:linear-gradient(90deg, #ec4899 0%, #ffa000 100%); color:#0b081d; text-decoration:none; font-size:15px; font-weight:800; border-radius:8px; border:2px solid #0b081d; font-family:'Space Grotesk', sans-serif; box-shadow:0 6px 18px rgba(236, 72, 153, 0.35);">
                          Launch Workspace Dashboard &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
              ${commonFooter}
            </table>
          </td>
        </tr>
      </table>
      </body>
      </html>
      `;
    }

    // Send email using Resend API
    let resendData: any = null;
    if (RESEND_API_KEY) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          reply_to: SUPPORT_EMAIL,
          to: [user_email],
          subject: subject,
          html: emailHTML
        })
      });

      resendData = await resendRes.json();
      console.log(`Resend API response for [${type}] to ${user_email}:`, resendData);
    } else {
      console.log(`RESEND_API_KEY not configured. Logged ${type} email generation for:`, user_email);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      type: type,
      invoice_number: type === 'invoice' ? invoiceNumber : undefined,
      resend_response: resendData
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Email generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
