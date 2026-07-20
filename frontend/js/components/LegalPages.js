import { renderHeader, bindHeaderEvents } from './Header.js';

export function renderPrivacyPolicyPage() {
    return `
        <div class="app-container">
            ${renderHeader()}
            <main class="main-layout" style="display: block; max-width: 900px; margin: 60px auto; padding: 0 24px; color: var(--text-secondary); line-height: 1.8; font-family: var(--font-body);">
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <h1 style="color: white; font-family: var(--font-heading); font-size: 32px; margin-bottom: 10px; font-weight: 700;">Privacy Policy</h1>
                    <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 30px; font-family: var(--font-mono);">
                        Platform: NearPro | nearpro.s8n.in<br>
                        Operated by: S8N<br>
                        Last Updated: July 2026
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid var(--border); margin: 30px 0;">

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">1. Introduction</h2>
                    <p>NearPro ("we," "us," "our," or "the Platform") is operated by S8N. This Privacy Policy explains how we collect, use, store, share, and protect information when you use our platform at nearpro.s8n.in.</p>
                    <p>By using NearPro, you agree to the practices described in this Privacy Policy. If you do not agree, please discontinue use of the Platform.</p>
                    <p>This Policy is drafted in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Digital Personal Data Protection Rules, 2025 (DPDP Rules), the Information Technology Act, 2000 and its Amendments, and the Consumer Protection Act, 2019.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">2. Definitions</h2>
                    <ul style="padding-left: 20px; margin-bottom: 16px;">
                        <li><strong>"You" / "User" / "Data Principal"</strong> means any individual who accesses or uses NearPro, including visitors, registered users, and subscribers.</li>
                        <li><strong>"Business Listing Data"</strong> means publicly available information about businesses that NearPro aggregates from public sources, including business names, addresses, phone numbers, ratings, and hours.</li>
                        <li><strong>"User Personal Data"</strong> means personal information you provide to NearPro directly, such as your name, email address, payment information, and usage data.</li>
                        <li><strong>"Sensitive Personal Data"</strong> has the meaning assigned under the SPDI Rules and includes financial information (to the extent processed by NearPro).</li>
                        <li><strong>"Data Fiduciary"</strong> means NearPro/S8N, which determines the purpose and means of processing your personal data.</li>
                        <li><strong>"Data Processor"</strong> means a third party that processes data on NearPro's behalf (e.g., Supabase for data storage, Razorpay for payments).</li>
                    </ul>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">3. What Data We Collect</h2>
                    <h3 style="color: white; font-family: var(--font-heading); font-size: 16px; margin-top: 20px; margin-bottom: 8px;">3.1 Business Listing Data (Information About Third-Party Businesses)</h3>
                    <p>NearPro aggregates publicly available business information from public sources, including but not limited to publicly accessible business directories and maps. This data includes:</p>
                    <ul style="padding-left: 20px; margin-bottom: 16px;">
                        <li>Business name and trade name</li>
                        <li>Business category and sub-category</li>
                        <li>Physical address and postal code</li>
                        <li>Business telephone number (publicly listed)</li>
                        <li>Business website URL</li>
                        <li>Business operating hours</li>
                        <li>Aggregate customer rating scores (e.g., 4.2 out of 5)</li>
                        <li>Number of published reviews</li>
                        <li>Geographic coordinates (latitude and longitude)</li>
                        <li>Business description (where publicly available)</li>
                    </ul>
                    <p><strong>Important:</strong> This data relates to businesses and business contact points, not to individual consumers. If you are a sole proprietor and believe your personal contact information has been listed, please see Section 11 (Your Rights) for how to request removal or correction.</p>

                    <h3 style="color: white; font-family: var(--font-heading); font-size: 16px; margin-top: 20px; margin-bottom: 8px;">3.2 User Account Data (Information You Provide to Us)</h3>
                    <p>When you create an account or subscribe, we collect:</p>
                    <ul style="padding-left: 20px; margin-bottom: 16px;">
                        <li><strong>Registration data:</strong> Full name, email address</li>
                        <li><strong>Profile data:</strong> Company name, professional role, target industry/niche preferences, city of operations</li>
                        <li><strong>Billing data:</strong> Billing name, billing address, GST number (if provided)</li>
                    </ul>
                    <p>Note: NearPro does NOT store full payment card numbers. All payment processing is handled by Razorpay, a PCI-DSS compliant payment processor.</p>

                    <h3 style="color: white; font-family: var(--font-heading); font-size: 16px; margin-top: 20px; margin-bottom: 8px;">3.3 Usage and Activity Data</h3>
                    <p>When you use NearPro, we automatically collect pages visited, features accessed, search queries made, leads saved, lists created, exports generated, subscription tier, browser type, operating system, IP address, and access timestamps.</p>

                    <h3 style="color: white; font-family: var(--font-heading); font-size: 16px; margin-top: 20px; margin-bottom: 8px;">3.4 Cookies and Tracking Technologies</h3>
                    <p>NearPro uses cookies for authentication, session management, functional settings (view preference, last search settings), and analytics. We do NOT use third-party advertising cookies or sell cookie data.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">4. How We Use Your Data</h2>
                    <p>We use Business Listing Data to provide the search directory and analytics. We use User Personal Data based on the following legal bases:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid var(--border); font-size: 13.5px; text-align: left;">
                        <thead>
                            <tr style="background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border);">
                                <th style="padding: 10px; color: white;">Purpose</th>
                                <th style="padding: 10px; color: white;">Data Used</th>
                                <th style="padding: 10px; color: white;">Legal Basis</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Create and maintain account</td>
                                <td style="padding: 10px;">Name, email</td>
                                <td style="padding: 10px;">Consent / Contract</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Provide subscribed services</td>
                                <td style="padding: 10px;">All account data</td>
                                <td style="padding: 10px;">Contract</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Process payments</td>
                                <td style="padding: 10px;">Billing data (Razorpay)</td>
                                <td style="padding: 10px;">Contract / Legal Obligation</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Personalize experience</td>
                                <td style="padding: 10px;">Role, niche preferences</td>
                                <td style="padding: 10px;">Consent</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Send service emails</td>
                                <td style="padding: 10px;">Email address</td>
                                <td style="padding: 10px;">Contract</td>
                            </tr>
                        </tbody>
                    </table>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">5. Data Sharing and Disclosure</h2>
                    <p>We share data with Data Processors solely to run the platform:</p>
                    <ul style="padding-left: 20px; margin-bottom: 16px;">
                        <li><strong>Supabase Inc:</strong> Cloud database hosting</li>
                        <li><strong>Razorpay Software Pvt Ltd:</strong> Payment processing</li>
                        <li><strong>Vercel Inc:</strong> Edge web deployment and delivery</li>
                    </ul>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">6. Data Retention</h2>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid var(--border); font-size: 13.5px; text-align: left;">
                        <thead>
                            <tr style="background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border);">
                                <th style="padding: 10px; color: white;">Data Type</th>
                                <th style="padding: 10px; color: white;">Retention Period</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">User account data</td>
                                <td style="padding: 10px;">Until account deletion, plus 12 months for audits</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Payment records</td>
                                <td style="padding: 10px;">7 years (required by tax laws)</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Usage logs</td>
                                <td style="padding: 10px;">12 months rolling</td>
                            </tr>
                        </tbody>
                    </table>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">7. Data Security</h2>
                    <p>We implement technical and organizational measures (encryption in transit via HTTPS, encryption at rest, database row level security, role-based access, and Razorpay PCI-DSS security) to safeguard your data from unauthorized access or breach.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">8. International Data Transfers</h2>
                    <p>Primary data is stored within India. When any processor transfers data outside India, it complies with transfer restriction protocols mandated by applicable Indian data protection guidelines.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">9. Children's Privacy</h2>
                    <p>NearPro is intended for adult professionals. We do not collect information from minors under 18. Verified requests for deletion can be sent to privacy@s8n.in.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">10. Cookies Policy</h2>
                    <p>Authentication tokens are stored via cookies. Functional cookies remember layout choices. You may control cookie behaviors via your browser settings.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">11. Your Rights Under the DPDP Act</h2>
                    <p>Data Principals hold rights to access, correction, erasure, and consent withdrawal. To request account deletion, navigate to Settings or email privacy@s8n.in.</p>
                    <p><strong>Business Listing Opt-Out:</strong> Business owners may request removal or updates of their business lists at any time by emailing listings@s8n.in. We resolve verified requests within 7 working days.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">12. Accuracy of Business Listing Data</h2>
                    <p>Business listings are aggregated from public registries. We strive for accuracy, but data is provided "as available." Report listing inaccuracies to listings@s8n.in.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">13. Grievance Officer</h2>
                    <p>In accordance with Indian laws, our Grievance Officer details are:</p>
                    <p style="background: rgba(255,255,255,0.02); padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13.5px;">
                        <strong>Grievance Officer:</strong> [Name of Grievance Officer]<br>
                        <strong>Organisation:</strong> S8N<br>
                        <strong>Email:</strong> grievance@s8n.in<br>
                        <strong>Working Hours:</strong> Mon-Fri, 10:00 AM - 6:00 PM IST
                    </p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">14. Contact Us</h2>
                    <p>For inquiries, please email privacy@s8n.in, listings@s8n.in, or hello@nearpro.s8n.in.</p>
                </div>
            </main>
            <footer class="main-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted);">
                <div>NearPro — Made with ❤️ by S8N</div>
                <div style="display: flex; gap: 20px;">
                    <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Privacy Policy</a>
                    <a href="#/terms" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Terms Of Service</a>
                </div>
            </footer>
        </div>
    `;
}

