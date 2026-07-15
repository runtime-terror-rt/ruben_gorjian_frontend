import React from 'react';
import './privacy.css';

export const metadata = {
  title: 'Privacy Policy — Talexia',
  description: "Talexia's Privacy Policy. Version 1.0, effective July 2026."
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="rule-ornament-center"></div>
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Service Policy <em>&</em> Terms of Service</h1>
        <div className="page-meta">Version 1.0 <span>·</span> Effective July 10, 2026</div>
      </div>

      {/* PREAMBLE */}
    <div className="preamble">
  <p>This document defines the working agreement between Talexia and its subscribers. It is written to be understandable — not to conceal terms behind legalese. If any clause is unclear, contact us before subscribing.</p>
  <p>By subscribing to a Talexia plan, you agree to the version of this document that was live on the day of your subscription. Talexia stores the exact text of the version you accepted, along with the date and time of acceptance, in its Legal Records system.</p>
</div>

      {/* DOCUMENT LAYOUT */}
      <div className="doc-layout">

        {/* SECTION NAV */}
       <aside className="sec-nav">
    <div className="sec-nav-title">Contents</div>
    <ul className="sec-nav-list">
      <li><a href="#s1"><span className="sec-num">I</span> Definitions</a></li>
      <li><a href="#s2"><span className="sec-num">II</span> The service</a></li>
      <li><a href="#s3"><span className="sec-num">III</span> Scope &amp; exclusions</a></li>
      <li><a href="#s4"><span className="sec-num">IV</span> Onboarding</a></li>
      <li><a href="#s5"><span className="sec-num">V</span> Production &amp; publishing</a></li>
      <li><a href="#s6"><span className="sec-num">VI</span> Content authorization</a></li>
      <li><a href="#s7"><span className="sec-num">VII</span> Corrections</a></li>
      <li><a href="#s8"><span className="sec-num">VIII</span> Client responsibilities</a></li>
      <li><a href="#s9"><span className="sec-num">IX</span> Billing &amp; cancellation</a></li>
      <li><a href="#s10"><span className="sec-num">X</span> Intellectual property</a></li>
      <li><a href="#s11"><span className="sec-num">XI</span> Liability &amp; disputes</a></li>
      <li><a href="#s12"><span className="sec-num">XII</span> Changes to this policy</a></li>
    </ul>
  </aside>


        {/* DOC CONTENT */}
        <div className="doc-content">

          {/* SECTION I */}
        <section className="doc-section" id="s1">
      <div className="sec-header">
        <div className="sec-num-large">I.</div>
        <h2 className="sec-title"><em>Definitions</em></h2>
      </div>

      <div className="clause">
        <div className="clause-num">1.1</div>
        <div className="clause-title">Terms used throughout this document</div>
        <div className="clause-body">
          <p><strong>Talexia</strong> refers to Talexia, an editorial visual production studio for fine jewelry brands, operating at talexia.us.</p>
          <p><strong>Client</strong> or <strong>you</strong> refers to the individual or business entity subscribing to a Talexia plan.</p>
          <p><strong>Plan</strong> refers to Essentials, Signature, Atelier, or any subsequently offered subscription tier.</p>
          <p><strong>Brand Brief</strong> refers to the onboarding document in which the Client provides brand voice, audience, aesthetic preferences, and product information used as the reference for all content production.</p>
          <p><strong>Catalog</strong> refers to the collection of product images the Client uploads to the shared Talexia Google Drive folder at onboarding, from which visual content is produced.</p>
          <p><strong>Content Cycle</strong> refers to a single calendar month of production, publishing, and delivery under an active subscription.</p>
          <p><strong>Feed Content</strong> refers to scheduled posts published to Instagram, Facebook, or LinkedIn feeds via official platform APIs. It excludes Stories, Reels, direct messages, comment responses, and paid advertising.</p>
        </div>
      </div>
    </section>

         {/* ==================== SECTION II ==================== */}
    <section className="doc-section" id="s2">
      <div className="sec-header">
        <div className="sec-num-large">II.</div>
        <h2 className="sec-title"><em>The service</em></h2>
      </div>

      <div className="clause">
        <div className="clause-num">2.1</div>
        <div className="clause-title">What Talexia provides</div>
        <div className="clause-body">
          <p>Talexia is a fully managed editorial visual production service. Under an active subscription, Talexia produces luxury-enhanced feed content, writes captions in the Client's brand voice, and publishes content on a scheduled monthly rhythm to the Client's connected social media accounts.</p>
          <p>The service is designed for delegation. Once onboarding is complete, no further recurring input is required from the Client for production to proceed.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">2.2</div>
        <div className="clause-title">Plans and deliverables</div>
        <div className="clause-body">
          <p>Current plan structure and deliverable volumes are as follows:</p>
          <ul>
            <li><strong>Essentials — $397 per month, or $4,288 per year.</strong> Twelve luxury-enhanced visuals, professional captions, published to two platforms, monthly content calendar. The annual rate reflects a 10% discount versus twelve monthly payments.</li>
            <li><strong>Signature — $597 per month, or $6,448 per year.</strong> Twenty-four luxury-enhanced visuals, professional captions and scheduling, published to three platforms, monthly content plan, seasonal editorial planning. The annual rate reflects a 10% discount versus twelve monthly payments.</li>
            <li><strong>Atelier — pricing by consultation.</strong> Bespoke visual work for signature pieces and custom collections, structured individually per engagement, minimum three-month term.</li>
          </ul>
          <p>Signature includes a one-time onboarding fee of $97 applied to the first invoice. Essentials does not include an onboarding fee. Plan pricing and deliverable volumes are subject to change on future subscriptions; existing subscriptions retain their original terms until cancellation or upgrade.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">2.3</div>
        <div className="clause-title">Categories served</div>
        <div className="clause-body">
          <p>Talexia specializes in fine jewelry. Brands in adjacent luxury categories — including silverware, high-end accessories, watches, and select artisan luxury goods — may be considered on inquiry basis where the aesthetic model aligns with Talexia's production standards. Non-luxury categories, video-first brands, and lifestyle-photography-dependent products are outside Talexia's scope.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION III ==================== */}
    <section className="doc-section" id="s3">
      <div className="sec-header">
        <div className="sec-num-large">III.</div>
        <h2 className="sec-title"><em>Scope</em> &amp; exclusions</h2>
      </div>

      <div className="clause">
        <div className="clause-num">3.1</div>
        <div className="clause-title">Feed content only</div>
        <div className="clause-body">
          <p>Talexia produces and publishes feed content only. This is a structural limitation of the platform APIs Talexia uses, not a stylistic choice.</p>
          <p>Meta's Content Publishing API and LinkedIn's Marketing API do not permit third-party services to publish Stories, Reels, or ephemeral content on a Client's behalf. Talexia does not accept direct login credentials from Clients and does not publish content through methods outside official platform APIs.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">3.2</div>
        <div className="clause-title">Explicit exclusions</div>
        <div className="clause-body">
          <p>The following are excluded from all Talexia plans:</p>
          <ul>
            <li>Instagram Stories, Facebook Stories, and any ephemeral content</li>
            <li>Instagram Reels, filmed video, video editing, and sound editing</li>
            <li>Direct message handling, comment responses, and community engagement</li>
            <li>Paid social advertising, ad management, boosted posts, and audience targeting</li>
            <li>Publishing to platforms other than Instagram, Facebook, and LinkedIn</li>
            <li>Real-time or reactive posting outside the scheduled monthly rhythm</li>
            <li>Content approval workflows on a per-post basis (see Section VI)</li>
          </ul>
          <p>Exclusions apply regardless of plan tier. Custom scope expansions are not available through Essentials or Signature. Bespoke deliverable mixes are available under Atelier by consultation.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">3.3</div>
        <div className="clause-title">Micro-animation</div>
        <div className="clause-body">
          <p>Selected plans include micro-animation — subtle motion applied to still visuals, published as short-form video via the official platform APIs. Micro-animation does not include filmed video, user-recorded footage, trending audio integration, or sound design. The specific inclusion of micro-animation is defined per plan.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION IV ==================== */}

    <section className="doc-section" id="s4">
      <div className="sec-header">
        <div className="sec-num-large">IV.</div>
        <h2 className="sec-title"><em>Onboarding</em></h2>
      </div>

      <div className="clause">
        <div className="clause-num">4.1</div>
        <div className="clause-title">Brand Brief submission</div>
        <div className="clause-body">
          <p>Following successful payment, the Client is directed to complete a Brand Brief. The Brand Brief captures brand name, voice, audience, aesthetic preferences, product focus, and sample captions. All required fields must be completed before content production begins.</p>
          <p>The accuracy and completeness of the Brand Brief is the foundation of all subsequent content. Talexia is not responsible for content that reflects information the Client omitted, misstated, or failed to provide in the Brief.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">4.2</div>
        <div className="clause-title">Catalog upload</div>
        <div className="clause-body">
          <p>The Client uploads the product catalog to a dedicated Google Drive folder shared with Talexia. The catalog serves as the standing reference for content production throughout the subscription.</p>
          <p>The Client may upload the catalog in any organizational structure. The Client may add new pieces to the folder at any time; pieces added by the 25th of a month become available for production in the following Content Cycle.</p>
          <p>Image requirements depend on the Client's plan. <strong>Essentials</strong> produces from the Client's existing product photography — typically website or catalog images. For best results at this tier, images should be reasonable-resolution studio-style photography (white or neutral background preferred, in focus, with accurate color and even lighting). Lifestyle shots, phone photography, and low-resolution images may result in production output below Talexia's standard, in which case affected pieces may be excluded from rotation without refund adjustment.</p>
          <p><strong>Signature</strong> includes full image preparation. The Client may submit source images in any form, including phone photography; Talexia will clean, correct, and prepare the source images before production. Image preparation is a production step applied at Talexia's discretion and is not guaranteed to produce a particular result: the faithfulness of the final visual depends on the quality of the original image, and Talexia prepares each image to the highest standard the source allows. In all cases, Talexia represents the piece as it is and does not alter the piece's design, materials, or configuration.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">4.3</div>
        <div className="clause-title">Product identification</div>
        <div className="clause-body">
          <p>Where the Client's SKU or filename convention encodes material and stone information, no additional identification is required. Where filenames or SKUs do not self-describe, the Client provides a simple text file listing filename, metal type, and stone details for each piece.</p>
          <p>Faithful visual representation depends on accurate material information. Ambiguities identified during onboarding will be flagged for the Client to resolve before production begins.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">4.4</div>
        <div className="clause-title">Voice lock and first cycle</div>
        <div className="clause-body">
          <p>Talexia trains its proprietary brand voice system against the completed Brand Brief and produces sample captions and visual directions for the Client's review. Upon review, the first Content Cycle begins. Content publishes within the first monthly billing cycle following successful onboarding.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION V ==================== */}
    <section className="doc-section" id="s5">
      <div className="sec-header">
        <div className="sec-num-large">V.</div>
        <h2 className="sec-title"><em>Production</em> &amp; publishing</h2>
      </div>

      <div className="clause">
        <div className="clause-num">5.1</div>
        <div className="clause-title">Production methodology</div>
        <div className="clause-body">
          <p>Talexia produces visual content using a proprietary production process that combines AI-assisted visual enhancement with editorial art direction, manual product verification, and hand composition where required. Every visual is manually verified for product accuracy — correct metal tone, stone color, and design detail — before publication.</p>
          <p>The Client acknowledges that visual content is composed through Talexia's proprietary methodology and that the specific tools, techniques, or ratios of automated-to-manual work are Talexia's confidential production process and not subject to disclosure.</p>
          <p>The Client's expectation is faithful representation of the piece, held to editorial standard. This is the deliverable Talexia commits to, regardless of production method.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">5.2</div>
        <div className="clause-title">Captions and hashtags</div>
        <div className="clause-body">
          <p>Captions and hashtags are produced from the Client's Brand Brief using Talexia's proprietary brand voice training. Captions reflect the tone, audience, and vocabulary declared in the Brief. Hashtag selection is optimized for fine jewelry industry conventions.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">5.3</div>
        <div className="clause-title">Publishing rhythm</div>
        <div className="clause-body">
          <p>Content is scheduled across each Content Cycle for optimal cadence based on platform best practices for fine jewelry. Talexia manages posting timing on the Client's behalf using a monthly bulk schedule generated per brand.</p>
          <p>The Client may indicate preferred posting windows in the Brand Brief. Time-critical individual posts — product launches, store events, announcements — may be requested in advance and will be scheduled accordingly. Day-by-day scheduling requests outside these two channels are not accepted.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">5.4</div>
        <div className="clause-title">Platform access</div>
        <div className="clause-body">
          <p>To publish on the Client's behalf, Talexia requires OAuth authorization to the Client's connected accounts. The Client authorizes access directly at onboarding via secure third-party integration. Talexia never sees, holds, or has access to the Client's login credentials.</p>
          <p>Platform authorization tokens expire periodically per platform policy (typically every sixty to ninety days). When a token expires, the Client will receive a notification to reauthorize the integration. Publication interruptions caused by expired authorization are the Client's responsibility to resolve; Talexia is not liable for missed posts during periods of unauthorized access.</p>
          <p>The Client may revoke authorization at any time from the platform's account settings without notice to Talexia.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">5.5</div>
        <div className="clause-title">Publishing failures</div>
        <div className="clause-body">
          <p>Publishing failures caused by platform outages, API changes, or technical issues on Talexia's side will be rescheduled and republished as soon as the issue is resolved. Talexia is not liable for revenue, engagement, or business impact resulting from platform-side outages or from failures caused by expired or revoked Client authorization.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION VI ==================== */}
    
    <section className="doc-section" id="s6">
      <div className="sec-header">
        <div className="sec-num-large">VI.</div>
        <h2 className="sec-title"><em>Content authorization</em></h2>
      </div>

      <div className="clause">
        <div className="clause-num">6.1</div>
        <div className="clause-title">Brand Brief authorization model</div>
        <div className="clause-body">
          <p>Talexia operates on a standing authorization model. By submitting the Brand Brief at onboarding, the Client authorizes Talexia to produce visual content, captions, hashtags, and scheduled posts on the Client's behalf, using the information provided in the Brief as the sole reference, for the duration of the subscription.</p>
          <p>Talexia does not require per-post approval, does not provide content previews prior to publication, and does not conduct approval workflows. This standing authorization is what enables Talexia's fully managed rhythm at published pricing.</p>
          <p>The Client's substantive review moment is at Brand Brief submission and revision, not at individual post approval.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">6.2</div>
        <div className="clause-title">Brand Brief updates</div>
        <div className="clause-body">
          <p>The Client may submit an updated Brand Brief at any time to reflect brand changes: new product lines, rebrands, tone shifts, audience pivots, or updated preferences. Brand Brief updates apply to the Content Cycle following submission. Retroactive application to already-produced or already-published content is not available.</p>
          <p>Talexia is not responsible for content produced under the previously-current Brand Brief if the Client's actual brand has diverged and the Brief was not updated to reflect the change.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION VII ==================== */}
    <section className="doc-section" id="s7">
      <div className="sec-header">
        <div className="sec-num-large">VII.</div>
        <h2 className="sec-title"><em>Corrections</em></h2>
      </div>

      <div className="clause">
        <div className="clause-num">7.1</div>
        <div className="clause-title">Factual errors</div>
        <div className="clause-body">
          <p>Verifiable factual errors in published content — incorrect metal tone, incorrect stone color, wrong product name, incorrect price, discontinued item, or misrepresented material — reported within forty-eight (48) hours of publication will be corrected in the next scheduled Content Cycle at no additional charge.</p>
          <p>Corrections are applied in the next scheduled cycle to preserve production rhythm. Immediate takedown, mid-cycle re-publication, or same-week correction is not available under standard plans.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">7.2</div>
        <div className="clause-title">What is not eligible for correction</div>
        <div className="clause-body">
          <p>The following are not grounds for revision, regeneration, or refund:</p>
          <ul>
            <li>Stylistic preferences regarding composition, color palette, or aesthetic choice</li>
            <li>Caption tone, phrasing, or wording preferences</li>
            <li>Hashtag selection preferences</li>
            <li>Posting time preferences outside those established in the Brand Brief</li>
            <li>Retroactive brand changes not reflected in an updated Brand Brief</li>
            <li>Content quality issues traceable to source material quality below Section 4.2 minimum standards</li>
            <li>Reports of errors submitted more than forty-eight (48) hours after publication</li>
          </ul>
          <p>Stylistic preferences are governed by the Brand Brief. Preference changes are handled through Brief updates per Section 6.2.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">7.3</div>
        <div className="clause-title">Repeated errors</div>
        <div className="clause-body">
          <p>Where the same factual error appears in multiple pieces of published content — for example, a consistently miscoded piece — the error is corrected across all affected posts in the next Content Cycle following the report. The Client's original Brand Brief and catalog information are the reference standard; where the Brief or catalog contained the error, Section 4.1 and 8.1 apply.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION VIII ==================== */}
    
    <section className="doc-section" id="s8">
      <div className="sec-header">
        <div className="sec-num-large">VIII.</div>
        <h2 className="sec-title"><em>Client</em> responsibilities</h2>
      </div>

      <div className="clause">
        <div className="clause-num">8.1</div>
        <div className="clause-title">Accuracy of provided information</div>
        <div className="clause-body">
          <p>The Client is responsible for the accuracy, completeness, and currency of the Brand Brief and catalog. Talexia produces content faithfully from the information provided. Consequences of inaccurate, incomplete, or outdated Client information — including misrepresentation of products, incorrect pricing on posts, or misalignment with actual brand identity — are the Client's responsibility.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">8.2</div>
        <div className="clause-title">Platform account maintenance</div>
        <div className="clause-body">
          <p>The Client is responsible for maintaining active social media accounts, resolving platform-level suspensions or violations, and reauthorizing expired OAuth tokens promptly upon notification. Missed publications resulting from Client-side account issues do not entitle the Client to refund or additional content in subsequent cycles.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">8.3</div>
        <div className="clause-title">Legal ownership of submitted material</div>
        <div className="clause-body">
          <p>The Client warrants that all product images and Brand Brief content uploaded to Talexia are owned by the Client or licensed to the Client with permission to use in social media publication. The Client indemnifies Talexia against any third-party claims arising from Client-submitted material.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">8.4</div>
        <div className="clause-title">Regulatory compliance</div>
        <div className="clause-body">
          <p>The Client is responsible for ensuring that published content complies with applicable regulations for the Client's jurisdiction — including but not limited to advertising standards, price disclosure requirements, and product certification claims. Talexia produces content from the information provided; the Client is responsible for verifying compliance before content publishes and for updating the Brand Brief where regulatory obligations require specific disclosures.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION IX ==================== */}
    <section className="doc-section" id="s9">
      <div className="sec-header">
        <div className="sec-num-large">IX.</div>
        <h2 className="sec-title"><em>Billing</em> &amp; cancellation</h2>
      </div>

      <div className="clause">
        <div className="clause-num">9.1</div>
        <div className="clause-title">Billing terms</div>
        <div className="clause-body">
          <p>Plans are billed either monthly or annually through Stripe, according to the billing cycle the Client selects at checkout. Monthly plans are charged on the anniversary of the Client's first successful charge. Annual plans are charged in full at the time of purchase and once per year thereafter on the purchase anniversary. The one-time Signature onboarding fee of $97 is applied to the first invoice regardless of billing cycle.</p>
          <p>Payment is due in advance of the applicable subscription period. Failed payments will result in production pause. Publishing may continue on a best-effort basis for content already produced in the current cycle; new production will not begin until payment is successfully processed.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">9.2</div>
        <div className="clause-title">Plan changes</div>
        <div className="clause-body">
          <p>The Client may upgrade or downgrade between Essentials and Signature at any time. Plan changes apply to the following Content Cycle. Downgrades do not entitle the Client to prorated refund for the current cycle. Upgrades take effect immediately with the additional deliverables and platforms available starting with the next billing period.</p>
          <p>Movement between Managed Plans (Essentials or Signature) and Atelier is treated as a new engagement structured by consultation.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">9.3</div>
        <div className="clause-title">Cancellation</div>
        <div className="clause-body">
          <p><strong>Monthly plans.</strong> The Client may cancel a monthly subscription at any time directly from the billing section of their Talexia account. Cancellation takes effect at the end of the current monthly billing cycle. Deliverables scheduled for the current cycle will be completed and published; no future cycles will be produced or billed.</p>
          <p><strong>Annual plans.</strong> The Client may cancel an annual subscription at any time from the billing section of their Talexia account to stop it from renewing. Cancellation takes effect at the end of the paid annual term; the Client retains access to production and publishing for the remainder of the term already paid. An annual term, once begun, runs to its scheduled end and is not shortened, prorated, or refunded by cancellation, except during the cooling-off window described in Section 9.4.</p>
          <p>No long-term contracts apply to Essentials or Signature beyond the billing cycle selected at checkout. Atelier engagements are subject to the specific engagement terms agreed at consultation, which may include multi-month commitments.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">9.4</div>
        <div className="clause-title">Refunds</div>
        <div className="clause-body">
          <p><strong>Monthly plans.</strong> No refunds are issued for partial or full Content Cycles already delivered or in progress. Cancellation prevents future billing but does not reverse completed cycles. Where a monthly subscription is canceled mid-cycle, the current cycle's content will still be produced and published; refund of that cycle's payment is not available.</p>
          <p><strong>Annual plans.</strong> Annual subscriptions are paid in full at purchase and are <strong>non-refundable</strong>. This reflects the discounted annual rate, which is offered in exchange for the Client's commitment to a full year of service. Cancellation of an annual plan stops future renewal but does not entitle the Client to a refund of the current term, in whole or in part.</p>
          <p><strong>Cooling-off window.</strong> As a limited exception, a Client who purchases an annual plan may request a full refund within fourteen (14) days of the initial annual purchase, provided fewer than three (3) deliverables have been produced or published. Requests must be made in writing to <a href="mailto:office@talexia.us">office@talexia.us</a>. After the fourteen-day window closes, the annual term is fully committed and non-refundable as described above. The cooling-off window applies only to a Client's first annual purchase, not to annual renewals.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">9.5</div>
        <div className="clause-title">Suspension for cause</div>
        <div className="clause-body">
          <p>Talexia reserves the right to suspend or terminate a subscription for cause without refund in cases of: repeated abusive communication with Talexia staff, submission of material infringing third-party rights, use of Talexia's service to publish content that violates platform terms of service, or non-payment beyond fifteen (15) days past due.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">9.6</div>
        <div className="clause-title">Annual renewal &amp; advance notice</div>
        <div className="clause-body">
          <p>Annual subscriptions renew automatically at the end of each annual term at the then-current annual rate, unless the Client cancels before the renewal date. Renewal charges are processed on the term anniversary through the Client's payment method on file.</p>
          <p>Talexia will send the Client a renewal reminder by email at least thirty (30) days before each annual renewal charge. The reminder will state the renewal date and the amount to be charged, and will explain how to cancel before renewal. Cancellation submitted before the renewal date prevents the upcoming annual charge; see Section 9.3 for how cancellation takes effect.</p>
          <p>The renewal reminder is provided as a courtesy. The Client's authoritative control over renewal is the auto-renew setting in the billing section of their Talexia account, which the Client may turn off at any time to prevent renewal. Talexia is not responsible for reminder emails that are not delivered, delayed, or filtered for reasons outside its reasonable control, including spam filtering, an outdated email address, or mail-server failure. Regardless of whether any individual reminder email is received, it remains the Client's responsibility to keep a current email address and payment method on file and to manage the auto-renew setting in their account. A missed or undelivered reminder email does not, on its own, entitle the Client to a refund of an annual renewal charge.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">9.7</div>
        <div className="clause-title">Service continuity &amp; wind-down</div>
        <div className="clause-body">
          <p>If Talexia decides to cease operations, it will do so through a managed wind-down designed so that every Client is served through the end of the term they have paid for. No Client's paid service is cut short by Talexia's closure, and because no paid cycle goes undelivered, no refund arises from this process.</p>
          <p>On the day Talexia decides to wind down, it will identify the latest service expiry among all active subscriptions and set that date as the closure date — the final day on which service is provided. From that decision forward, Talexia will not onboard new Clients and will not begin new subscription terms beyond the closure date.</p>
          <p>Because subscriptions are billed one month in advance, the final billing date across all Clients falls one month before the closure date: that final charge pays for the last month of service, which runs through the closure date. No charge will be issued for any period extending beyond the closure date. Monthly Clients continue to be billed month-to-month up to that final billing date, and may stop earlier at any time from the billing section of their account.</p>
          <p>Any Client whose paid term ends before the closure date may choose — at their option — to extend service up to the closure date at a prorated rate. This extension is voluntary; a Client who declines is simply served through the end of their existing paid term and is not renewed.</p>
          <p>Talexia will notify affected Clients by email as soon as the wind-down decision is made, and in any event at least thirty (30) days before any individual Client's service ends, so that Clients have time to arrange alternative services. Throughout the wind-down, Clients may continue to cancel their subscription and turn off auto-renew from the billing section of their account as normal.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">9.8</div>
        <div className="clause-title">Promotional first-month offer</div>
        <div className="clause-body">
          <p>Talexia may offer a complimentary first month through a promotional code (for example, "1MFREE") applied at checkout. Where such an offer applies, the following terms govern it.</p>
          <p>A valid payment method is required to begin, even though the first month is complimentary. The promotional code discounts the first month's charge to zero; the subscription then continues automatically into the second month, which is billed at the plan's normal rate (monthly or annual, as selected). The one-time Signature onboarding fee, where applicable, is not waived by the promotional code.</p>
          <p>The Client may cancel at any time before the complimentary first month ends, directly from the billing section of their account. A Client who cancels before the first month ends is not charged. If the Client does not cancel before the first month ends, billing proceeds automatically as described above.</p>
          <p>The complimentary first month is limited to one per business. Eligibility is determined by Talexia and may be limited by business, by email domain, or by a stated expiry date. Talexia may modify or withdraw any promotional offer at any time; withdrawal does not affect a promotional month already validly commenced. Once a paid period begins following a promotional first month, standard billing, cancellation, and refund terms in this Section apply.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION X ==================== */}

    <section className="doc-section" id="s10">
      <div className="sec-header">
        <div className="sec-num-large">X.</div>
        <h2 className="sec-title"><em>Intellectual</em> property</h2>
      </div>

      <div className="clause">
        <div className="clause-num">10.1</div>
        <div className="clause-title">Ownership of produced content</div>
        <div className="clause-body">
          <p>Visual content, captions, and hashtags produced by Talexia during an active subscription are licensed to the Client for full commercial use on the Client's social media channels and marketing materials throughout the duration of the subscription and thereafter, provided the subscription was terminated in good standing.</p>
          <p>The license is worldwide, royalty-free, and perpetual for content produced during the paid subscription period. Content produced during a subscription later terminated for cause under Section 9.5 remains subject to Talexia's discretion regarding continued Client use.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">10.2</div>
        <div className="clause-title">Talexia proprietary systems</div>
        <div className="clause-body">
          <p>Talexia's brand voice training system, production methodology, editorial framework, and internal tooling are Talexia's exclusive intellectual property and are not transferred to the Client under any subscription. Sample outputs, training data, and Brief-derived stylistic parameters remain Talexia's confidential production infrastructure.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">10.3</div>
        <div className="clause-title">Case study rights</div>
        <div className="clause-body">
          <p>Unless the Client provides written objection at onboarding, Talexia reserves the right to reference the Client's engagement — including work produced — as a case study in Talexia's marketing materials, portfolio, and public communications. Written objection may be submitted at any time to remove Client references from future Talexia marketing use.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION XI ==================== */}        
    <section className="doc-section" id="s11">
      <div className="sec-header">
        <div className="sec-num-large">XI.</div>
        <h2 className="sec-title"><em>Liability</em> &amp; disputes</h2>
      </div>

      <div className="clause">
        <div className="clause-num">11.1</div>
        <div className="clause-title">Limitation of liability</div>
        <div className="clause-body">
          <p>Talexia's liability under any circumstance is limited to the total amount paid by the Client to Talexia in the six (6) months preceding the event giving rise to the claim. Talexia is not liable for indirect, consequential, punitive, or incidental damages, including but not limited to lost revenue, lost engagement, lost customers, or reputational harm.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">11.2</div>
        <div className="clause-title">Business outcomes disclaimer</div>
        <div className="clause-body">
          <p>Talexia produces visual content and manages scheduled publishing. Talexia does not warrant, promise, or guarantee any specific business outcome — including but not limited to sales growth, follower growth, engagement rate, reach, brand awareness, or return on investment. Business outcomes depend on factors beyond Talexia's control, including the Client's own sales operations, product quality, pricing, competitive environment, and market conditions.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">11.3</div>
        <div className="clause-title">Dispute resolution</div>
        <div className="clause-body">
          <p>Disputes arising under this agreement will first be addressed through good-faith direct communication between Talexia and the Client. Where direct resolution is not achieved within thirty (30) days, disputes will be resolved through binding arbitration under the rules of the American Arbitration Association, conducted remotely, with the seat of arbitration in the state of Talexia's operating jurisdiction.</p>
          <p>Neither party may bring class action proceedings against the other under this agreement.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">11.4</div>
        <div className="clause-title">Governing law</div>
        <div className="clause-body">
          <p>This agreement is governed by the laws of the state in which Talexia is registered as a business entity, without regard to conflict of law principles.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">11.5</div>
        <div className="clause-title">Content variability &amp; verification</div>
        <div className="clause-body">
          <p>Talexia produces visual content and captions to a consistent editorial standard. The Client acknowledges that produced content may nonetheless vary in character and quality depending on factors including the quality and clarity of the source images provided, the completeness and accuracy of the Brand Brief, and the specific pieces submitted. Where source material is limited — for example, low-resolution or phone-sourced images prepared under a plan that offers image preparation — the fidelity and finish of the final content depend on what the original material allows. Talexia prepares and produces every asset to the highest standard the source permits and represents each piece as it is, without altering its design, materials, or configuration.</p>
          <p>Because Talexia operates on a Brand Brief authorization model and publishes without individual post approval, the Client remains responsible for the accuracy of the information provided in the Brand Brief and catalog. Verifiable factual errors in published content are corrected under Section VII. Stylistic preferences and normal variation within Talexia's editorial standard are not grounds for revision.</p>
        </div>
      </div>
    </section>

    {/* ==================== SECTION XII ==================== */}
    <section className="doc-section" id="s12">
      <div className="sec-header">
        <div className="sec-num-large">XII.</div>
        <h2 className="sec-title">Changes <em>to this policy</em></h2>
      </div>

      <div className="clause">
        <div className="clause-num">12.1</div>
        <div className="clause-title">Versioning</div>
        <div className="clause-body">
          <p>Talexia maintains a document versioning system. Every material change to this Service Policy results in a new version number and effective date. The version active at the time of a Client's subscription acceptance is stored verbatim in Talexia's Legal Records system alongside the Client's acceptance timestamp, IP address, and acceptance context.</p>
          <p>The Client's obligations are governed by the version of this document accepted at subscription, not by the current live version, unless the Client explicitly re-accepts a subsequent version.</p>
        </div>
      </div>

      <div className="clause">
        <div className="clause-num">12.2</div>
        <div className="clause-title">Notice of changes</div>
        <div className="clause-body">
          <p>Where changes to this Service Policy materially affect existing Clients' obligations, Talexia will provide written notice via email at least thirty (30) days in advance of the change taking effect. The Client's continued subscription following the notice period constitutes acceptance of the updated version.</p>
          <p>Where the Client does not accept a change and the change is material, the Client may cancel the subscription under Section 9.3 before the change takes effect without penalty.</p>
        </div>
      </div>
    </section>


        </div>
      </div>

      {/* VERSION FOOTER */}
      <div className="version-footer">
        <h4>Document reference</h4>
        <p>Talexia Privacy Policy — Version 1.0 — Effective July 10, 2026</p>
        <p style={{ marginTop: '8px' }}>For questions about any clause in this document, contact <a href="mailto:office@talexia.us">office@talexia.us</a> before subscribing.</p>
      </div>
    </>
  );
}
