"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function PlansPreview() {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  const isAnnual = cycle === 'annual';

  return (
    <>
      <section className="plans-preview" id="plans">
        <div className="container">
          <div className="plans-header">
            <div className="rule-ornament center"></div>
            <div className="section-eyebrow">Managed plans</div>
            <h2 className="section-title">Two plans, <em>one standard.</em></h2>
            <p className="section-lede" style={{ margin: '20px auto 0' }}>Cancel anytime from your account. Both plans deliver the same editorial standard — the volume and cadence flex to your brand's scale.</p>
          </div>

          <div className="billing-toggle-wrap">
            <div className="billing-toggle">
              <span className={`billing-label ${!isAnnual ? 'active' : ''}`} id="labelMonthly" onClick={() => setCycle('monthly')}>Monthly</span>
              <button type="button" className={`billing-switch ${isAnnual ? 'annual' : ''}`} id="billingSwitch" role="switch" aria-checked={isAnnual ? "true" : "false"} aria-label="Switch between monthly and annual billing" onClick={() => setCycle(isAnnual ? 'monthly' : 'annual')}></button>
              <span className={`billing-label ${isAnnual ? 'active' : ''}`} id="labelAnnual" onClick={() => setCycle('annual')}>Annual</span>
            </div>
            <div className="billing-annual-note" id="billingNote" dangerouslySetInnerHTML={{ __html: isAnnual ? 'Paid in full today &middot; <strong>non-refundable</strong> &middot; auto-renews yearly' : '<strong>Save 10%</strong> when you pay for a year up front.' }}></div>
          </div>

          <div className={`plans-cards ${isAnnual ? 'plans-annual' : ''}`} id="plansCards">
            <div className="plan-card">
              <div className="plan-name">Essentials</div>
              <div className="plan-price">
                <span className="cur">$</span>
                <span className="amt" data-monthly="397" data-annual="4,288">{isAnnual ? '4,288' : '397'}</span>
                <span className="per per-monthly">/ month</span>
                <span className="per per-annual">/ year</span>
              </div>
              <div className="plan-annual-saving"><strong>Save $476</strong> a year &mdash; effectively one month free.</div>
              <div className="plan-volume">12 feed posts monthly</div>
              <p className="plan-desc">A polished, consistent presence for a single-store retailer — brand voice locked from day one, published on a steady weekly rhythm.</p>
              <ul className="plan-feat">
                <li>12 luxury-enhanced visuals</li>
                <li>Produced from your existing product photography</li>
                <li>Professional captions, written for you</li>
                <li>Published to 2 platforms</li>
                <li>Monthly content calendar</li>
              </ul>
              <p className="plan-desc" style={{ marginTop: '20px', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>Best for brands with existing product photography. Working mainly from phone photos? Signature includes full image preparation.</p>
              <div className="plan-cta">
                <Link href={`/signup?plan=essentials&billing=${cycle}`} className="plan-btn plan-btn-outline" data-cta="essentials"
                  data-label-monthly="Subscribe to Essentials"
                  data-label-annual="Subscribe annually &mdash; $4,288/yr" dangerouslySetInnerHTML={{ __html: isAnnual ? "Subscribe annually &mdash; $4,288/yr" : "Subscribe to Essentials" }}></Link>
                <div className="plan-annual-terms">Paid in full today &middot; <strong>non-refundable</strong> &middot; auto-renews yearly, with a 30-day reminder.</div>
              </div>
            </div>
            <div className="plan-card feature">
              <div className="plan-badge">Most popular</div>
              <div className="plan-name">Signature</div>
              <div className="plan-price">
                <span className="cur">$</span>
                <span className="amt" data-monthly="597" data-annual="6,448">{isAnnual ? '6,448' : '597'}</span>
                <span className="per per-monthly">/ month</span>
                <span className="per per-annual">/ year</span>
              </div>
              <div className="plan-annual-saving"><strong>Save $716</strong> a year &mdash; effectively one month free.</div>
              <div className="plan-volume">24 feed posts monthly</div>
              <p className="plan-desc">A weekly rhythm for brands ready to show up consistently — planned around the fine jewelry editorial calendar, completely off your plate.</p>
              <ul className="plan-feat">
                <li>24 luxury-enhanced visuals</li>
                <li>Full image preparation — send us anything, even phone photos</li>
                <li>Professional captions &amp; scheduling</li>
                <li>Published to 3 platforms</li>
                <li>Monthly content plan</li>
                <li>Seasonal editorial planning</li>
              </ul>
              <div className="plan-cta">
                <Link href={`/signup?plan=signature&billing=${cycle}`} className="plan-btn plan-btn-dark" data-cta="signature"
                  data-label-monthly="Subscribe to Signature"
                  data-label-annual="Subscribe annually &mdash; $6,448/yr" dangerouslySetInnerHTML={{ __html: isAnnual ? "Subscribe annually &mdash; $6,448/yr" : "Subscribe to Signature" }}></Link>
                <div className="plan-annual-terms">Paid in full today &middot; <strong>non-refundable</strong> &middot; auto-renews yearly, with a 30-day reminder.</div>
              </div>
            </div>
          </div>
          <div className="plans-cta">
            <Link href="/plan">See full plan details →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