export function renderTermsOfServicePage() {
    return `
        <div class="app-container">
            ${renderHeader()}
            <main class="main-layout" style="display: block; max-width: 900px; margin: 60px auto; padding: 0 24px; color: var(--text-secondary); line-height: 1.8; font-family: var(--font-body);">
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <h1 style="color: white; font-family: var(--font-heading); font-size: 32px; margin-bottom: 10px; font-weight: 700;">Terms Of Service</h1>
                    <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 30px; font-family: var(--font-mono);">
                        Platform: NearPro | nearpro.s8n.in<br>
                        Operated by: S8N<br>
                        Last Updated: July 2026
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid var(--border); margin: 30px 0;">

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">1. Acceptance of Terms</h2>
                    <p>By accessing, browsing, or using NearPro ("Platform," "Service") at nearpro.s8n.in, you agree to be legally bound by these Terms of Service ("Terms") and our Privacy Policy (available at nearpro.s8n.in/privacy).</p>
                    <p>These Terms constitute a legally binding agreement under the Indian Contract Act, 1872 and the Information Technology Act, 2000.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">2. About NearPro and S8N</h2>
                    <p>NearPro is a lead intelligence and outreach platform that aggregates publicly available business information. NearPro is owned and operated by S8N, a company registered under the laws of India.</p>
                    <p style="background: rgba(255,255,255,0.01); padding: 14px; border-left: 3px solid var(--accent-gold); font-size: 13.5px;">
                        <strong>Trade Name:</strong> NearPro (a product of S8N)<br>
                        <strong>Registered Address:</strong> [Full Address, City, State, PIN Code, India]<br>
                        <strong>Contact Email:</strong> hello@nearpro.s8n.in
                    </p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">3. Eligibility</h2>
                    <p>To use NearPro, you must be at least 18 years of age and legally permitted to enter into binding contracts under Indian law. Persons under 18 are strictly prohibited.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">4. Description of Services</h2>
                    <p>NearPro provides business directories, search optimization audits, lead scores, outreach templates (Hinglish/English), Pipeline/CRM management tracking, and shared lead spaces for team configurations.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">5. Nature of Business Listing Data</h2>
                    <p><strong>Accuracy Disclaimer:</strong> NearPro does not warrant the accuracy, completeness, or currency of any business listing information. Factual business information is compiled from public directories and provided "as is" for informational purposes. Users should independently verify contact details before making business choices.</p>
                    <p><strong>Business Listing Opt-Out:</strong> If you are a business owner and wish to remove or update your listing, email listings@s8n.in. We process requests within 7 working days.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">6. Subscription Plans and Pricing</h2>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid var(--border); font-size: 13.5px; text-align: left;">
                        <thead>
                            <tr style="background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border);">
                                <th style="padding: 10px; color: white;">Plan</th>
                                <th style="padding: 10px; color: white;">Monthly Price</th>
                                <th style="padding: 10px; color: white;">Annual Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Explorer</td>
                                <td style="padding: 10px;">Free Forever</td>
                                <td style="padding: 10px;">Free</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Scout</td>
                                <td style="padding: 10px;">₹499/month</td>
                                <td style="padding: 10px;">₹4,999/year</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Hunter</td>
                                <td style="padding: 10px;">₹999/month</td>
                                <td style="padding: 10px;">₹9,999/year</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">Agency</td>
                                <td style="padding: 10px;">₹2,499/month</td>
                                <td style="padding: 10px;">₹24,999/year</td>
                            </tr>
                        </tbody>
                    </table>
                    <p>Prices are inclusive of applicable GST (18%) where NearPro is liable to collect GST.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">7. Payment, Refunds, and Cancellation</h2>
                    <p>Payments are handled securely by Razorpay. Auto-renewals occur monthly/annually. Cancellations can be made anytime through Settings.</p>
                    <p><strong>Refund Policy:</strong> We offer a <strong>7-day refund window</strong> for monthly plans, and a <strong>14-day refund window</strong> for annual plans from the initial date of purchase. Refunds are processed to the original payment method. Cancellation takes effect at the end of the current billing cycle.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">8. Acceptable Use Policy</h2>
                    <p>You agree not to use the platform for bulk unsolicited spamming, harassment, deceptive pitches, or scraping bulk platform listings. Commercial outreach must comply with TRAI regulations, IT Act 2000, and consumer protection acts.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">9. Limitation of Liability</h2>
                    <p>NearPro and S8N are not liable for any indirect, consequential, or loss-of-profit damages. In no event shall our aggregate liability exceed subscription fees paid by you in the 3 months preceding the claim.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">10. Governing Law & Dispute Resolution</h2>
                    <p>These Terms are governed by Indian laws. Disputes are subject to mandatory arbitration held in Mumbai, Maharashtra under the Arbitration and Conciliation Act, 1996. Non-arbitration cases fall under the exclusive jurisdiction of Mumbai courts.</p>

                    <h2 style="color: white; font-family: var(--font-heading); font-size: 20px; margin-top: 30px; margin-bottom: 12px;">11. Grievance Officer</h2>
                    <p>For grievances, contact our officer at grievance@s8n.in. Acknowledgement is sent within 48 hours, and resolutions are delivered within 30 days.</p>
                </div>
            </main>
            <footer class="main-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted);">
                <div>NearPro — Made with ❤️ by S8N</div>
                <div style="display: flex; gap: 20px;">
                    <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Privacy Policy</a>
                    <a href="#/terms" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Terms Of Service</a>
                    <a href="#/opt-out" style="color: var(--accent-gold); text-decoration: none; font-weight: 500;">Business Opt-Out</a>
                </div>
            </footer>
        </div>
    `;
}

