import React from 'react';

export default function WhatWeDonTDo() {
  return (
    <>
<section className="exclusions">
  <div className="container">
    <div className="exclusions-intro">
      <div className="rule-ornament center"></div>
      <div className="section-eyebrow">Scope</div>
      <h2 className="section-title">A <em>focused service</em> — not a full agency.</h2>
      <p className="section-lede" style={{margin: '20px auto 0'}}>Talexia produces the polished, editorial layer of your feed. The real-time, reactive, personal layer stays with you — because it should.</p>
    </div>
    <div className="exclusions-grid">
      <div className="exclusion-item">
        <div className="exclusion-x">×</div>
        <div>
          <h4 className="exclusion-title">Stories &amp; Reels excluded</h4>
          <p className="exclusion-desc">Meta's Content Publishing API does not permit third-party services to post Stories or Reels. Talexia publishes feed content only, through official platform APIs.</p>
        </div>
      </div>
      <div className="exclusion-item">
        <div className="exclusion-x">×</div>
        <div>
          <h4 className="exclusion-title">DM &amp; comment engagement excluded</h4>
          <p className="exclusion-desc">Customer conversations, questions, and community responses stay with your team — where they build real relationships.</p>
        </div>
      </div>
      <div className="exclusion-item">
        <div className="exclusion-x">×</div>
        <div>
          <h4 className="exclusion-title">Paid advertising excluded</h4>
          <p className="exclusion-desc">Paid social campaigns, ad management, and audience targeting are outside Talexia scope. We focus on organic editorial content.</p>
        </div>
      </div>
      <div className="exclusion-item">
        <div className="exclusion-x">×</div>
        <div>
          <h4 className="exclusion-title">Filmed video &amp; sound edits excluded</h4>
          <p className="exclusion-desc">We produce micro-animation from stills. Filmed video, sound editing, and trending audio work are excluded from all plans.</p>
        </div>
      </div>
    </div>
    <p className="exclusions-note">Scope discipline is what makes the aesthetic sustainable. Fewer promises, held completely — rather than everything, done thinly.</p>
  </div>
</section>
    </>
  );
}
