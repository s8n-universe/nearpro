"""Seed default outreach templates into outreach_templates table."""
import psycopg2

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # 7 default system templates (Strictly avoiding hyphens in copy!)
    templates = [
        {
            "name": "Web Developer (Hinglish)",
            "channel": "whatsapp",
            "language": "hinglish",
            "role": "web_developer",
            "template_text": "Hello {{business_name}} team, main local web developer hoon Mumbai se. Maine dekha aapka rating Google par {{rating}} star hai. Par aapki website load hone me time leti hai, jiski wajah se lagbhag {{est_lost_revenue}} monthly revenue leak ho raha hai. Maine aapki brand ke liye ek custom demo design kiya hai: {{demo_url}}. Agar aap free hain, kya hum discuss kar sakte hain?",
            "follow_up_text": "Hi team, quick follow up regarding the custom website draft. Please let me know if you would like a short video walkthrough."
        },
        {
            "name": "Web Developer (English)",
            "channel": "email",
            "language": "english",
            "role": "web_developer",
            "template_text": "Subject: Website speed audit for {{business_name}}\n\nHello Team,\n\nI conducted a quick Google mobile page speed scan on your listing in {{area}}. While your customer rating is strong at {{rating}} stars, your page is losing conversions due to loading lag, resulting in an estimated leak of INR {{est_lost_revenue}} per month.\n\nI built a mobile friendly demo layout to fix this: {{demo_url}}.\n\nAre you open to a brief call this week?\n\nBest,\n[Your Name]",
            "follow_up_text": "Hello, following up on my previous audit email. Would you be free for a 5 minute call to review the mobile speed improvements?"
        },
        {
            "name": "SEO and Reputation (Hinglish)",
            "channel": "whatsapp",
            "language": "hinglish",
            "role": "seo_marketer",
            "template_text": "Hello {{business_name}}, maine dekha aapki listing ka Google search ranking thoda low hai kyunki schema and meta tags missing hain. SEO fixes ke bina competitors clients pick kar rahe hain. Isko solve karne ke liye mere paas quick organic plan hai. Free scan review ke liye connect karein?",
            "follow_up_text": "Quick nudge here. I can send you a free report detailing why your competitors are ranking higher in local maps search."
        },
        {
            "name": "CA and Finance Audit (Hinglish)",
            "channel": "whatsapp",
            "language": "hinglish",
            "role": "finance_ca",
            "template_text": "Hello {{business_name}} team, main CA finance expert hoon. Aapka Google maps profile dekha. Growth and tax planning compliance me guide karne ke liye main aapse connect karna chahta hoon. Ek free compliance audit share kar sakta hoon kya?",
            "follow_up_text": "Nudge. Our team is running free tax savings evaluations for business owners in {{area}} this week. Let me know if interested."
        },
        {
            "name": "Commercial Space (Hinglish)",
            "channel": "whatsapp",
            "language": "hinglish",
            "role": "real_estate",
            "template_text": "Hello {{business_name}} team, main commercial space consultant hoon. Aapki strong rating dekhi. Relocation or new branch setup ke liye hamare paas office listings hain. Catalog share karein?",
            "follow_up_text": "Hi team, we just updated our commercial leasing list for {{area}}. Let me know if you are planning to relocate or expand."
        },
        {
            "name": "General B2B Partner (Hinglish)",
            "channel": "whatsapp",
            "language": "hinglish",
            "role": "other",
            "template_text": "Hello {{business_name}} team, hum B2B services manage karte hain Mumbai me. Aapka business {{area}} me popular hai. Kya hum referral partnership ke liye discuss kar sakte hain?",
            "follow_up_text": "Nudge. Just wanted to see if you had 2 minutes for a brief partnership call this week."
        },
        {
            "name": "General B2B Partner (English)",
            "channel": "email",
            "language": "english",
            "role": "other",
            "template_text": "Subject: Partnership request with {{business_name}}\n\nHello Team,\n\nI represent a B2B service agency in Mumbai. We work with established local brands like {{business_name}} to supply verified clients.\n\nWould you be open to a quick call to check mutual synergies?\n\nBest,\n[Your Name]",
            "follow_up_text": "Following up. Would love to run a short sync to explore potential partnership opportunities with your team."
        }
    ]
    
    print("Seeding outreach templates...")
    for t in templates:
        cur.execute("""
            INSERT INTO outreach_templates (name, channel, language, role, template_text, follow_up_text, is_system)
            VALUES (%s, %s, %s, %s, %s, %s, TRUE)
            ON CONFLICT DO NOTHING
        """, (t["name"], t["channel"], t["language"], t["role"], t["template_text"], t["follow_up_text"]))
        
    conn.commit()
    print("Templates successfully seeded!")
    conn.close()

if __name__ == "__main__":
    main()