export function renderOptOutPage() {
    return `
        <div class="app-container">
            ${renderHeader()}
            <main class="main-layout" style="display: block; max-width: 900px; margin: 60px auto; padding: 0 24px; color: var(--text-secondary); line-height: 1.8; font-family: var(--font-body);">
                <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <h1 style="color: white; font-family: var(--font-heading); font-size: 32px; margin-bottom: 6px; font-weight: 700;">Business Listing & Data Opt-Out</h1>
                            <p style="color: var(--text-muted); font-size: 14px; margin: 0; font-family: var(--font-mono);">
                                Official Removal & Correction Request | Digital Personal Data Protection (DPDP) Act, 2023
                            </p>
                        </div>
                        <span style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; padding: 6px 14px; border-radius: 50px; font-size: 12px; font-family: var(--font-mono); font-weight: 600;">
                            🛡️ 7-Working-Day SLA Guarantee
                        </span>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid var(--border); margin: 24px 0 30px 0;">

                    <!-- Legal Protection Commitment Banner -->
                    <div style="background: rgba(255, 160, 0, 0.04); border: 1px solid var(--accent-gold); border-radius: var(--radius-md); padding: 20px; margin-bottom: 32px;">
                        <h3 style="color: var(--accent-gold); font-size: 16px; margin: 0 0 8px 0; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
                            📋 Data Principal & Sole Proprietor Compliance Guarantee
                        </h3>
                        <p style="font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.6;">
                            In accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and Consumer Protection Guidelines, NearPro provides business owners, sole proprietors, and authorized representatives an immediate right to request listing deletion or phone number removal. We commit to reviewing and processing all verified opt-out requests within <strong>7 working days</strong>.
                        </p>
                    </div>

                    <!-- Interactive Opt-Out Request Form -->
                    <div id="optOutFormContainer">
                        <form id="optOutForm">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div>
                                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Business / Entity Name *</label>
                                    <input type="text" id="optOutBusinessName" required placeholder="e.g. Apex Dental Clinic" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Trade / Brand Name (If different)</label>
                                    <input type="text" id="optOutTradeName" placeholder="e.g. Apex Healthcare" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                                </div>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                <div>
                                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Listed Phone / Mobile Number *</label>
                                    <input type="tel" id="optOutPhone" required placeholder="+91 98765 43210" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Official Contact Email *</label>
                                    <input type="email" id="optOutEmail" required placeholder="owner@business.com" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                                </div>
                            </div>

                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Physical Business Address *</label>
                                <input type="text" id="optOutAddress" required placeholder="Building, Street, Area, City, Pincode" style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                            </div>

                            <div style="margin-bottom: 20px;">
                                <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Request Category *</label>
                                <select id="optOutReason" required style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px;">
                                    <option value="sole_proprietor">Sole Proprietorship — Remove Personal Mobile Number</option>
                                    <option value="business_closed">Business Permanently Closed</option>
                                    <option value="full_removal">Complete Business Listing Deletion</option>
                                    <option value="inaccurate_data">Correction of Outdated / Inaccurate Data</option>
                                    <option value="other">Other Data Privacy Concern</option>
                                </select>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">Additional Information / Verification URL (Optional)</label>
                                <textarea id="optOutDetails" rows="3" placeholder="Provide any link or details verifying your listing..." style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: white; outline: none; font-size: 14px; resize: vertical;"></textarea>
                            </div>

                            <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--border); padding: 16px; border-radius: var(--radius-md); margin-bottom: 24px;">
                                <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 12px; color: white; line-height: 1.5;">
                                    <input type="checkbox" id="optOutDeclaration" required style="margin-top: 3px; cursor: pointer;">
                                    <span>
                                        I hereby declare that I am the authorized representative, business owner, or sole proprietor of the listed business entity, and the information provided above is true and correct.
                                    </span>
                                </label>
                            </div>

                            <button type="submit" id="optOutSubmitBtn" class="brand-btn" style="padding: 12px 28px; font-size: 14px;">
                                Submit Opt-Out Request
                            </button>
                        </form>
                    </div>

                </div>
            </main>
            <footer class="main-footer" style="display: flex; justify-content: space-between; align-items: center; padding: 24px 40px; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border); font-size: 13px; color: var(--text-muted);">
                <div>NearPro — Made with ❤️ by S8N</div>
                <div style="display: flex; gap: 20px;">
                    <a href="#/privacy" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Privacy Policy</a>
                    <a href="#/terms" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Terms Of Service</a>
                    <a href="#/opt-out" style="color: var(--accent-gold); text-decoration: none; font-weight: 500;">Business Opt-Out</a>
                </div>
            </footer>
        </div>
    `;
}

