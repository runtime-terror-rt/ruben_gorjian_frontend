'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PlanPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div>
      {/* ==================== PAGE HEADER ==================== */}
      <div className="page-header">
        <div className="rule-ornament" />
        <div className="page-eyebrow">Plans</div>
        <h1 className="page-title">
          Two plans, <em>one standard.</em>
        </h1>
        <p className="page-lede">
          Editorial-grade feed content, produced and published on a consistent
          rhythm — priced so the standard is the same whether your brand is one
          store or a wholesale operation.
        </p>
      </div>

      {/* ==================== SCOPE STATEMENT ==================== */}
      <section className="scope-statement" style={{ padding: "40px 20px" }}>
        <p className="scope-statement-text">
          Every plan below covers{" "}
          <strong>
            editorial visual production, professional captions, and scheduled
            publishing to your connected platforms
          </strong>
          . Stories, Reels, DMs, comment engagement, and paid advertising are
          excluded from all plans — a structural limit of the platform APIs Talexia
          uses.
        </p>
        <div className="scope-chips">
          <div className="scope-chip">Feed content</div>
          <div className="scope-chip">Scheduled publishing</div>
          <div className="scope-chip">Fully managed</div>
          <div className="scope-chip">Cancel anytime from your account</div>
        </div>
      </section>

      {/* ==================== MANAGED PLANS ==================== */}
      <section className="managed-plans" id="managed">
        <div className="container">
          <div className="plans-header">
            <div className="rule-ornament" />
            <div className="section-eyebrow">Managed plans</div>
            <h2 className="section-title">
              Choose the <em>volume</em> that fits your brand.
            </h2>
            <p className="section-lede" style={{ margin: "20px auto 0" }}>
              Both plans deliver identical production standards. The difference is
              content volume and platform coverage.
            </p>
          </div>

          <div
            style={{
              maxWidth: 640,
              margin: "0 auto 40px",
              textAlign: "center",
              background: "#f6efdd",
              border: "1px solid #e8dcbe",
              borderRadius: 6,
              padding: "18px 26px"
            }}
          >
            <div
              style={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontSize: 11,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "#8a6d28",
                fontWeight: 600,
                marginBottom: 7
              }}
            >
              Your first month, complimentary
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "15.5px",
                lineHeight: "1.55",
                color: "#14110c"
              }}
            >
              Start with a full month free using code{" "}
              <strong style={{ color: "#8a6d28" }}>1MFREE</strong> at checkout.
              Enter your card to begin; cancel before the month ends and you’re
              never charged.
              <span
                style={{
                  display: "block",
                  marginTop: 7,
                  fontSize: 12,
                  color: "#8a857a"
                }}
              >
                Limited to one free month per business.
              </span>
            </div>
          </div>

          <div className="billing-toggle-wrap">
            <div className="billing-toggle">
              <span
                className={`billing-label ${!isAnnual ? 'active' : ''}`}
                id="labelMonthly"
                data-cycle="monthly"
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </span>
              <button
                type="button"
                className={`billing-switch ${isAnnual ? 'annual' : ''}`}
                id="billingSwitch"
                role="switch"
                aria-checked={isAnnual}
                aria-label="Switch between monthly and annual billing"
                onClick={() => setIsAnnual(!isAnnual)}
              />
              <span
                className={`billing-label ${isAnnual ? 'active' : ''}`}
                id="labelAnnual"
                data-cycle="annual"
                onClick={() => setIsAnnual(true)}
              >
                Annual
              </span>
            </div>
            <div className="billing-annual-note" id="billingNote">
              <strong>Save 10%</strong> when you pay for a year up front.
            </div>
          </div>

          <div className={`plans-cards ${isAnnual ? 'plans-annual' : ''}`} id="plansCards">
            {/* ESSENTIALS */}
            <div className="plan-card">
              <div className="plan-name">Essentials</div>
              <div className="plan-tagline">
                A polished, consistent presence for a single-store brand.
              </div>
              <div className="plan-price">
                <span className="cur">$</span>
                <span className="amt" data-monthly={397} data-annual="4,288">
                  {isAnnual ? '4,288' : '397'}
                </span>
                <span className="per per-monthly">/ month</span>
                <span className="per per-annual">/ year</span>
              </div>
              <div className="plan-annual-saving">
                <strong>Save $476</strong> a year — that’s $357/mo, more than a
                month free.
              </div>
              <div className="plan-volume">12 feed posts monthly · 2 platforms</div>
              <div className="plan-divider" />
              <p className="plan-desc">
                Twelve editorial-grade visuals produced monthly, captioned in your
                brand voice, and published to two of your connected platforms on a
                weekly rhythm. Brand voice locked from day one.
              </p>
              <div className="plan-section-label">What's included</div>
              <ul className="plan-feat">
                <li>12 luxury-enhanced visuals produced monthly</li>
                <li>Produced from your existing website or catalog photography</li>
                <li>Professional captions written in your brand voice</li>
                <li>Hashtag research per fine jewelry conventions</li>
                <li>
                  Publishing to 2 platforms (choose: Instagram, Facebook, or
                  LinkedIn)
                </li>
                <li>Monthly content calendar</li>
                <li>48-hour factual error correction window</li>
                <li>
                  Brand Brief authorization model — no per-post approvals required
                </li>
              </ul>
              <div className="plan-fee plan-monthly-fee">
                <strong>No onboarding fee.</strong> First month is $397. Billed
                monthly thereafter.
              </div>
              <p
                style={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: 12,
                  lineHeight: "1.5",
                  color: "#8a857a",
                  margin: "12px 0 0"
                }}
              >
                Best for brands with existing product photography. Working mainly
                from phone photos? Signature includes full image preparation.
              </p>
              <div className="plan-cta">
                <Link
                  href={`/signup?plan=essentials&billing=${isAnnual ? 'annual' : 'monthly'}`}
                  className="btn btn-outline"
                  data-cta="essentials"
                  data-label-monthly="Subscribe to Essentials"
                  data-label-annual="Subscribe annually — $4,288/yr"
                >
                  {isAnnual ? 'Subscribe annually — $4,288/yr' : 'Subscribe to Essentials'}
                </Link>
                <div className="plan-annual-terms">
                  Annual plans are paid in full today and are{" "}
                  <strong>non-refundable</strong>, except as described in our
                  Service Policy. Auto-renews yearly; we’ll remind you 30 days
                  before renewal.
                </div>
              </div>
            </div>

            {/* SIGNATURE */}
            <div className="plan-card feature">
              <div className="plan-badge">Most popular</div>
              <div className="plan-name">Signature</div>
              <div className="plan-tagline">
                A weekly rhythm for brands ready to show up consistently.
              </div>
              <div className="plan-price">
                <span className="cur">$</span>
                <span className="amt" data-monthly={597} data-annual="6,448">
                  {isAnnual ? '6,448' : '597'}
                </span>
                <span className="per per-monthly">/ month</span>
                <span className="per per-annual">/ year</span>
              </div>
              <div className="plan-annual-saving">
                <strong>Save $716</strong> a year — that’s $537/mo, more than a
                month free.
              </div>
              <div className="plan-volume">24 feed posts monthly · 3 platforms</div>
              <div className="plan-divider" />
              <p className="plan-desc">
                Twenty-four editorial visuals monthly, published across all three
                platforms, planned around the fine jewelry editorial calendar and
                completely off your plate.
              </p>
              <div className="plan-section-label">What's included</div>
              <ul className="plan-feat">
                <li>24 luxury-enhanced visuals produced monthly</li>
                <li>
                  Full image preparation — send us anything, even phone photos
                </li>
                <li>Professional captions &amp; hashtag research</li>
                <li>Publishing to 3 platforms (Instagram, Facebook, LinkedIn)</li>
                <li>Seasonal editorial planning (engagement season, holidays)</li>
                <li>48-hour factual error correction window</li>
                <li>
                  Brand Brief authorization model — no per-post approvals required
                </li>
              </ul>
              <div className="plan-fee plan-monthly-fee">
                <strong>No onboarding fee.</strong> First month is $597. Billed
                monthly thereafter.
              </div>
              <div className="plan-cta">
                <Link
                  href={`/signup?plan=signature&billing=${isAnnual ? 'annual' : 'monthly'}`}
                  className="btn btn-dark"
                  data-cta="signature"
                  data-label-monthly="Subscribe to Signature"
                  data-label-annual="Subscribe annually — $6,448/yr"
                >
                  {isAnnual ? 'Subscribe annually — $6,448/yr' : 'Subscribe to Signature'}
                </Link>
                <div className="plan-annual-terms">
                  Annual plans are paid in full today and are{" "}
                  <strong>non-refundable</strong>, except as described in our
                  Service Policy. Auto-renews yearly; we’ll remind you 30 days
                  before renewal.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== COMPARISON TABLE ==================== */}
      <section className="comparison">
        <div className="container">
          <div className="comparison-header">
            <div className="rule-ornament" />
            <div className="section-eyebrow">Side by side</div>
            <h2 className="section-title">
              The <em>difference</em> at a glance.
            </h2>
          </div>
          <div className="comparison-table">
            <div className="comp-row header">
              <div className="comp-cell" />
              <div className="comp-cell center">Essentials</div>
              <div className="comp-cell center feature-bg feature-col">
                Signature
              </div>
            </div>
            <div className="comp-row">
              <div className="comp-cell label">Monthly feed posts</div>
              <div className="comp-cell center">12</div>
              <div className="comp-cell center feature-bg">24</div>
            </div>
            <div className="comp-row">
              <div className="comp-cell label">Platforms covered</div>
              <div className="comp-cell center">2 of 3</div>
              <div className="comp-cell center feature-bg">3 of 3</div>
            </div>
            <div className="comp-row">
              <div className="comp-cell label">
                Professional captions &amp; hashtags
              </div>
              <div className="comp-cell center">
                <span className="comp-check">✓</span>
              </div>
              <div className="comp-cell center feature-bg">
                <span className="comp-check">✓</span>
              </div>
            </div>
            <div className="comp-row">
              <div className="comp-cell label">Monthly content calendar</div>
              <div className="comp-cell center">
                <span className="comp-check">✓</span>
              </div>
              <div className="comp-cell center feature-bg">
                <span className="comp-check">✓</span>
              </div>
            </div>
            <div className="comp-row">
              <div className="comp-cell label">Seasonal editorial planning</div>
              <div className="comp-cell center">
                <span className="comp-x">—</span>
              </div>
              <div className="comp-cell center feature-bg">
                <span className="comp-check">✓</span>
              </div>
            </div>
            <div className="comp-row">
              <div className="comp-cell label">
                Image preparation (phone photos accepted)
              </div>
              <div className="comp-cell center">
                <span className="comp-x">—</span>
              </div>
              <div className="comp-cell center feature-bg">
                <span className="comp-check">✓</span>
              </div>
            </div>
            <div className="comp-row">
              <div className="comp-cell label">Monthly price</div>
              <div className="comp-cell center">
                <strong>$397</strong>
              </div>
              <div className="comp-cell center feature-bg">
                <strong>$597</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ATELIER ==================== */}
      <section className="atelier" id="atelier">
        <div className="atelier-wrap">
          <div className="atelier-image">
            <img
              src="data:image/jpeg;base64,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"
              alt="Editorial diamond pavé articulated link bracelet, produced under Talexia Atelier"
            />
            <div className="atelier-caption">Case study &middot; Fabio Collection</div>
          </div>
          <div className="atelier-content">
            <div className="atelier-eyebrow">By commission</div>
            <h2 className="atelier-title">Atelier &mdash; <em>for the pieces that deserve to be seen as art.</em></h2>
            <p className="atelier-desc">
              Bespoke visual storytelling for flagship pieces and signature collections. Styled still-life, micro-animation on still and worn pieces, and hand-illustrated concept renderings composed individually per piece. No templates, no limits.
            </p>
            <ul className="atelier-feat">
              <li>Styled still-life, set and composed per piece</li>
              <li>Micro-animation on still and worn pieces</li>
              <li>Hand-illustrated concept renderings (bozzetti)</li>
              <li>Bespoke deliverable mix tailored to the collection</li>
              <li>Priority creative direction and revisions</li>
              <li>Minimum three-month engagement</li>
            </ul>
            <div className="atelier-pricing">
              <div className="atelier-pricing-block">
                <div className="atelier-pricing-label">Pricing</div>
                <div className="atelier-pricing-value">By consultation</div>
              </div>
              <Link href="/#consultation" className="atelier-btn">Enquire about Atelier</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BILLING TERMS ==================== */}
      <section className="billing">
        <div className="billing-inner">
          <div className="billing-header">
            <div className="rule-ornament center"></div>
            <div className="section-eyebrow">Billing &amp; commitment</div>
            <h2 className="section-title">Straightforward <em>terms.</em></h2>
          </div>
          <div className="billing-grid">
            <div className="billing-card">
              <div className="billing-icon">I.</div>
              <h3 className="billing-title">Monthly billing</h3>
              <p className="billing-desc">
                Billed monthly through Stripe on the anniversary of your first successful charge. All major credit cards accepted.
              </p>
            </div>
            <div className="billing-card">
              <div className="billing-icon">II.</div>
              <h3 className="billing-title">Cancel anytime</h3>
              <p className="billing-desc">
                Cancel anytime from the billing section of your account. Takes effect at the end of the current billing cycle. No notice period, no long-term contracts, no termination penalties.
              </p>
            </div>
            <div className="billing-card">
              <div className="billing-icon">III.</div>
              <h3 className="billing-title">Plan changes</h3>
              <p className="billing-desc">
                Upgrade or downgrade at any time. Changes apply to the following billing cycle. Adjustments happen without friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ REFERENCES ==================== */}
      <section className="faq-refs">
        <div className="container">
          <div className="faq-refs-header">
            <div className="rule-ornament center"></div>
            <div className="section-eyebrow">Common questions</div>
            <h2 className="section-title">Before you <em>subscribe.</em></h2>
            <p className="section-lede" style={{ margin: '20px auto 0' }}>
              The most common questions at the point of commitment. Full answers in our FAQ.
            </p>
          </div>

          <div className="faq-refs-grid">
            <Link href="/faq#onboarding" className="faq-ref">
              <div className="faq-ref-q"><span className="qmark">Q.</span> Do I have to send you images every month?</div>
              <div className="faq-ref-arrow">See onboarding &amp; catalog &rarr;</div>
            </Link>
            <Link href="/faq#scope" className="faq-ref">
              <div className="faq-ref-q"><span className="qmark">Q.</span> Do you post Stories or Reels?</div>
              <div className="faq-ref-arrow">See scope &amp; limits &rarr;</div>
            </Link>
            <Link href="/faq#content" className="faq-ref">
              <div className="faq-ref-q"><span className="qmark">Q.</span> Can I approve every post before it goes live?</div>
              <div className="faq-ref-arrow">See content &amp; approvals &rarr;</div>
            </Link>
            <Link href="/faq#content" className="faq-ref">
              <div className="faq-ref-q"><span className="qmark">Q.</span> What if a published post has an error?</div>
              <div className="faq-ref-arrow">See content &amp; approvals &rarr;</div>
            </Link>
            <Link href="/faq#publishing" className="faq-ref">
              <div className="faq-ref-q"><span className="qmark">Q.</span> How do you access my social accounts?</div>
              <div className="faq-ref-arrow">See publishing &amp; platforms &rarr;</div>
            </Link>
            <Link href="/faq#billing" className="faq-ref">
              <div className="faq-ref-q"><span className="qmark">Q.</span> What if I need to cancel?</div>
              <div className="faq-ref-arrow">See billing &amp; cancellation &rarr;</div>
            </Link>
          </div>

          <div className="faq-cta">
            <Link href="/faq">See all frequently asked questions &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ==================== CLOSING CTA ==================== */}
      <section className="closing-cta" id="consultation">
        <div className="container-narrow">
          <div className="rule-ornament center"></div>
          <h2 className="closing-title">Still <em>deciding?</em></h2>
          <p className="closing-sub">
            Book a fifteen-minute consultation. We'll review your current visuals, discuss your brand aesthetic, and recommend a starting point &mdash; no pressure, no obligation.
          </p>
          <a href="mailto:office@talexia.us" className="btn btn-dark">Book a consultation</a>
        </div>
      </section>
    </div>
  );
}
