import React from 'react';
import './process.css';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';
import '@/app/page.css';

export const metadata = {
  title: 'Our Process — Talexia',
  description: 'How Talexia produces editorial feed content for fine jewelry brands: onboarding once, then a monthly rhythm that requires nothing further from you.',
  alternates: {
    canonical: 'https://talexia.us/process',
  }
};

export default function ProcessPage() {
  return (
    <div className="talexia-wrapper">
      <Navbar />

      {/* ==================== HERO ==================== */}
      <section className="proc-hero">
        <div className="section-eyebrow">Our process</div>
        <h1 className="proc-hero-title">
          Set up once. Then <em>nothing further</em> from you.
        </h1>
        <p className="proc-hero-sub">
          Talexia is built so the work happens without you in the loop. Here is
          exactly how that works, step by step.
        </p>
        <div className="hero-meta">
          <span className="hero-tag">Onboarding · about 30 minutes</span>
          <span className="hero-tag">
            First content live within your first cycle
          </span>
          <span className="hero-tag">Monthly involvement · none</span>
        </div>
      </section>

      {/* ==================== INTRO ==================== */}
      <section className="intro-band">
        <div className="intro-wrap">
          <p className="intro-lead">
            Most social media services ask you for something{" "}
            <em>every single month.</em>
          </p>
          <p className="intro-text">
            Images to send. Posts to approve. Captions to review. Deadlines to hit.
            The service is sold as a delegation and delivered as a second job.
            Talexia is structured the opposite way: you invest about half an hour
            once, at the beginning, and the rhythm runs from there. Everything below
            happens on our side.
          </p>
        </div>
      </section>

      {/* ==================== PHASES ==================== */}
      <section className="phases">
        <div className="phases-inner">
          {/* PHASE I */}
          <div className="phase">
            <div className="phase-marker">
              <div className="phase-num">I</div>
              <div className="phase-when">Week one</div>
              <div className="phase-effort">
                Your time: about thirty minutes, once.
              </div>
            </div>
            <div>
              <h2 className="phase-title">
                Onboarding — <em>the only time we ask you for anything.</em>
              </h2>
              <p className="phase-desc">
                After payment you complete a Brand Brief. It captures your voice,
                your audience, your aesthetic, your product focus, and the things
                you never want said about your brand. This document becomes the
                standing reference for everything we produce. Take it seriously —
                half an hour here saves months of misalignment later.
              </p>
              <div className="split">
                <div className="split-col">
                  <div className="split-label">You do this</div>
                  <ul>
                    <li>
                      Complete the Brand Brief — voice, audience, aesthetic, product
                      focus
                    </li>
                    <li>
                      Upload your product catalog into the Google Drive folder we
                      share with you, in any state, unorganised is fine
                    </li>
                    <li>
                      Connect your social accounts through secure authorisation
                    </li>
                  </ul>
                </div>
                <div className="split-col talexia">
                  <div className="split-label">Talexia does this</div>
                  <ul>
                    <li>
                      Create and own the dedicated Drive folder, then share access
                      with you
                    </li>
                    <li>
                      Read the Brief in full and index your catalog by piece type,
                      metal and stone
                    </li>
                    <li>
                      Flag anything ambiguous before production begins, so nothing
                      is guessed
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* PHASE II */}
          <div className="phase">
            <div className="phase-marker">
              <div className="phase-num">II</div>
              <div className="phase-when">Week one to two</div>
              <div className="phase-effort">
                Your time: one review. This is your creative moment.
              </div>
            </div>
            <div>
              <h2 className="phase-title">
                Voice lock —{" "}
                <em>the direction is agreed before anything publishes.</em>
              </h2>
              <p className="phase-desc">
                We train our proprietary brand voice system against your Brief and
                produce sample captions alongside visual directions for the first
                cycle. You look at them and tell us what is right and what is not.
                This is deliberately front-loaded: your review happens here, at the
                direction, rather than on every individual post forever afterwards.
              </p>
              <div className="split">
                <div className="split-col">
                  <div className="split-label">You do this</div>
                  <ul>
                    <li>Review the sample captions and visual directions</li>
                    <li>
                      Tell us anything that misses your brand — tone, staging,
                      vocabulary
                    </li>
                    <li>Confirm the direction, and you are done</li>
                  </ul>
                </div>
                <div className="split-col talexia">
                  <div className="split-label">Talexia does this</div>
                  <ul>
                    <li>
                      Train the brand voice system on your Brief and your sample
                      captions
                    </li>
                    <li>
                      Produce sample captions and visual directions for your review
                    </li>
                    <li>
                      Adjust the direction against your notes and lock it into
                      production
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* PHASE III */}
          <div className="phase">
            <div className="phase-marker">
              <div className="phase-num">III</div>
              <div className="phase-when">Every cycle</div>
              <div className="phase-effort">Your time: none.</div>
            </div>
            <div>
              <h2 className="phase-title">
                Production — <em>composed, not generated.</em>
              </h2>
              <p className="phase-desc">
                Each month we select pieces from your catalog, compose them to
                editorial standard, and write captions in your locked voice.
                Rotation is planned so the same pieces do not repeat, and so the
                calendar reflects the moments that matter in fine jewelry —
                engagement season, gifting periods, the seasonal shifts your buyers
                respond to. Every visual is then verified by hand before it goes
                anywhere near a schedule.
              </p>
              <div className="split">
                <div className="split-col">
                  <div className="split-label">You do this</div>
                  <p className="split-none">
                    Nothing. Add new pieces to your Drive folder whenever you like —
                    anything in by the 25th enters the following cycle.
                  </p>
                </div>
                <div className="split-col talexia">
                  <div className="split-label">Talexia does this</div>
                  <ul>
                    <li>
                      Select and rotate pieces so the feed stays varied across the
                      month
                    </li>
                    <li>
                      Compose each visual to editorial standard, styled to your
                      Brief
                    </li>
                    <li>
                      Write captions and research hashtags to fine jewelry
                      conventions
                    </li>
                    <li>Verify every visual by hand against the original piece</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* PHASE IV */}
          <div className="phase">
            <div className="phase-marker">
              <div className="phase-num">IV</div>
              <div className="phase-when">Every cycle</div>
              <div className="phase-effort">Your time: none.</div>
            </div>
            <div>
              <h2 className="phase-title">
                Publishing — <em>it simply appears.</em>
              </h2>
              <p className="phase-desc">
                The month's schedule is built around the posting days and time
                windows you set in your Brief, in your own timezone, and published
                directly to your connected accounts through the official platform
                interfaces. Your login details are never shared with us and never
                visible to us. You do not queue anything, log into anything, or
                remember anything.
              </p>
              <div className="split">
                <div className="split-col">
                  <div className="split-label">You do this</div>
                  <p className="split-none">
                    Nothing — unless a platform asks you to re-authorise, which
                    takes about thirty seconds and happens a few times a year.
                  </p>
                </div>
                <div className="split-col talexia">
                  <div className="split-label">Talexia does this</div>
                  <ul>
                    <li>
                      Build the monthly schedule to your preferred days and time
                      windows
                    </li>
                    <li>
                      Publish through official platform interfaces — never with your
                      password
                    </li>
                    <li>
                      Monitor for failed posts and reschedule them when a platform
                      recovers
                    </li>
                    <li>Notify you if anything needs action on your side</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== VERIFICATION ==================== */}
      <section className="verify">
        <div className="verify-inner">
          <div className="section-eyebrow">The production standard</div>
          <h2 className="verify-title">
            Every stone. Every setting. <em>Checked by hand.</em>
          </h2>
          <p className="verify-text">
            A beautiful image of the wrong ring is worse than no image at all.
            Before anything is scheduled, each visual is compared against your
            original product photography by a person, not a process. The setting
            around the piece becomes editorial. The piece itself stays exactly what
            it is.
          </p>
          <div className="verify-grid">
            <div className="verify-item">
              <h4>Metal tone</h4>
              <p>
                Yellow, white, rose and two-tone read true to the piece, not shifted
                by the lighting of the scene.
              </p>
            </div>
            <div className="verify-item">
              <h4>Stone colour</h4>
              <p>
                Gemstone hue and saturation match the original. An aquamarine never
                arrives looking like a topaz.
              </p>
            </div>
            <div className="verify-item">
              <h4>Design detail</h4>
              <p>
                Prong counts, link structure, pavé lines and engraving hold. Where
                the geometry is complex, we compose by hand.
              </p>
            </div>
            <div className="verify-item">
              <h4>Nothing invented</h4>
              <p>
                No stones added, no proportions flattered, no details imagined. Your
                catalog, elevated — never altered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CORRECTIONS ==================== */}
      <section className="corrections">
        <div className="corr-inner">
          <div>
            <h2 className="corr-title">
              If something is <em>factually wrong.</em>
            </h2>
            <p className="corr-text">
              We are honest about this rather than vague. Verifiable factual errors
              are corrected at no charge. Matters of taste are governed by your
              Brand Brief, and are changed by updating the Brief rather than by
              revising individual posts.
            </p>
            <p className="corr-text">
              This is what makes a fully managed rhythm sustainable at our rates. A
              service built around open-ended revision either charges considerably
              more, or quietly stops honouring the promise. We would rather tell you
              the model up front.
            </p>
            <p className="corr-text">
              Report a factual error within forty-eight hours of publication and it
              is corrected in the next scheduled cycle.
            </p>
          </div>
          <div className="corr-card">
            <h4>Corrected at no charge</h4>
            <ul>
              <li className="yes">Wrong metal tone</li>
              <li className="yes">Wrong stone colour</li>
              <li className="yes">Wrong product name</li>
              <li className="yes">Incorrect price</li>
              <li className="yes">A discontinued piece featured</li>
            </ul>
            <h4>Governed by your Brand Brief</h4>
            <ul>
              <li className="no">Composition or staging preference</li>
              <li className="no">Colour palette preference</li>
              <li className="no">Caption tone or phrasing</li>
              <li className="no">Hashtag selection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==================== SCOPE ==================== */}
      <section className="scope">
        <div className="scope-inner">
          <h2 className="scope-title">
            What stays <em>with you.</em>
          </h2>
          <p className="scope-text">
            Talexia produces the polished, editorial layer of your feed. The
            reactive, personal, real-time layer stays with your team — because that
            is where real customer relationships are actually built, and because the
            platforms are built for you to own it.
          </p>
          <div className="scope-tags">
            <span className="scope-tag">Stories &amp; Reels</span>
            <span className="scope-tag">DMs &amp; comments</span>
            <span className="scope-tag">Community engagement</span>
            <span className="scope-tag">Paid advertising</span>
            <span className="scope-tag">Filmed video &amp; sound</span>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="cta">
        <h2 className="cta-title">
          Ready to see it on <em>your collection?</em>
        </h2>
        <p className="cta-text">
          Review the plans, or book a fifteen-minute consultation and we will look
          at your current feed together — no pressure, no obligation.
        </p>
        <div className="cta-buttons">
          <a href="/plan" className="btn btn-dark">
            See plans
          </a>
          <a href="/contact?subject=consultation" className="btn btn-outline">
            Book a consultation
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