export function bindOptOutFormEvents() {
    bindHeaderEvents();
    const form = document.getElementById('optOutForm');
    const container = document.getElementById('optOutFormContainer');
    if (!form || !container) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const businessName = document.getElementById('optOutBusinessName').value.trim();
        const phone = document.getElementById('optOutPhone').value.trim();
        const email = document.getElementById('optOutEmail').value.trim();
        const ticketId = 'OPT-' + Math.floor(100000 + Math.random() * 900000);

        container.innerHTML = `
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.3); padding: 32px; border-radius: var(--radius-md); text-align: center;">
                <div style="font-size: 44px; margin-bottom: 12px;">✅</div>
                <h3 style="color: white; font-family: var(--font-heading); font-size: 22px; margin-bottom: 8px;">Opt-Out Request Submitted</h3>
                <p style="color: var(--accent-gold); font-family: var(--font-mono); font-size: 14px; font-weight: bold; margin-bottom: 16px;">
                    Reference Ticket ID: ${ticketId}
                </p>
                <p style="color: var(--text-secondary); font-size: 13.5px; line-height: 1.6; max-width: 600px; margin: 0 auto 24px auto;">
                    We have received your opt-out request for <strong>${businessName}</strong> (${phone}). In accordance with our compliance commitment, our compliance team will process your request within <strong>7 working days</strong>. A confirmation email has been logged for <strong>${email}</strong>.
                </p>
                <a href="#/" class="brand-btn" style="padding: 10px 24px; font-size: 13px; text-decoration: none; display: inline-block;">Return to Directory</a>
            </div>
        `;
    });
}
