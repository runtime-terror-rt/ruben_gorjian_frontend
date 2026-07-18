import React from 'react';
import './faq.css';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';
import Link from 'next/link';
import '../newhome.css';

export const metadata = {
  title: 'Frequently Asked Questions — Talexia',
  description: 'Everything you need to know about Talexia\'s editorial visual production for fine jewelry brands.'
};

export default function FAQPage() {
  return (
    <div className="talexia-wrapper">
      <Navbar />

      {/* ==================== PAGE HEADER ==================== */}
      <div className="page-header">
        <div className="rule-ornament center"></div>
        <div className="page-eyebrow">Frequently asked questions</div>
        <h1 className="page-title">Everything <em>you might want to know.</em></h1>
        <p className="page-lede">A working service should be understandable before you sign up. If the answer you need isn't here, book a consultation and we'll walk through it directly.</p>
      </div>

      {/* ==================== FAQ LAYOUT ==================== */}
      <div className="faq-layout">

        {/* CATEGORY NAV */}
        <aside className="cat-nav">
          <div className="cat-nav-title">Categories</div>
          <ul className="cat-nav-list">
            <li><a href="#about"><span className="cat-num">I</span> About the service</a></li>
            <li><a href="#scope"><span className="cat-num">II</span> Scope &amp; limits</a></li>
            <li><a href="#onboarding"><span className="cat-num">III</span> Onboarding &amp; catalog</a></li>
            <li><a href="#content"><span className="cat-num">IV</span> Content &amp; approvals</a></li>
            <li><a href="#publishing"><span className="cat-num">V</span> Publishing &amp; platforms</a></li>
            <li><a href="#billing"><span className="cat-num">VI</span> Billing &amp; cancellation</a></li>
            <li><a href="#atelier"><span className="cat-num">VII</span> Atelier</a></li>
          </ul>
        </aside>

        {/* FAQ CONTENT */}
        <div className="faq-content">

          {/* ========== I. ABOUT THE SERVICE ========== */}
          <section className="faq-category" id="about">
            <div className="cat-header">
              <div className="cat-header-eyebrow">I.</div>
              <h2 className="cat-header-title"><em>About</em> the service</h2>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What is Talexia?</h3>
              <div className="faq-a">
                <p>Talexia is an editorial visual production studio for fine jewelry brands. We produce luxury-standard feed content — visuals, captions, and scheduled publishing — as a fully managed monthly service.</p>
                <p>We are not a social media agency in the broad sense. We are a focused production studio: we make your feed look world-class, on a consistent rhythm, without your involvement in the day-to-day.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Who is Talexia for?</h3>
              <div className="faq-a">
                <p>Fine jewelry retailers, wholesalers, and custom houses who want editorial-grade visual content published to their feeds without managing the process themselves.</p>
                <p>Talexia is a fit if your brand aesthetic matters to you and you'd rather delegate its execution than compromise on quality. It is not a fit if you're looking for the cheapest posting service or if you need someone to manage community engagement, Stories, or paid advertising.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What makes Talexia different from other social media services?</h3>
              <div className="faq-a">
                <p>Three things.</p>
                <p><strong>Photography-first foundation.</strong> Talexia is run by a professional photographer with thirteen years of editorial, portrait, and fashion work. Every visual decision runs through a trained eye, not a template.</p>
                <p><strong>Italian editorial sensibility.</strong> Restraint over saturation. Composition over volume. The visual language of Milan applied to every piece we produce.</p>
                <p><strong>Truly hands-off after onboarding.</strong> Once your catalog is uploaded and your Brand Brief is locked, you don't send us anything. No monthly reminders, no assignments, no chase-ups.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do you work with brands outside of fine jewelry?</h3>
              <div className="faq-a">
                <p>Fine jewelry is our specialty and the category we're calibrated for. That said, we do consider brands in adjacent luxury categories on an inquiry basis — silverware, high-end accessories, watches, and select artisan luxury goods — when the aesthetic model aligns with what Talexia does well.</p>
                <p>If your product is beautifully made and its brand story is aesthetic-first, book a consultation. If it's a category that fundamentally depends on lifestyle photography, video content, or influencer-driven marketing, Talexia is not the right studio.</p>
              </div>
            </div>
          </section>

          {/* ========== II. SCOPE & LIMITS ========== */}
          <section className="faq-category" id="scope">
            <div className="cat-header">
              <div className="cat-header-eyebrow">II.</div>
              <h2 className="cat-header-title"><em>Scope</em> &amp; limits</h2>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do you post Stories or Reels?</h3>
              <div className="faq-a">
                <p>No — and the reason is structural, not stylistic.</p>
                <p>Instagram, Facebook, and their scheduling APIs do not permit third-party services to publish Stories or Reels on a brand's behalf. Meta's official Content Publishing API is limited to feed posts. Any service claiming to post Stories or Reels on your account is either doing so manually with direct login access (which we consider a security risk we won't take on our clients' behalf) or is misrepresenting what they deliver.</p>
                <p>Talexia produces scheduled feed content only, published through official platform APIs. Stories and Reels, being real-time and reactive by design, stay with your team — where the platforms intend them to live.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do you handle DMs, comments, or community engagement?</h3>
              <div className="faq-a">
                <p>No. Direct messages, comment replies, and community responses are excluded from Talexia services. These conversations belong with your team — they are how real customer relationships are built and preserved.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do you manage paid advertising?</h3>
              <div className="faq-a">
                <p>No. Paid social campaigns, ad management, boosted posts, and audience targeting are outside Talexia scope. We focus exclusively on organic editorial content.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do you produce video content?</h3>
              <div className="faq-a">
                <p>We produce micro-animations for select plans — subtle motion applied to still visuals, published as short-form video where appropriate. We do not produce filmed video, edit user-recorded video, or work with trending audio and sound editing.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Why is the scope so tightly defined?</h3>
              <div className="faq-a">
                <p>Because scope discipline is what makes the aesthetic sustainable. A service that promises everything — Stories, DMs, ads, feed, video — either charges premium rates for thin execution across all of them, or charges low rates and cuts corners on all of them.</p>
                <p>Talexia does one layer of your brand — the editorial feed — and holds it to a luxury standard. Fewer promises, kept completely.</p>
              </div>
            </div>
          </section>

          {/* ========== III. ONBOARDING & CATALOG ========== */}
          <section className="faq-category" id="onboarding">
            <div className="cat-header">
              <div className="cat-header-eyebrow">III.</div>
              <h2 className="cat-header-title"><em>Onboarding</em> &amp; catalog</h2>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do I have to send you images every month?</h3>
              <div className="faq-a">
                <p><strong>No.</strong> This is one of the most important differences between Talexia and traditional social media services.</p>
                <p>At onboarding, you upload your full product catalog to a dedicated Google Drive folder we share with you. From that point forward, Talexia produces from your catalog on our own schedule. You only need to notify us when you add new collections or want a specific piece featured.</p>
                <p>The catalog lives in Talexia. The production runs on our side. Your time stays with your clients and your bench.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What does the onboarding process look like?</h3>
              <div className="faq-a">
                <p>Four steps, typically completed within the first two weeks of signup.</p>
                <p><strong>One.</strong> You complete a Brand Brief that captures your voice, audience, aesthetic preferences, and product focus.</p>
                <p><strong>Two.</strong> You upload your product catalog to a dedicated Google Drive folder we share with you.</p>
                <p><strong>Three.</strong> We train our proprietary brand voice system against your Brief and produce sample captions and visual directions for your review.</p>
                <p><strong>Four.</strong> Your first content cycle begins. Content publishes within the first billing cycle.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What if I don't have my catalog organized?</h3>
              <div className="faq-a">
                <p>Upload it as-is. There's no organization requirement — just drop your images into the shared Google Drive folder in whatever state they're in. Talexia handles the categorization and reference structure on our side.</p>
                <p>The only thing that matters is that we can access your pieces. How they're arranged in your folder does not affect production.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do I need to provide stone or metal information?</h3>
              <div className="faq-a">
                <p>Only if your file naming or SKU convention doesn't already tell us. Most jewelry SKU systems encode the essentials directly in the code — for example, <code>RIKTMO2233</code> reads as <em>Ring · KT gold · Morganite</em>. If your SKUs work this way, no additional information is needed.</p>
                <p>If your file names or SKUs don't self-describe (or if a piece uses non-standard materials), include a simple text file in the folder listing the piece filename, metal, and stone details. A single line per piece is enough:</p>
                <ul>
                  <li>Filename → metal type, stone type, notable details</li>
                </ul>
                <p>Faithful representation depends on knowing what the piece actually is. Anything ambiguous will be flagged during onboarding.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What kind of product images can I submit?</h3>
              <div className="faq-a">
                <p>It depends on your plan.</p>
                <p><strong>Essentials</strong> works from your existing product photography — the images already on your website or in your catalog. For the best results at this tier, images should be:</p>
                <ul>
                  <li>Website or catalog product photography</li>
                  <li>White or neutral background preferred</li>
                  <li>Reasonable resolution — around 1,500 pixels on the longest side or higher</li>
                  <li>In focus, with accurate color and even lighting</li>
                  <li>The piece clearly visible without heavy props obscuring it</li>
                </ul>
                <p><strong>Signature</strong> includes full image preparation, so you can send us anything — including phone photos. We clean, correct, and prepare your source images before production. If you don't have professional product photography, Signature is the plan built for you.</p>
                <p>In both cases, the faithfulness of the final visual depends on the quality of the original. We prepare every image to the highest standard the source allows — but we never alter the piece itself. For phone-sourced images, results can vary with the quality of the original photo.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> How do I add new pieces to my catalog?</h3>
              <div className="faq-a">
                <p>Drop them into your Google Drive folder. New pieces added by the 25th of the month become available for the following content cycle.</p>
                <p>There is no formal process, no ticket system, no waiting queue. If a new piece matters to your brand, it goes into rotation.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What if my brand changes significantly?</h3>
              <div className="faq-a">
                <p>Submit an updated Brand Brief. Rebrands, new product lines, tone shifts, and audience pivots are all handled by updating the Brief. Changes apply to the following month's content cycle.</p>
              </div>
            </div>
          </section>

          {/* ========== IV. CONTENT & APPROVALS ========== */}
          <section className="faq-category" id="content">
            <div className="cat-header">
              <div className="cat-header-eyebrow">IV.</div>
              <h2 className="cat-header-title"><em>Content</em> &amp; approvals</h2>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Can I approve every post before it goes live?</h3>
              <div className="faq-a">
                <p>No. Talexia operates on a <strong>Brand Brief authorization model</strong>. Once your voice, aesthetic, and content preferences are locked in your Brief at onboarding, content is produced and published without per-post approval.</p>
                <p>This is what makes the fully managed rhythm sustainable at our rates. Services that offer per-post approval either charge substantially more or maintain the approval promise loosely. We prefer to be honest about the model.</p>
                <p>The Brand Brief is your standing authorization. Your review moment is at the Brief, not at every post.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What if a published post has an error?</h3>
              <div className="faq-a">
                <p>Verifiable factual errors — wrong metal tone, incorrect price, wrong product name, discontinued item — reported within 48 hours of publication are corrected in the next scheduled content cycle at no charge.</p>
                <p>Stylistic preferences (color palette, composition choice, caption tone) are not grounds for revision. Those are governed by the Brand Brief. If your preferences change, update the Brief.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> How do you write captions in my voice?</h3>
              <div className="faq-a">
                <p>From your Brand Brief. During onboarding, we capture your tone, audience, brand vocabulary, three sample captions you consider representative, and any recurring phrases or taglines. Our proprietary brand voice training then produces captions consistent with those inputs.</p>
                <p>The result: your captions read as your brand, not as a template applied across every jewelry account.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Can I see a monthly content calendar in advance?</h3>
              <div className="faq-a">
                <p>Signature and above receive a monthly content plan — an overview of the piece rotation and thematic angles for the coming month. This is a plan document, not an approval gate: it tells you what's coming, but does not require your signoff.</p>
                <p>Essentials does not include the monthly plan preview.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do you use AI to produce visuals?</h3>
              <div className="faq-a">
                <p>Yes — as one part of a broader production process, not as the process itself.</p>
                <p>Talexia combines AI-assisted visual enhancement with editorial art direction, manual product verification, and hand composition. Every visual is checked for product accuracy before scheduling — correct metal tone, accurate stone color, faithful design detail. When the AI output is close but not right, we override it. When it can't hold the geometry of a complex piece, we composite by hand.</p>
                <p>The technology is a tool. The craft is knowing how to use it, when to override it, and when to set it aside entirely. Your outcome is the same either way: editorial-standard visuals that faithfully represent your pieces, held to a luxury aesthetic.</p>
                <p>We describe our work as <em>luxury-enhanced visuals</em> because that's what our clients receive — enhanced, verified, editorial-standard content. The methodology is our craft; the result is what matters.</p>
              </div>
            </div>
          </section>

          {/* ========== V. PUBLISHING & PLATFORMS ========== */}
          <section className="faq-category" id="publishing">
            <div className="cat-header">
              <div className="cat-header-eyebrow">V.</div>
              <h2 className="cat-header-title"><em>Publishing</em> &amp; platforms</h2>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Which platforms do you post to?</h3>
              <div className="faq-a">
                <p>Instagram, Facebook, and LinkedIn. Essentials covers two of these; Signature covers all three.</p>
                <p>We do not post to TikTok, Pinterest, X, YouTube, or any other platform at this time. Adding platforms outside this list is not available even as a custom request.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> How do you access my social accounts?</h3>
              <div className="faq-a">
                <p>Through secure third-party integration. You connect your accounts directly at onboarding via OAuth authorization. Talexia never sees, holds, or has access to your login credentials.</p>
                <p>Platform tokens do expire periodically — Meta and LinkedIn both cycle authorization tokens every 60–90 days for security. When a token expires, you will receive a notification to sign in again and reauthorize the integration. This is a standard platform requirement and takes about thirty seconds.</p>
                <p>You can disconnect access at any time from your platform's settings, without our involvement.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> When are posts published?</h3>
              <div className="faq-a">
                <p>Posts are scheduled across your monthly cycle for optimal cadence based on platform best practices for fine jewelry. Specific timing is managed on our side using a monthly bulk schedule generated for each brand, which indicates the weekly days and times posts will publish.</p>
                <p>You'll see finished posts appear on your feed at appropriate intervals throughout the month.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Can I request specific posting times or dates?</h3>
              <div className="faq-a">
                <p>Preferred posting windows can be indicated in your Brand Brief at onboarding — for example, if your audience is most active on specific days, or if you prefer to avoid certain hours. Those preferences feed into your monthly schedule.</p>
                <p>For time-critical individual posts — a specific product launch, a store event, an announcement — inform us in advance and we will align the relevant post accordingly.</p>
                <p>Day-by-day scheduling micro-management outside of these two channels is not available.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What happens if a post fails to publish?</h3>
              <div className="faq-a">
                <p>Publishing failures — platform outages, expired credentials, disconnected integrations — are monitored on our side. Failed posts are rescheduled and published as soon as the platform issue is resolved. You will be notified if a failure requires action on your end, typically to reauthorize the integration.</p>
              </div>
            </div>
          </section>

          {/* ========== VI. BILLING & CANCELLATION ========== */}
          <section className="faq-category" id="billing">
            <div className="cat-header">
              <div className="cat-header-eyebrow">VI.</div>
              <h2 className="cat-header-title"><em>Billing</em> &amp; cancellation</h2>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> How much does Talexia cost?</h3>
              <div className="faq-a">
                <p><strong>Essentials — $397 per month</strong>, or $4,288 per year (a 10% saving). 12 feed posts, published to 2 platforms.</p>
                <p><strong>Signature — $597 per month</strong>, or $6,448 per year (a 10% saving). 24 feed posts, published to 3 platforms, with monthly content planning and seasonal editorial planning.</p>
                <p><strong>Atelier — by consultation.</strong> Bespoke visual work for signature pieces and custom collections.</p>
                <p>All plans include full visual production, captions, and scheduled publishing.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Is there an onboarding fee?</h3>
              <div className="faq-a">
                <p>Signature includes a one-time onboarding fee of $97, applied to your first invoice. This covers the Brand Brief development, catalog setup, and brand voice training work.</p>
                <p>Essentials does not have an onboarding fee.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Is the first month really free?</h3>
              <div className="faq-a">
                <p>Yes. Apply code <strong>1MFREE</strong> at checkout and your first month is complimentary — your card is not charged for it. We ask for a card to begin so your service continues seamlessly into month two, which bills at your plan's normal rate.</p>
                <p>If you cancel before your free month ends, your card is never charged at all. The free month is limited to one per business.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Can I cancel anytime?</h3>
              <div className="faq-a">
                <p>Yes. You can cancel anytime directly from the billing section of your account. Cancellation takes effect at the end of your current billing cycle — no notice period required.</p>
                <p>No long-term contracts. No termination penalties. If Talexia is not working for you, you leave without friction. Annual plans are paid in full and non-refundable; cancelling stops the plan from renewing at the end of the paid term.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Do you offer refunds?</h3>
              <div className="faq-a">
                <p>No refunds are issued for partial or full months already delivered. Cancellation prevents future billing but does not reverse completed cycles. Annual plans are paid in full and are non-refundable, except within the 14-day cooling-off window on a first annual purchase described in our Service Policy.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Can I upgrade or downgrade my plan?</h3>
              <div className="faq-a">
                <p>Yes. Plan changes apply to the following billing cycle. Upgrades unlock additional deliverables and platforms starting with your next month; downgrades reduce them.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What payment methods do you accept?</h3>
              <div className="faq-a">
                <p>All major credit cards, processed through Stripe. Billing is monthly on the anniversary of your first successful charge.</p>
              </div>
            </div>
          </section>

          {/* ========== VII. ATELIER ========== */}
          <section className="faq-category" id="atelier">
            <div className="cat-header">
              <div className="cat-header-eyebrow">VII.</div>
              <h2 className="cat-header-title"><em>Atelier</em></h2>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> What is Atelier?</h3>
              <div className="faq-a">
                <p>Atelier is Talexia's bespoke commission service for flagship pieces and signature collections. It includes styled still-life, micro-animation on still and worn pieces, and hand-illustrated concept renderings — composed individually for each piece rather than produced from templates.</p>
                <p>Atelier is priced by consultation and requires a minimum three-month engagement.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Who is Atelier for?</h3>
              <div className="faq-a">
                <p>Custom jewelry houses, high-jewelry brands, and retailers with signature collections that deserve individual visual treatment. If your pieces are one-of-a-kind or if your brand positioning is bespoke, Atelier is the appropriate service.</p>
                <p>Retailers with primarily catalog-driven product lines are better served by Signature.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> How is Atelier priced?</h3>
              <div className="faq-a">
                <p>By consultation. Pricing scales with collection complexity, deliverable mix, and engagement length. Because every Atelier engagement is composed individually, a fixed price does not apply.</p>
                <p>Inquire directly for a scoped estimate.</p>
              </div>
            </div>

            <div className="faq-item">
              <h3 className="faq-q"><span className="faq-q-mark">Q.</span> Can I combine Atelier with a managed plan?</h3>
              <div className="faq-a">
                <p>Yes. Some brands maintain a Signature managed presence for their broader catalog while commissioning Atelier work for signature pieces, seasonal campaigns, or new collection launches. The two services complement each other; combined engagements are structured during consultation.</p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* ==================== CLOSING CTA ==================== */}
      <section className="closing-cta" id="consultation">
        <div className="rule-ornament center"></div>
        <h2 className="closing-title">Still <em>have questions?</em></h2>
        <p className="closing-sub">Book a fifteen-minute consultation. We'll walk through anything the FAQ didn't answer — no pressure, no obligation.</p>
        <a href="mailto:office@talexia.us" className="btn btn-dark">Book a consultation</a>
      </section>

      {/* ==================== FOOTER ==================== */}
      <Footer />
    </div>
  );
}
