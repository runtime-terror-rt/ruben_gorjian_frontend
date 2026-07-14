import React from 'react';

export default function FaqPreview() {
  return (
    <>
<section className="faq" id="faq">
  <div className="container">
    <div className="faq-header">
      <div className="rule-ornament center"></div>
      <div className="section-eyebrow">Questions</div>
      <h2 className="section-title">The <em>most common</em> questions.</h2>
    </div>
    <div className="faq-list">
      <div className="faq-item">
        <div className="faq-q"><span className="faq-q-mark">Q.</span> Do I have to send you images every month?</div>
        <div className="faq-a">No. At onboarding you upload your product catalog to a dedicated Google Drive folder. From that point forward, Talexia produces from your catalog on our own schedule. You only notify us when you add new pieces.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q"><span className="faq-q-mark">Q.</span> Do you post Stories or Reels?</div>
        <div className="faq-a">No — the reason is structural. Meta's Content Publishing API does not permit third-party services to publish Stories or Reels. Talexia produces scheduled feed content only, through official APIs.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q"><span className="faq-q-mark">Q.</span> Can I approve every post before it goes live?</div>
        <div className="faq-a">No. Talexia operates on a Brand Brief authorization model — once your voice is locked, content is produced and published without per-post approval. This is what makes the managed rhythm sustainable at our rates.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q"><span className="faq-q-mark">Q.</span> What if a post contains an error?</div>
        <div className="faq-a">Verifiable factual errors — wrong metal tone, incorrect price, wrong product name — reported within 48 hours are corrected in the next scheduled content cycle at no charge. Stylistic preferences are not grounds for revision.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q"><span className="faq-q-mark">Q.</span> How do you access my social accounts?</div>
        <div className="faq-a">Through secure OAuth integration. You connect your accounts directly. Talexia never sees, holds, or has access to your login credentials. You can disconnect at any time.</div>
      </div>
      <div className="faq-item">
        <div className="faq-q"><span className="faq-q-mark">Q.</span> Can I cancel anytime?</div>
        <div className="faq-a">Yes. All plans are billed monthly with fifteen days' notice for cancellation. Cancellation takes effect at the end of the current billing cycle. No long-term contracts.</div>
      </div>
    </div>
    <div className="faq-cta">
      <a href="faq.html">See all frequently asked questions →</a>
    </div>
  </div>
</section>
    </>
  );
}
