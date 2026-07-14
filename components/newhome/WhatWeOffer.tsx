import React from 'react';

export default function WhatWeOffer() {
  return (
    <>
<section className="what-we-offer">
  <div className="container">
    <div className="offer-header">
      <div className="rule-ornament center"></div>
      <div className="section-eyebrow">What we offer</div>
      <h2 className="section-title">Three disciplines, <em>one deliverable rhythm.</em></h2>
      <p className="section-lede" style={{margin: '20px auto 0'}}>Every plan combines visual production, editorial captioning, and scheduled publishing into a single, coordinated monthly cycle.</p>
    </div>
    <div className="offer-grid">
      <div className="offer-card">
        <div className="offer-icon">I</div>
        <h3 className="offer-title">Visual production</h3>
        <p className="offer-desc">Every visual is composed from your catalog and enhanced to editorial standard — accurate to the piece, styled to the brand, held to a luxury aesthetic. No stock, no filters, no shortcuts.</p>
      </div>
      <div className="offer-card">
        <div className="offer-icon">II</div>
        <h3 className="offer-title">Editorial captioning</h3>
        <p className="offer-desc">Captions and hashtags are written from your locked Brand Brief — voice, audience, and tone captured once, applied consistently. Every post reads as your brand, not a template.</p>
      </div>
      <div className="offer-card">
        <div className="offer-icon">III</div>
        <h3 className="offer-title">Scheduled publishing</h3>
        <p className="offer-desc">Your content is published directly to your connected accounts on a weekly rhythm — no manual queuing, no missed weeks, no logging in. Your credentials are never visible to Talexia.</p>
      </div>
    </div>
  </div>
</section>
    </>
  );
}
