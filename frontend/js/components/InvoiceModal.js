import { State } from '../state.js';

export function generateInvoiceHTML(upgradeData) {
    const user = State.user || {};
    const profile = State.profile || {};
    
    const userName = profile.full_name || user.email?.split('@')[0] || 'Valued Client';
    const userEmail = user.email || 'client@nearpro.s8n.in';
    const companyName = profile.company_name || '';
    const planName = (upgradeData.tier || profile.subscription_tier || 'Hunter').toUpperCase();
    
    const netPaid = parseFloat(upgradeData.netPaid) || (planName === 'SCOUT' ? 499 : (planName === 'AGENCY' ? 2499 : 999));
    const baseAmount = (netPaid / 1.18).toFixed(2);
    const gstTotal = (netPaid - parseFloat(baseAmount)).toFixed(2);
    const halfGst = (parseFloat(gstTotal) / 2).toFixed(2);
    
    const invoiceNo = upgradeData.invoiceNumber || `INV-NEARPRO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = upgradeData.paymentId || `pay_${Math.random().toString(36).slice(2, 8)}`;
    const issueDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    return `
        <div id="taxInvoicePrintArea" style="background: #09090b; color: white; padding: 32px; border-radius: 12px; border: 1px solid var(--border); max-width: 650px; margin: 0 auto; font-family: var(--font-sans, 'Inter', sans-serif);">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
                <div>
                    <div style="font-size: 24px; font-weight: 800; font-family: var(--font-heading); color: white;">
                        NearPro <span style="color: var(--accent-gold);">by S8N</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                        India's Trusted B2B Lead Intelligence Platform
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); color: #4ade80; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; font-family: var(--font-mono);">
                        ✓ PAID TAX INVOICE
                    </span>
                    <div style="font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); margin-top: 8px;">
                        Ref: ${paymentId}
                    </div>
                </div>
            </div>

            <!-- Invoice Details Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; font-size: 13px;">
                <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 10.5px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; font-weight: bold;">
                        BILLED TO:
                    </div>
                    <div style="font-weight: 700; color: white; font-size: 14px;">${userName}</div>
                    <div style="color: var(--text-secondary); margin-top: 2px;">${userEmail}</div>
                    ${companyName ? `<div style="color: var(--accent-gold); margin-top: 4px; font-size: 12px;">Company: ${companyName}</div>` : ''}
                </div>
                <div style="background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); text-align: right;">
                    <div style="font-size: 10.5px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; font-weight: bold;">
                        INVOICE METADATA:
                    </div>
                    <div style="color: white;">Invoice #: <strong style="font-family: var(--font-mono);">${invoiceNo}</strong></div>
                    <div style="color: var(--text-secondary); margin-top: 2px;">Date: ${issueDate}</div>
                    <div style="color: var(--text-secondary); margin-top: 2px;">Gateway: Razorpay PCI-DSS</div>
                </div>
            </div>

            <!-- Itemized Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
                <thead>
                    <tr style="background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); font-size: 11px; font-family: var(--font-mono); text-transform: uppercase;">
                        <th style="padding: 10px 12px; text-align: left;">Item Description</th>
                        <th style="padding: 10px 12px; text-align: right;">Base Price</th>
                        <th style="padding: 10px 12px; text-align: right;">GST (18%)</th>
                        <th style="padding: 10px 12px; text-align: right;">Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px; color: white;">
                            <strong style="font-size: 14px;">NearPro ${planName} Plan</strong>
                            <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">1 Month Unlimited B2B Lead Intelligence Access</div>
                        </td>
                        <td style="padding: 12px; text-align: right; color: var(--text-secondary); font-family: var(--font-mono);">₹${baseAmount}</td>
                        <td style="padding: 12px; text-align: right; color: var(--text-secondary); font-family: var(--font-mono);">₹${gstTotal}</td>
                        <td style="padding: 12px; text-align: right; color: white; font-weight: 700; font-family: var(--font-mono);">₹${netPaid.toFixed(2)}</td>
                    </tr>
                    <tr style="font-size: 12px; color: var(--text-muted);">
                        <td colspan="3" style="padding: 6px 12px; text-align: right;">CGST (9%)</td>
                        <td style="padding: 6px 12px; text-align: right; font-family: var(--font-mono);">₹${halfGst}</td>
                    </tr>
                    <tr style="font-size: 12px; color: var(--text-muted);">
                        <td colspan="3" style="padding: 6px 12px; text-align: right;">SGST (9%)</td>
                        <td style="padding: 6px 12px; text-align: right; font-family: var(--font-mono);">₹${halfGst}</td>
                    </tr>
                    <tr style="background: rgba(34, 197, 94, 0.08); font-weight: 700; border-top: 2px solid #22c55e;">
                        <td colspan="3" style="padding: 12px; text-align: right; color: white; font-size: 14px;">Total Amount Charged:</td>
                        <td style="padding: 12px; text-align: right; color: #4ade80; font-size: 16px; font-family: var(--font-mono);">₹${netPaid.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Seller Credentials -->
            <div style="background: rgba(255,160,0,0.03); border: 1px solid rgba(255,160,0,0.15); border-radius: 8px; padding: 14px; font-size: 12px; color: var(--text-secondary); margin-bottom: 24px;">
                <strong style="color: white; font-family: var(--font-mono);">ISSUER / SELLER DETAILS:</strong><br>
                S8N Technologies — NearPro Platform<br>
                Mumbai Metropolitan Region, Maharashtra, India • Email: s8nservice@gmail.com • Web: https://nearpro.s8n.in
            </div>
        </div>
    `;
}

export function printTaxInvoice(upgradeData) {
    const htmlContent = generateInvoiceHTML(upgradeData);
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
        alert("Please allow popups to print/save your tax invoice.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Tax Invoice — NearPro by S8N</title>
            <style>
                body { background: #09090b; color: white; font-family: 'Inter', system-ui, sans-serif; padding: 20px; }
                @media print {
                    body { background: white !important; color: black !important; }
                    #taxInvoicePrintArea { background: white !important; color: black !important; border: 1px solid #ddd !important; }
                    #taxInvoicePrintArea * { color: black !important; }
                }
            </style>
        </head>
        <body>
            ${htmlContent}
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
