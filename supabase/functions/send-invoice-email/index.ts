import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

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
    const invoiceNumber = `INV-NEARPRO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Calculate GST (18%)
    const numericPaid = parseFloat(net_paid) || (plan_id === 'scout' ? 499 : (plan_id === 'agency' ? 2499 : 999));
    const baseAmount = (numericPaid / 1.18).toFixed(2);
    const gstAmount = (numericPaid - parseFloat(baseAmount)).toFixed(2);
    const halfGst = (parseFloat(gstAmount) / 2).toFixed(2);

    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #09090b; color: #e4e4e7; margin: 0; padding: 20px; }
        .invoice-card { max-width: 600px; margin: 0 auto; background: #121218; border: 1px solid #27272a; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; }
        .logo-title { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
        .badge { background: rgba(255,160,0,0.15); color: #ffa000; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,160,0,0.3); text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; }
        .info-col h4 { margin: 0 0 6px 0; color: #a1a1aa; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-col p { margin: 0; color: #ffffff; line-height: 1.4; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
        .table th { background: #181820; color: #a1a1aa; text-transform: uppercase; font-size: 11px; padding: 10px 12px; text-align: left; border-bottom: 1px solid #27272a; }
        .table td { padding: 12px; border-bottom: 1px solid #27272a; color: #ffffff; }
        .total-row { background: rgba(16,185,129,0.08); font-weight: 700; }
        .total-row td { color: #10b981; font-size: 15px; border-top: 2px solid #10b981; }
        .footer { text-align: center; border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #71717a; }
        .btn { display: inline-block; background: #ffa000; color: #000000; text-decoration: none; padding: 12px 24px; font-weight: 700; border-radius: 6px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div>
            <div class="logo-title">NearPro <span style="color: #ffa000;">by S8N</span></div>
            <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">India's Trusted B2B Lead Intelligence Platform</div>
          </div>
          <span class="badge">PAID TAX INVOICE</span>
        </div>

        <div class="info-grid">
          <div class="info-col">
            <h4>Billed To:</h4>
            <p><strong>${user_name || 'Valued Subscriber'}</strong></p>
            <p>${user_email}</p>
            ${company_name ? `<p>Company: ${company_name}</p>` : ''}
            ${gst_number ? `<p>GSTIN: ${gst_number}</p>` : ''}
          </div>
          <div class="info-col" style="text-align: right;">
            <h4>Invoice Details:</h4>
            <p><strong>Invoice No:</strong> ${invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoiceDate}</p>
            <p><strong>Payment Ref:</strong> ${payment_id}</p>
            <p><strong>Status:</strong> Success (Razorpay)</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Base Rate</th>
              <th style="text-align: right;">GST (18%)</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>NearPro ${tierName} Plan</strong><br>
                <span style="font-size: 11px; color: #a1a1aa;">1 Month Unlimited Business Intelligence & Lead Access</span>
              </td>
              <td style="text-align: right;">₹${baseAmount}</td>
              <td style="text-align: right;">₹${gstAmount}</td>
              <td style="text-align: right; font-weight: bold;">₹${numericPaid.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; color: #a1a1aa; font-size: 12px;">CGST (9%)</td>
              <td style="text-align: right; font-size: 12px;">₹${halfGst}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right; color: #a1a1aa; font-size: 12px;">SGST (9%)</td>
              <td style="text-align: right; font-size: 12px;">₹${halfGst}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Total Net Paid:</td>
              <td style="text-align: right;">₹${numericPaid.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style="background: rgba(255,255,255,0.02); border: 1px solid #27272a; border-radius: 8px; padding: 14px; font-size: 12px; color: #a1a1aa; margin-bottom: 24px;">
          <strong style="color: #ffffff;">Seller Details:</strong><br>
          S8N Technologies / NearPro Platform<br>
          Mumbai, Maharashtra, India • Support: s8nservice@gmail.com • Web: https://nearpro.s8n.in
        </div>

        <div class="footer">
          <p>Thank you for choosing NearPro by S8N! Your subscription is active immediately.</p>
          <a href="https://nearpro.s8n.in/#/dashboard/directory" class="btn">Launch Workspace Dashboard 🚀</a>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email using Resend API if API Key is configured
    if (RESEND_API_KEY) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "NearPro Billing <billing@s8n.in>",
          to: [user_email],
          subject: `Tax Invoice ${invoiceNumber} — NearPro ${tierName} Plan Purchase`,
          html: emailHTML
        })
      });

      const resendData = await resendRes.json();
      console.log("Resend API response:", resendData);
    } else {
      console.log("RESEND_API_KEY not set. Logged HTML invoice generation for:", user_email);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      invoice_number: invoiceNumber,
      html: emailHTML 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Invoice generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
