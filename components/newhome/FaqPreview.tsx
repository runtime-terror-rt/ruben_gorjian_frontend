import React from 'react';
import Link from 'next/link';
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
              <div className="faq-q"><span className="faq-q-mark">Q.</span> What kind of images do I need to provide?</div>
              <div className="faq-a">For Essentials, we work from your existing product photography — the images on your website or in your catalog. Signature includes full image preparation, so you can send us anything, including phone photos: we clean and correct your source images before production. In both cases, the faithfulness of the final visual depends on the quality of the original — we prepare every image to the highest standard the source allows, but we never alter the piece itself.</div>
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
              <div className="faq-a">Yes. You can cancel anytime directly from the billing section of your account. Cancellation takes effect at the end of your current billing cycle — no notice period, no long-term contracts. Annual plans are paid in full and non-refundable; cancelling stops the plan from renewing.</div>
            </div>
            <div className="faq-item">
              <div className="faq-q"><span className="faq-q-mark">Q.</span> Is the first month really free?</div>
              <div className="faq-a">Yes. Apply code <strong>1MFREE</strong> at checkout and your first month is complimentary — your card is not charged. We ask for a card to begin so your service continues seamlessly into month two, which bills at your plan's normal rate. If you cancel before your free month ends, your card is never charged at all. The free month is limited to one per business.</div>
            </div>
          </div>
          <div className="faq-cta">
            <Link href="/newhome/faq">See all frequently asked questions →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
