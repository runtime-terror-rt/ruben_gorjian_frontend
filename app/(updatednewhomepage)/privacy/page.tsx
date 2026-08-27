import React from 'react';
import './privacy.css';

export const metadata = {
  title: 'Privacy Policy — Talexia',
  description: "Talexia's Privacy Policy. Version 1.1, effective July 2026.",
  alternates: { canonical: 'https://talexia.us/privacy' }
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="rule-ornament center"></div>
        <div className="page-eyebrow">Legal</div>
        <h1 className="page-title">Privacy <em>Policy</em></h1>
        <div className="page-meta">Version 1.1 <span>·</span> Effective July 10, 2026</div>
      </div>

      {/* PREAMBLE */}
      <div className="preamble">
        <p>This document explains what information Talexia collects, how it is used, and what rights you have over it. It is written to be understandable — not to conceal terms behind legalese.</p>
        <p>This Privacy Policy works alongside Talexia's <a href="/terms" style={{ color: '#14110c', textDecoration: 'none', borderBottom: '1px solid #b08d3e' }}>Service Policy &amp; Terms of Service</a>. Where the two documents overlap, the Service Policy governs the commercial relationship and this document governs the data relationship.</p>
      </div>

      {/* DOCUMENT LAYOUT */}
      <div className="doc-layout">

        {/* SECTION NAV */}
        <aside className="sec-nav">
          <div className="sec-nav-title">Contents</div>
          <ul className="sec-nav-list">
            <li><a href="#s1"><span className="sec-num">I</span> Who we are</a></li>
            <li><a href="#s2"><span className="sec-num">II</span> What we collect</a></li>
            <li><a href="#s3"><span className="sec-num">III</span> How we use it</a></li>
            <li><a href="#s4"><span className="sec-num">IV</span> Where it lives</a></li>
            <li><a href="#s5"><span className="sec-num">V</span> Third parties</a></li>
            <li><a href="#s6"><span className="sec-num">VI</span> Production tools &amp; AI</a></li>
            <li><a href="#s7"><span className="sec-num">VII</span> How long we keep it</a></li>
            <li><a href="#s8"><span className="sec-num">VIII</span> Security</a></li>
            <li><a href="#s9"><span className="sec-num">IX</span> Your rights</a></li>
            <li><a href="#s10"><span className="sec-num">X</span> California residents</a></li>
            <li><a href="#s11"><span className="sec-num">XI</span> EU &amp; UK residents</a></li>
            <li><a href="#s12"><span className="sec-num">XII</span> Children</a></li>
            <li><a href="#s13"><span className="sec-num">XIII</span> Changes &amp; contact</a></li>
          </ul>
        </aside>

        {/* DOC CONTENT */}
        <div className="doc-content">

          {/* ==================== SECTION I ==================== */}
          <section className="doc-section" id="s1">
            <div className="sec-header">
              <div className="sec-num-large">I.</div>
              <h2 className="sec-title">Who <em>we are</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">1.1</div>
              <div className="clause-title">Data controller</div>
              <div className="clause-body">
                <p>Talexia, operating at <a href="/">talexia.us</a>, is the data controller for information collected through its website, its subscription service, and its production operations. In this document, &quot;Talexia,&quot; &quot;we,&quot; and &quot;our&quot; refer to Talexia; &quot;you&quot; and &quot;your&quot; refer to any person whose information Talexia processes.</p>
                <p>For questions about this policy or the information Talexia holds about you, contact <a href="mailto:office@talexia.us">office@talexia.us</a>.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION II ==================== */}
          <section className="doc-section" id="s2">
            <div className="sec-header">
              <div className="sec-num-large">II.</div>
              <h2 className="sec-title">What <em>we collect</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">2.1</div>
              <div className="clause-title">Categories of information</div>
              <div className="clause-body">
                <p>Talexia collects only what is required to operate the service. In summary:</p>

                <div className="data-table">
                  <div className="data-row header">
                    <div className="data-cell">Category</div>
                    <div className="data-cell">What it includes</div>
                    <div className="data-cell">Why we collect it</div>
                  </div>
                  <div className="data-row">
                    <div className="data-cell"><strong>Account &amp; billing</strong></div>
                    <div className="data-cell">Name, email, business name, billing address, payment method (via Stripe)</div>
                    <div className="data-cell">To manage your subscription and process payments</div>
                  </div>
                  <div className="data-row">
                    <div className="data-cell"><strong>Brand information</strong></div>
                    <div className="data-cell">Brand voice, audience, aesthetic preferences, taglines, sample captions, industry details</div>
                    <div className="data-cell">To produce content faithful to your brand</div>
                  </div>
                  <div className="data-row">
                    <div className="data-cell"><strong>Product catalog</strong></div>
                    <div className="data-cell">Product images, SKUs, material and stone information you provide</div>
                    <div className="data-cell">To produce visual content of your pieces</div>
                  </div>
                  <div className="data-row">
                    <div className="data-cell"><strong>Platform authorization</strong></div>
                    <div className="data-cell">OAuth tokens for connected social media accounts (Instagram, Facebook, LinkedIn)</div>
                    <div className="data-cell">To publish scheduled content on your behalf</div>
                  </div>
                  <div className="data-row">
                    <div className="data-cell"><strong>Legal records</strong></div>
                    <div className="data-cell">Acceptance timestamps, IP address, browser info, document version accepted</div>
                    <div className="data-cell">To maintain records of your agreement to our terms</div>
                  </div>
                  <div className="data-row">
                    <div className="data-cell"><strong>Support communications</strong></div>
                    <div className="data-cell">Emails, consultation call notes, correction requests</div>
                    <div className="data-cell">To respond to your inquiries and improve service</div>
                  </div>
                  <div className="data-row">
                    <div className="data-cell"><strong>Website usage</strong></div>
                    <div className="data-cell">Page visits, referrer, device type, general location (city-level)</div>
                    <div className="data-cell">To understand how the website is used and improve it</div>
                  </div>
                </div>

                <p>Talexia does not collect sensitive personal categories — health information, precise location tracking, genetic data, or biometric data — as none are relevant to the service.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">2.2</div>
              <div className="clause-title">What we do not collect</div>
              <div className="clause-body">
                <p>Talexia does not collect, store, or have access to:</p>
                <ul>
                  <li>Your social media login credentials (only OAuth tokens — never passwords)</li>
                  <li>Your website admin credentials (Talexia never requires these)</li>
                  <li>Full credit card numbers (handled by Stripe; Talexia sees only the last four digits and card type)</li>
                  <li>Your customers&apos; data (Talexia does not manage DMs, comments, or customer relationships)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ==================== SECTION III ==================== */}
          <section className="doc-section" id="s3">
            <div className="sec-header">
              <div className="sec-num-large">III.</div>
              <h2 className="sec-title">How <em>we use it</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">3.1</div>
              <div className="clause-title">Purposes of processing</div>
              <div className="clause-body">
                <p>Talexia uses the information collected only for the following purposes:</p>
                <ul>
                  <li><strong>Service delivery</strong> — producing visual content, writing captions, publishing to your connected platforms</li>
                  <li><strong>Billing</strong> — processing subscription payments and issuing invoices</li>
                  <li><strong>Communication</strong> — responding to inquiries, sending service updates, notifying you of authorization renewals</li>
                  <li><strong>Legal compliance</strong> — maintaining records required for consumer protection, tax, and platform terms compliance</li>
                  <li><strong>Website improvement</strong> — understanding traffic patterns and improving user experience</li>
                  <li><strong>Case study reference</strong> — displaying work produced for your brand as portfolio material, subject to Section 10.3 of the Service Policy</li>
                </ul>
                <p>Talexia does not use your information for automated decision-making, profiling, targeted advertising, or any purpose beyond those listed above.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">3.2</div>
              <div className="clause-title">We do not sell your information</div>
              <div className="clause-body">
                <p>Talexia does not sell personal information to third parties, and does not &quot;share&quot; personal information for cross-context behavioral advertising as those terms are defined under California and comparable state laws.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION IV ==================== */}
          <section className="doc-section" id="s4">
            <div className="sec-header">
              <div className="sec-num-large">IV.</div>
              <h2 className="sec-title">Where <em>it lives</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">4.1</div>
              <div className="clause-title">Storage locations</div>
              <div className="clause-body">
                <p>Talexia stores information across a small number of service infrastructure providers:</p>
                <ul>
                  <li><strong>Product catalogs</strong> are stored in Google Drive folders under Talexia&apos;s Google Workspace account, accessible only to Talexia staff.</li>
                  <li><strong>Account, billing, and Brand Brief data</strong> are stored in Talexia&apos;s operational database and encrypted email storage.</li>
                  <li><strong>Payment information</strong> is stored by Stripe — Talexia never sees or stores full card details.</li>
                  <li><strong>Legal Records</strong> — acceptance timestamps, IP addresses, and document versions — are stored in an append-only database table designed for permanence and audit integrity.</li>
                  <li><strong>Support communications</strong> are stored in email and, where applicable, in Google Drive documents linked to the Client&apos;s file.</li>
                </ul>
                <p>All Talexia storage is US-based. Where information is transferred internationally (for example, where a Client is EU-based), that transfer is governed by Section XI of this policy.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION V ==================== */}
          <section className="doc-section" id="s5">
            <div className="sec-header">
              <div className="sec-num-large">V.</div>
              <h2 className="sec-title">Third <em>parties</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">5.1</div>
              <div className="clause-title">Service providers we use</div>
              <div className="clause-body">
                <p>Talexia relies on the following third-party service providers to operate. Each is bound by its own privacy policy and data processing standards, which we&apos;ve linked below for reference:</p>
                <ul>
                  <li><strong>Stripe</strong> — payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>)</li>
                  <li><strong>Google Workspace</strong> — Google Drive for catalog storage, Gmail for support communications (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>)</li>
                  <li><strong>Meta Platforms</strong> — Instagram and Facebook Content Publishing API for scheduled posting (<a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer">facebook.com/privacy/policy</a>)</li>
                  <li><strong>LinkedIn</strong> — Marketing API for scheduled posting (<a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">linkedin.com/legal/privacy-policy</a>)</li>
                  <li><strong>UploadPost or equivalent scheduling API</strong> — technical layer between Talexia and social platforms for scheduled publishing</li>
                </ul>
                <p>Each provider has access only to the specific information required to perform its function. Talexia does not share information with any third party beyond those listed here, except as required by law.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">5.2</div>
              <div className="clause-title">Legal disclosures</div>
              <div className="clause-body">
                <p>Talexia will disclose information where required by law — including in response to a valid subpoena, court order, or lawful government request — or where necessary to enforce this policy, the Service Policy, or Talexia&apos;s rights. Where legally permitted, Talexia will notify affected Clients before making such a disclosure.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">5.3</div>
              <div className="clause-title">Business transfers</div>
              <div className="clause-body">
                <p>In the event Talexia is acquired, merged, or reorganized, Client information may be transferred to the successor entity. Any successor will be bound by the terms of this Privacy Policy or a policy providing equivalent protection.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION VI ==================== */}
          <section className="doc-section" id="s6">
            <div className="sec-header">
              <div className="sec-num-large">VI.</div>
              <h2 className="sec-title">Production <em>tools &amp; AI</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">6.1</div>
              <div className="clause-title">Visual production processing</div>
              <div className="clause-body">
                <p>Talexia&apos;s visual production process combines proprietary internal tools with third-party visual enhancement and animation services. During production, product images from your catalog — including, for plans that offer image preparation, source images you submit that require cleanup or correction before production — are processed by these services to prepare and produce your monthly visual content.</p>
                <p>Talexia takes the following commitments regarding this processing:</p>
                <ul>
                  <li>Talexia does not authorize training use of Client data on third-party AI systems where an opt-out is available.</li>
                  <li>Talexia does not upload Client information beyond what is required for production of the specific visual asset being produced.</li>
                  <li>Talexia does not use Client-provided images to produce content for other Talexia Clients.</li>
                  <li>Talexia&apos;s production tool selection is subject to periodic review; where a tool&apos;s data practices change materially, Talexia will either replace the tool or update this policy.</li>
                </ul>
                <p>Where required by law or by material change in tool practices, Talexia will notify Clients of specific tools in use. In all cases, the deliverable — editorial-standard visual content faithful to your pieces — is produced under Talexia&apos;s proprietary methodology.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">6.2</div>
              <div className="clause-title">Brand voice training</div>
              <div className="clause-body">
                <p>Captions and brand voice are produced using Talexia&apos;s proprietary training system, which uses your Brand Brief as reference input for your specific brand only. Your Brand Brief is not used to train Talexia&apos;s system for other Clients. Your captions and brand voice remain distinct to your subscription and are not reused across accounts.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION VII ==================== */}
          <section className="doc-section" id="s7">
            <div className="sec-header">
              <div className="sec-num-large">VII.</div>
              <h2 className="sec-title">How <em>long we keep it</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">7.1</div>
              <div className="clause-title">Retention periods</div>
              <div className="clause-body">
                <p>Talexia retains information only as long as necessary for the purposes it was collected:</p>
                <ul>
                  <li><strong>Account and billing information</strong> — for the duration of your subscription and for seven (7) years thereafter, as required for tax and accounting compliance.</li>
                  <li><strong>Brand Brief and catalog</strong> — for the duration of your subscription. Upon cancellation, retained for ninety (90) days to support potential reactivation, then deleted or returned upon Client request.</li>
                  <li><strong>Platform authorization tokens</strong> — until the token expires, is revoked by the platform, or is revoked by the Client. Talexia does not retain expired tokens.</li>
                  <li><strong>Legal Records</strong> — permanently, as required for the enforceability of the Service Policy and defense against future disputes.</li>
                  <li><strong>Support communications</strong> — three (3) years after last contact, then deleted unless retention is required by ongoing legal matters.</li>
                  <li><strong>Website usage data</strong> — twenty-four (24) months, then aggregated or deleted.</li>
                </ul>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">7.2</div>
              <div className="clause-title">Deletion on request</div>
              <div className="clause-body">
                <p>Except for Legal Records, which Talexia retains as noted above, you may request deletion of your information at any time under Section IX. Some information may be retained beyond your request where required by law or by legitimate business necessity — for example, unpaid invoices or unresolved disputes.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION VIII ==================== */}
          <section className="doc-section" id="s8">
            <div className="sec-header">
              <div className="sec-num-large">VIII.</div>
              <h2 className="sec-title"><em>Security</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">8.1</div>
              <div className="clause-title">How we protect information</div>
              <div className="clause-body">
                <p>Talexia protects information through a combination of technical and operational measures:</p>
                <ul>
                  <li>Encrypted storage across all infrastructure providers (Stripe, Google Workspace, database)</li>
                  <li>Encrypted transmission via HTTPS across all site communication</li>
                  <li>OAuth-based platform authorization — no plain-text credentials stored anywhere</li>
                  <li>Access restricted to Talexia staff on a need-to-know basis</li>
                  <li>Multi-factor authentication on all infrastructure accounts</li>
                  <li>Periodic review of third-party provider security practices</li>
                </ul>
                <p>No system is fully immune to breach. In the event of a data breach affecting your information, Talexia will notify you within seventy-two (72) hours of confirmed detection, describing the nature of the breach, the information affected, and the steps taken in response — consistent with applicable US state and international law.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION IX ==================== */}
          <section className="doc-section" id="s9">
            <div className="sec-header">
              <div className="sec-num-large">IX.</div>
              <h2 className="sec-title">Your <em>rights</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">9.1</div>
              <div className="clause-title">Rights available to all Clients</div>
              <div className="clause-body">
                <p>Regardless of jurisdiction, you have the following rights with respect to information Talexia holds about you:</p>
                <ul>
                  <li><strong>Right to know</strong> — request a summary of what information Talexia holds about you</li>
                  <li><strong>Right to access</strong> — request a copy of your information in a portable format</li>
                  <li><strong>Right to correct</strong> — request correction of inaccurate information</li>
                  <li><strong>Right to delete</strong> — request deletion of your information, subject to legal retention requirements</li>
                  <li><strong>Right to withdraw consent</strong> — for processing based on your consent, withdraw that consent at any time</li>
                  <li><strong>Right to opt out of case study use</strong> — under Section 10.3 of the Service Policy</li>
                </ul>
                <p>To exercise any of these rights, contact <a href="mailto:office@talexia.us">office@talexia.us</a>. Talexia will respond within thirty (30) days. Talexia may require verification of your identity before acting on a request.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">9.2</div>
              <div className="clause-title">No discrimination</div>
              <div className="clause-body">
                <p>Talexia will not discriminate against you for exercising any of these rights. Doing so will not affect your subscription pricing, service quality, or eligibility for future service.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION X ==================== */}
          <section className="doc-section" id="s10">
            <div className="sec-header">
              <div className="sec-num-large">X.</div>
              <h2 className="sec-title">California <em>residents</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">10.1</div>
              <div className="clause-title">Your rights under the CCPA and CPRA</div>
              <div className="clause-body">
                <p>If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA), in addition to those listed in Section IX:</p>
                <ul>
                  <li><strong>Right to know categories</strong> — the categories of personal information Talexia collects, the sources, and the purposes of collection (disclosed in Section II)</li>
                  <li><strong>Right to correct inaccurate information</strong></li>
                  <li><strong>Right to delete personal information</strong>, subject to legal exemptions</li>
                  <li><strong>Right to opt out of &quot;sale&quot; or &quot;sharing&quot;</strong> — Talexia does not sell or share personal information as those terms are defined, but you retain the right regardless</li>
                  <li><strong>Right to limit use of sensitive personal information</strong> — Talexia does not collect sensitive personal information in the CPRA-defined categories</li>
                </ul>
                <p>To exercise these rights, contact <a href="mailto:office@talexia.us">office@talexia.us</a>. You may also designate an authorized agent to submit requests on your behalf.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">10.2</div>
              <div className="clause-title">Categories collected in the past 12 months</div>
              <div className="clause-body">
                <p>Consistent with Section II of this policy, Talexia has collected the following categories of personal information in the past twelve months from active or prospective Clients: identifiers (name, email), commercial information (subscription and payment), professional information (brand and business details), Internet activity (website usage), and inferences drawn from these categories (aesthetic preferences derived from Brand Brief responses). Talexia has not sold or shared any of these categories.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION XI ==================== */}
          <section className="doc-section" id="s11">
            <div className="sec-header">
              <div className="sec-num-large">XI.</div>
              <h2 className="sec-title">EU &amp; UK <em>residents</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">11.1</div>
              <div className="clause-title">Lawful basis for processing</div>
              <div className="clause-body">
                <p>For Clients located in the European Union, the United Kingdom, or the European Economic Area, Talexia processes personal information under the following lawful bases established by the General Data Protection Regulation (GDPR) and the UK GDPR:</p>
                <ul>
                  <li><strong>Contract performance</strong> — for account, billing, Brand Brief, catalog, and publishing operations</li>
                  <li><strong>Legal obligation</strong> — for Legal Records, tax compliance, and regulatory reporting</li>
                  <li><strong>Legitimate interests</strong> — for website usage analysis, service improvement, and case study reference, balanced against your rights</li>
                  <li><strong>Consent</strong> — where specifically requested (for example, for marketing communications)</li>
                </ul>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">11.2</div>
              <div className="clause-title">International data transfers</div>
              <div className="clause-body">
                <p>Talexia is based in the United States. If you are located outside the United States, your information will be transferred to and processed in the United States. Where required by GDPR, UK GDPR, or comparable law, such transfers are governed by Standard Contractual Clauses or equivalent safeguards.</p>
                <p>By subscribing to Talexia from a jurisdiction outside the United States, you acknowledge and consent to this transfer.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">11.3</div>
              <div className="clause-title">Rights under GDPR and UK GDPR</div>
              <div className="clause-body">
                <p>In addition to the rights listed in Section IX, EU and UK residents have the following rights:</p>
                <ul>
                  <li>Right to restrict processing</li>
                  <li>Right to object to processing based on legitimate interests</li>
                  <li>Right to data portability in a machine-readable format</li>
                  <li>Right to lodge a complaint with your national data protection authority</li>
                </ul>
                <p>To exercise these rights, contact <a href="mailto:office@talexia.us">office@talexia.us</a>. Talexia will respond within thirty (30) days.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION XII ==================== */}
          <section className="doc-section" id="s12">
            <div className="sec-header">
              <div className="sec-num-large">XII.</div>
              <h2 className="sec-title"><em>Children</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">12.1</div>
              <div className="clause-title">Service not directed to children</div>
              <div className="clause-body">
                <p>Talexia&apos;s service is intended for business use by adult professionals. Talexia does not knowingly collect information from children under the age of thirteen (13). If Talexia becomes aware that information has been collected from a child under thirteen, Talexia will delete that information without undue delay.</p>
                <p>If you believe a child has provided information to Talexia, contact <a href="mailto:office@talexia.us">office@talexia.us</a>.</p>
              </div>
            </div>
          </section>

          {/* ==================== SECTION XIII ==================== */}
          <section className="doc-section" id="s13">
            <div className="sec-header">
              <div className="sec-num-large">XIII.</div>
              <h2 className="sec-title">Changes <em>&amp; contact</em></h2>
            </div>
            <div className="clause">
              <div className="clause-num">13.1</div>
              <div className="clause-title">Updates to this policy</div>
              <div className="clause-body">
                <p>Talexia may update this Privacy Policy from time to time to reflect changes in operations, tools, or legal requirements. Every update results in a new version number and effective date. The version active at the time of your subscription is stored in Talexia&apos;s Legal Records system.</p>
                <p>Where a change materially affects your rights or the way your information is used, Talexia will notify you via email at least thirty (30) days before the change takes effect. Continued use of the service after the notice period constitutes acceptance of the updated policy.</p>
              </div>
            </div>
            <div className="clause">
              <div className="clause-num">13.2</div>
              <div className="clause-title">Contact us</div>
              <div className="clause-body">
                <p>For any question about this Privacy Policy or the information Talexia holds about you, contact:</p>
                <p><strong>Email:</strong> <a href="mailto:office@talexia.us">office@talexia.us</a></p>
                <p>Talexia will acknowledge receipt within seven (7) days and provide a substantive response within thirty (30) days.</p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* VERSION FOOTER */}
      <div className="version-footer">
        <h4>Document reference</h4>
        <p>Talexia Privacy Policy — Version 1.1 — Effective July 10, 2026</p>
        <p style={{ marginTop: '8px' }}>Read alongside our <a href="/terms" style={{ color: '#b08d3e', textDecoration: 'none' }}>Service Policy &amp; Terms of Service</a>.</p>
      </div>
    </>
  );
}
