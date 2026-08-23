"use client";
import React, { useState } from 'react';
import './brandbrief.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/context/SessionContext';
import { apiPost } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function BrandBriefPage() {
  const [showBirthstoneDetail, setShowBirthstoneDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const router = useRouter();
  const { updateSession, session, loading } = useSessionContext();

  React.useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  }, []);

  // Strict Security Guard: Redirect based on conditions
  React.useEffect(() => {
    if (loading) return;
    
    if (!session) {
      router.push("/login?returnTo=/brandbrief");
      return;
    }

    if (session.brandBriefCompleted || session.brandBriefOnboardingCompleted) {
      window.location.href = "/dashboard";
      return;
    }

    const subscriptionStatus = session.subscription?.status;
    const pendingPlanCode = session.pendingPlanCode;
    const role = session.role;

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }

    if (
      subscriptionStatus === "INCOMPLETE" ||
      (pendingPlanCode &&
        subscriptionStatus !== "ACTIVE" &&
        subscriptionStatus !== "TRIALING")
    ) {
      router.push("/onboarding");
      return;
    }

    if (!session.subscription && !pendingPlanCode) {
      router.push("/pricing");
      return;
    }
  }, [session, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const payload: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
          const cleanKey = key.slice(0, -2);
          if (!payload[cleanKey]) {
            payload[cleanKey] = [];
          }
          payload[cleanKey].push(value);
        } else {
          payload[key] = value;
        }
      }

      // Map both old and new schema fields to ensure the backend validation passes 
      // regardless of whether it's looking for the legacy or the updated fields.
      const mappedPayload = {
        // NEW SCHEMA FIELDS
        brandName: payload.brand_name || "N/A",
        primaryLocation: payload.location || "N/A",
        industryCategory: payload.category || payload.business_type || "N/A",
        brandStory: payload.brand_story || "N/A",
        brandVoiceDescriptors: Array.isArray(payload.voice) ? payload.voice : (payload.voice ? [payload.voice] : []),
        targetAudience: payload.audience || "N/A",
        aestheticDirection: Array.isArray(payload.aesthetic) ? payload.aesthetic : (payload.aesthetic ? [payload.aesthetic] : []),
        productFocus: Array.isArray(payload.products) ? payload.products : (payload.products ? [payload.products] : []),
        materialsCertifications: payload.materials || "N/A",
        birthstoneTheming: payload.birthstone_notes || "N/A",
        sampleCaptions: payload.sample_captions || "N/A",
        platforms: Array.isArray(payload.platforms) ? payload.platforms : (payload.platforms ? [payload.platforms] : []),
        timezone: payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        preferredPostingDays: Array.isArray(payload.posting_days) ? payload.posting_days : (payload.posting_days ? [payload.posting_days] : []),
        preferredTimeWindows: Array.isArray(payload.posting_windows) ? payload.posting_windows : (payload.posting_windows ? [payload.posting_windows] : []),
        googleDriveEmails: payload.drive_share_emails || "N/A",
        primaryContactName: payload.contact_primary_name || "N/A",
        primaryContactEmail: payload.contact_primary_email || "N/A",
        preferredCommunication: payload.communication || "N/A",
        authSignedAs: payload.signed_as || "N/A",
        authOnBehalfOf: payload.brand_name || "N/A",
        authSubmissionDate: new Date().toISOString(),
        authTalexiaPlan: payload.planCode || session?.subscription?.planCategory || "Active Plan",
        authIHaveReadAndAgree: payload.authorization_confirmed === "on" || true,

        // OLD SCHEMA FIELDS (Hybrid Backend Requirements)
        planCode: payload.planCode || "CUS_DEFAULT",
        restaurantName: payload.brand_name || "N/A",
        location: payload.location || "N/A",
        businessType: payload.business_type || "N/A",
        cuisineType: payload.category || "Jewelry",
        dietaryCertifications: [], 
        websiteUrl: payload.website || "N/A",
        instagramHandle: payload.website || "N/A", 
        facebookPageUrl: payload.website || "N/A",
        tiktokHandle: payload.website || "N/A",
        onlineOrderingUrl: payload.website || "N/A",
        foodDescription: payload.brand_story || "N/A",
        uniqueSellingPoint: payload.aesthetic ? (Array.isArray(payload.aesthetic) ? payload.aesthetic.join(", ") : payload.aesthetic) : "N/A",
        customerReviews: payload.admire || "N/A",
        forbiddenPhrases: payload.avoid || "N/A",
        preferredPhrases: payload.taglines || "N/A",
        captionSample1: payload.sample_captions || "N/A",
        captionSample2: "N/A",
        captionSample3: "N/A",
        toneAndVoice: Array.isArray(payload.voice) ? payload.voice : (payload.voice ? [payload.voice] : []),
        captionTargeting: payload.targeting || "N/A",
        language: payload.language === 'other' ? (payload.language_other || 'Other') : (payload.language || 'English'),
        signatureDishes: Array.isArray(payload.products) ? payload.products : (payload.products ? [payload.products] : []),
        signatureDishDetails: (payload.collections || "") + " " + (payload.materials || "N/A"),
        excludedItems: payload.sensitive || "N/A",
        upcomingPromotions: payload.seasonal || "N/A",
        hashtagStyle: payload.hashtag_style || "N/A",
        confirmMinDishes: "Confirmed",
        actionShotsPossible: Array.isArray(payload.posting_days) ? payload.posting_days : (payload.posting_days ? [payload.posting_days] : []),
        preferredShootTime: Array.isArray(payload.posting_windows) ? payload.posting_windows.join(", ") : (payload.posting_windows || "N/A"),
        physicalConstraints: payload.staging || "N/A",
        specialNotes: (payload.birthstone_notes || "") + " " + (payload.posting_notes || "N/A"),
        clientName: payload.signed_as || payload.contact_primary_name || "N/A",
        restaurantNameAuth: payload.brand_name || "N/A",
        submissionDate: new Date().toISOString().split("T")[0],
        talexiaPlan: payload.planCode || "Active Plan"
      };

      const res = await apiPost('/api/brand-brief', mappedPayload) as any;
      if (res.success || res.status === 'success') {
        await updateSession({ brandBriefCompleted: true });
        router.push('/dashboard');
      } else {
        alert('Failed to submit brand brief. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== STRICT RENDER BLOCKING ====================
  // If loading session data, show a spinner (no UI leak)
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fdfaf5]">
        <Loader2 className="h-8 w-8 animate-spin text-[#b08d3e]" />
      </div>
    );
  }

  // If no session, wait for redirect
  if (!session) return null;

  // Evaluate business rules for rendering
  const subscriptionStatus = session.subscription?.status;
  const pendingPlanCode = session.pendingPlanCode;
  
  const isPaid = 
    (session.subscription && subscriptionStatus !== "INCOMPLETE") ||
    (pendingPlanCode && (subscriptionStatus === "ACTIVE" || subscriptionStatus === "TRIALING"));

  // If not paid, wait for redirect
  if (!isPaid && !session.brandBriefCompleted && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    return null;
  }
  // ================================================================

  return (
    <div className="brandbrief-wrapper">
      

{/* ==================== NAVIGATION ==================== */}
<nav className="nav">
  <Link href="/newhome" className="nav-brand">
  Talexia
  </Link>
  <div className="nav-status">Onboarding <span className="dot">·</span> Brand Brief</div>
</nav>

{/* ==================== PAGE HEADER ==================== */}
<div className="page-header">
  <div className="rule-ornament"></div>
  <div className="page-eyebrow">Onboarding · Step 1 of 4</div>
  <h1 className="page-title">Your <em>Brand Brief</em></h1>
  <p className="page-lede">The single reference document Talexia uses to produce every visual, every caption, and every scheduled post for your brand.</p>
</div>

{/* ==================== INSTRUCTIONS PREAMBLE ==================== */}
<div className="preamble">
  <p>The accuracy and completeness of this Brief determines the quality of everything Talexia produces on your behalf. Please take the time to answer thoughtfully — twenty to thirty minutes now saves months of misalignment later.</p>
  <p><strong>Save and return.</strong> Your answers autosave as you type. You may leave and return to this page at any time; your progress will be preserved.</p>
  <p><strong>Required fields.</strong> Fields marked with a small gold mark are required. Others are optional but recommended.</p>
</div>

{/* ==================== FORM LAYOUT ==================== */}
<div className="doc-layout">

  {/* SECTION NAV */}
  <aside className="sec-nav">
    <div className="sec-nav-title">Sections</div>
    <ul className="sec-nav-list">
      <li><a href="#s1"><span className="sec-num">I</span> The basics</a></li>
      <li><a href="#s2"><span className="sec-num">II</span> About your brand</a></li>
      <li><a href="#s3"><span className="sec-num">III</span> Your aesthetic</a></li>
      <li><a href="#s4"><span className="sec-num">IV</span> Your product</a></li>
      <li><a href="#s5"><span className="sec-num">V</span> Captions &amp; voice</a></li>
      <li><a href="#s6"><span className="sec-num">VI</span> Publishing</a></li>
      <li><a href="#s7"><span className="sec-num">VII</span> Catalog &amp; source</a></li>
      <li><a href="#s8"><span className="sec-num">VIII</span> Operational</a></li>
      <li><a href="#s9"><span className="sec-num">IX</span> Authorization</a></li>
    </ul>
    <div className="autosave-note">
      <strong>Autosaved</strong><br />
      Last saved just now. Close this page anytime — your progress is preserved.
    </div>
  </aside>

  {/* FORM CONTENT */}
  <form className="form-content" onSubmit={handleSubmit}>

    {/* ==================== SECTION I ==================== */}
    <section className="form-section" id="s1">
      <div className="sec-header">
        <div className="sec-num-large">I.</div>
        <h2 className="sec-title">The <em>basics</em></h2>
      </div>
      <p className="sec-intro">The foundational information about your business.</p>

      <div className="field">
        <label className="field-label">Brand name <span className="req">◆</span></label>
        <p className="field-hint">The name your customers know you by — as it should appear in captions and hashtags.</p>
        <input type="text" className="field-input" name="brand_name" placeholder="Your brand name as it appears in captions" required value={brandName} onChange={(e) => setBrandName(e.target.value)} />
      </div>

      <div className="field">
        <label className="field-label">Business type <span className="req">◆</span></label>
        <p className="field-hint">Select the description that best fits your business.</p>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="business_type" value="retailer" required />
            <span>Independent retailer (single store)</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="business_type" value="multi_retail" />
            <span>Multi-store retailer</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="business_type" value="wholesaler" />
            <span>Wholesaler</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="business_type" value="custom_house" />
            <span>Custom / bespoke house</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="business_type" value="designer" />
            <span>Independent designer</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="business_type" value="other" />
            <span>Other (specify below)</span>
          </label>
        </div>
      </div>

      <div className="field-two-col">
        <div className="field">
          <label className="field-label">Primary location <span className="req">◆</span></label>
          <p className="field-hint">City and country of your main operation.</p>
          <input type="text" className="field-input" name="location" placeholder="City, Country" />
        </div>
        <div className="field">
          <label className="field-label">Website URL <span className="req">◆</span></label>
          <p className="field-hint">Your primary brand website.</p>
          <input type="url" className="field-input" name="website" placeholder="https://" />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Industry category <span className="req">◆</span></label>
        <p className="field-hint">Talexia specializes in fine jewelry. Select the closest fit; adjacent luxury categories are considered on inquiry.</p>
        <select className="field-select" name="category">
          <option value="">— Select category —</option>
          <option value="fine_jewelry">Fine jewelry</option>
          <option value="high_jewelry">High jewelry / bespoke</option>
          <option value="watches">Watches</option>
          <option value="silverware">Silverware</option>
          <option value="accessories">High-end accessories</option>
          <option value="artisan_luxury">Artisan luxury goods</option>
        </select>
      </div>
    </section>

    {/* ==================== SECTION II ==================== */}
    <section className="form-section" id="s2">
      <div className="sec-header">
        <div className="sec-num-large">II.</div>
        <h2 className="sec-title">About <em>your brand</em></h2>
      </div>
      <p className="sec-intro">The story, positioning, and personality of your brand — the foundation of your voice.</p>

      <div className="field">
        <label className="field-label">Brand story in 2–3 sentences <span className="req">◆</span></label>
        <p className="field-hint">How would you describe your brand to someone who has never heard of it? Origin, focus, what makes it distinctive.</p>
        <textarea className="field-textarea large" name="brand_story" placeholder="Founded in 1994 as a family-run atelier specializing in bespoke bridal pieces designed and crafted in-house..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Brand voice — how does your brand speak? <span className="req">◆</span></label>
        <p className="field-hint">Select all descriptors that apply. These shape the tone of every caption.</p>
        <div className="field-checkbox-group">
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="elegant" />
            <span>Elegant &amp; aspirational</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="warm" />
            <span>Warm &amp; personal</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="minimal" />
            <span>Minimal &amp; considered</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="editorial" />
            <span>Editorial &amp; magazine-toned</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="bold" />
            <span>Bold &amp; contemporary</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="storytelling" />
            <span>Storytelling &amp; narrative</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="craft" />
            <span>Craft-focused &amp; artisanal</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="voice[]" value="heritage" />
            <span>Heritage &amp; timeless</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Target audience <span className="req">◆</span></label>
        <p className="field-hint">Who buys from you? Age range, lifestyle, and what they're seeking.</p>
        <textarea className="field-textarea" name="audience" placeholder="Women 35–65 who appreciate craftsmanship, buy for milestones and self-purchase, value discretion over statement pieces..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Taglines or recurring phrases</label>
        <p className="field-hint">Any signature language you use across your marketing — brand-specific phrases, taglines, or vocabulary you return to.</p>
        <textarea className="field-textarea" name="taglines" placeholder="Handcrafted since 1994 · Every piece tells a story · Legacy in every detail"></textarea>
      </div>

      <div className="field">
        <label className="field-label">Brands whose visual style you admire</label>
        <p className="field-hint">Two or three names, jewelry or otherwise. Helps Talexia understand your visual reference points.</p>
        <textarea className="field-textarea" name="admire" placeholder="Tiffany's storytelling, Van Cleef's editorial confidence, a specific independent designer's restraint..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">What to avoid</label>
        <p className="field-hint">Aesthetics, tones, or approaches that don't fit your brand — equally important as what to embrace.</p>
        <textarea className="field-textarea" name="avoid" placeholder="Overly casual language, hashtag stacking, black backgrounds, sparkle/glitter effects, statement-piece framing..."></textarea>
      </div>
    </section>

    {/* ==================== SECTION III ==================== */}
    <section className="form-section" id="s3">
      <div className="sec-header">
        <div className="sec-num-large">III.</div>
        <h2 className="sec-title">Your <em>aesthetic</em></h2>
      </div>
      <p className="sec-intro">The visual language of your brand — color, staging, composition, and mood.</p>

      <div className="field">
        <label className="field-label">Aesthetic direction <span className="req">◆</span></label>
        <p className="field-hint">Which visual register best matches your brand? Select all that apply.</p>
        <div className="field-checkbox-group">
          <label className="field-checkbox">
            <input type="checkbox" name="aesthetic[]" value="classical" />
            <span>Classical / heritage</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="aesthetic[]" value="modern" />
            <span>Modern / contemporary</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="aesthetic[]" value="minimal" />
            <span>Minimalist / editorial</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="aesthetic[]" value="atmospheric" />
            <span>Atmospheric / moody</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="aesthetic[]" value="natural" />
            <span>Natural / organic</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="aesthetic[]" value="architectural" />
            <span>Architectural / geometric</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Preferred color palette</label>
        <p className="field-hint">Specific colors you'd like reflected across your feed — background tones, seasonal palettes, brand signatures.</p>
        <textarea className="field-textarea" name="palette" placeholder="Warm ivory backgrounds, dusty blue for atmospheric shots, deep cream for staging, absolutely no black backgrounds..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Staging preferences</label>
        <p className="field-hint">How your pieces should appear — flat-lay, on plinths, worn on hands, atmospheric compositions, etc.</p>
        <textarea className="field-textarea" name="staging" placeholder="Rings on plinths or curved seamless, necklaces flat-lay only (chains don't drape well on plinths), hero pieces in atmospheric compositions..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Visual references</label>
        <p className="field-hint">Any specific images, moodboards, or Instagram accounts that capture the aesthetic you want. Paste URLs or describe.</p>
        <textarea className="field-textarea" name="references" placeholder="Instagram accounts we admire: [@handle] for editorial confidence, [@handle] for restraint. Pinterest board: [link]..."></textarea>
      </div>
    </section>

    {/* ==================== SECTION IV ==================== */}
    <section className="form-section" id="s4">
      <div className="sec-header">
        <div className="sec-num-large">IV.</div>
        <h2 className="sec-title">Your <em>product</em></h2>
      </div>
      <p className="sec-intro">What you sell, at what level, and what makes it distinctive.</p>

      <div className="field">
        <label className="field-label">Product focus <span className="req">◆</span></label>
        <p className="field-hint">What categories do you produce or sell? Select all that apply.</p>
        <div className="field-checkbox-group">
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="rings" />
            <span>Rings</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="engagement" />
            <span>Engagement rings</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="necklaces" />
            <span>Necklaces &amp; pendants</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="earrings" />
            <span>Earrings</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="bracelets" />
            <span>Bracelets</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="watches" />
            <span>Watches</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="mens" />
            <span>Men's jewelry</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="products[]" value="bespoke" />
            <span>Bespoke commissions</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Typical price range</label>
        <p className="field-hint">A range that helps Talexia understand your positioning. This is not displayed in captions.</p>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="price_range" value="under_1k" />
            <span>Under $1,000</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="price_range" value="1k_5k" />
            <span>$1,000 – $5,000</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="price_range" value="5k_20k" />
            <span>$5,000 – $20,000</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="price_range" value="20k_100k" />
            <span>$20,000 – $100,000</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="price_range" value="above_100k" />
            <span>Above $100,000 / bespoke</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="price_range" value="mixed" />
            <span>Mixed range</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Key collections or signature lines</label>
        <p className="field-hint">Named collections, hero pieces, or product lines that should receive particular attention.</p>
        <textarea className="field-textarea" name="collections" placeholder="Our Heritage line (5 hero pieces), the Bloom bridal collection, seasonal Fall/Winter capsule..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Materials, certifications, sourcing notes</label>
        <p className="field-hint">GIA certification, ethical sourcing, specific metals or stones, any material claims to be featured or avoided.</p>
        <textarea className="field-textarea" name="materials" placeholder="All diamonds GIA certified above 1ct, 18k gold recycled, avoid synthetic stone claims, we do not disclose specific gemstone origins..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Seasonal calendar</label>
        <p className="field-hint">Times of year with sales or brand significance — engagement season, Christmas, cultural events specific to your market.</p>
        <textarea className="field-textarea" name="seasonal" placeholder="November–February: engagement season (heavy focus). May: Mother's Day. August–September: fall preview drops..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Birthstone theming</label>
        <p className="field-hint">Would you like a portion of your monthly content themed to each month's birthstone, where your collection supports it? (July → ruby, September → sapphire, and so on.)</p>
        <div className="field-radio-group single-col">
          <label className="field-radio">
            <input type="radio" name="birthstone_optin" value="yes" id="bs_yes" onChange={() => setShowBirthstoneDetail(true)} />
            <span>Yes — theme where my collection allows</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="birthstone_optin" value="no" id="bs_no" onChange={() => setShowBirthstoneDetail(false)} defaultChecked />
            <span>No — keep my content unthemed</span>
          </label>
        </div>

        <div id="birthstoneDetail" className={`birthstone-detail ${showBirthstoneDetail ? "active" : ""}`}>
          <label className="field-label" style={{'marginTop': '6px'}}>Which birthstones do you carry in depth?</label>
          <p className="field-hint">Tick only the birthstones you stock several distinct pieces of. Leave the rest blank — we'll theme a month only where your collection can support it without repeating pieces.</p>
          <div className="field-checkbox-group months">
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="jan_garnet" /><span>January · Garnet</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="feb_amethyst" /><span>February · Amethyst</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="mar_aquamarine" /><span>March · Aquamarine</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="apr_diamond" /><span>April · Diamond</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="may_emerald" /><span>May · Emerald</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="jun_pearl" /><span>June · Pearl / Alexandrite</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="jul_ruby" /><span>July · Ruby</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="aug_peridot" /><span>August · Peridot</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="sep_sapphire" /><span>September · Sapphire</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="oct_opal" /><span>October · Opal / Tourmaline</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="nov_topaz" /><span>November · Topaz / Citrine</span></label>
            <label className="field-checkbox"><input type="checkbox" name="birthstone_months[]" value="dec_turquoise" /><span>December · Turquoise / Tanzanite</span></label>
          </div>

          <div className="field" style={{'marginTop': '18px'}}>
            <label className="field-label">Anything we should know about your birthstone inventory? <span style={{'fontWeight': '400', 'color': '#8a8a8a'}}>(optional)</span></label>
            <textarea className="field-textarea" name="birthstone_notes" placeholder="Very deep in sapphire and ruby, almost nothing in opal or peridot..."></textarea>
          </div>

          <div className="birthstone-note">
            Birthstone theming is applied where your collection has enough depth to support it, and adapts month to month with your inventory. It is not a fixed number of posts per month, and months where your collection is thin may not include birthstone-themed content. Themed pieces follow the same production and fidelity standards as all Talexia content.
          </div>
        </div>
      </div>
    </section>

    {/* ==================== SECTION V ==================== */}
    <section className="form-section" id="s5">
      <div className="sec-header">
        <div className="sec-num-large">V.</div>
        <h2 className="sec-title">Captions <em>&amp; voice</em></h2>
      </div>
      <p className="sec-intro">Talexia's proprietary brand voice training uses your examples as the standard for every future caption.</p>

      <div className="field">
        <label className="field-label">Three sample captions <span className="req">◆</span></label>
        <p className="field-hint">Paste three existing captions from your feed that you consider representative of your brand voice at its best. These become Talexia's training reference.</p>
        <textarea className="field-textarea large" name="sample_captions" placeholder="Caption 1:&#10;...&#10;&#10;Caption 2:&#10;...&#10;&#10;Caption 3:&#10;..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Caption targeting <span className="req">◆</span></label>
        <p className="field-hint">Who are your captions written for?</p>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="targeting" value="b2c" />
            <span>B2C — direct to end consumer</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="targeting" value="b2b" />
            <span>B2B — to retailers or trade</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="targeting" value="mixed" />
            <span>Mixed — both audiences</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Language <span className="req">◆</span></label>
        <p className="field-hint">What language(s) should captions be written in?</p>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="language" value="english" />
            <span>English only</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="language" value="other" />
            <span>Other (specify below)</span>
          </label>
        </div>
        <textarea className="field-textarea" name="language_other" placeholder="If 'Other' — specify language(s) and any bilingual pairing (e.g. Spanish only, English/French bilingual)" style={{'marginTop': '12px'}}></textarea>
      </div>

      <div className="field">
        <label className="field-label">Hashtag style <span className="req">◆</span></label>
        <p className="field-hint">How prominent should hashtags be in your captions?</p>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="hashtag_style" value="niche" />
            <span>Niche &amp; targeted</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="hashtag_style" value="broad" />
            <span>Broad &amp; discoverable</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="hashtag_style" value="mixed" />
            <span>Mixed niche + broad</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="hashtag_style" value="minimal" />
            <span>Minimal — brand hashtag only</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Sensitive topics or brand rules</label>
        <p className="field-hint">Anything Talexia should never mention, imply, or use — political stances, religious references, competitor brands, specific words to avoid.</p>
        <textarea className="field-textarea" name="sensitive" placeholder="Do not reference specific gemstone origins, do not use pricing in captions, do not mention specific customer names, avoid political content..."></textarea>
      </div>
    </section>

    {/* ==================== SECTION VI ==================== */}
    <section className="form-section" id="s6">
      <div className="sec-header">
        <div className="sec-num-large">VI.</div>
        <h2 className="sec-title"><em>Publishing</em></h2>
      </div>
      <p className="sec-intro">Where and when your content publishes.</p>

      <div className="field">
        <label className="field-label">Platforms to publish <span className="req">◆</span></label>
        <p className="field-hint">Select the platforms your plan covers. You may adjust these later.</p>
        <div className="field-checkbox-group">
          <label className="field-checkbox">
            <input type="checkbox" name="platforms[]" value="instagram" />
            <span>Instagram</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="platforms[]" value="facebook" />
            <span>Facebook</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="platforms[]" value="linkedin" />
            <span>LinkedIn</span>
          </label>
        </div>
        <p className="field-help">Essentials includes 2 platforms · Signature includes 3 platforms · Atelier by consultation</p>
      </div>

      <div className="field">
        <label className="field-label">Your timezone <span className="req">◆</span></label>
        <p className="field-hint">All posting times are interpreted in your local timezone.</p>
        <select className="field-select" name="timezone">
          <option value="">— Select timezone —</option>
          <optgroup label="North America">
            <option value="America/Los_Angeles">Pacific Time (Los Angeles, Vancouver)</option>
            <option value="America/Denver">Mountain Time (Denver, Phoenix)</option>
            <option value="America/Chicago">Central Time (Chicago, Mexico City)</option>
            <option value="America/New_York">Eastern Time (New York, Toronto)</option>
            <option value="America/Halifax">Atlantic Time (Halifax)</option>
          </optgroup>
          <optgroup label="Europe">
            <option value="Europe/London">London (GMT / BST)</option>
            <option value="Europe/Paris">Central European (Paris, Berlin, Rome, Madrid)</option>
            <option value="Europe/Athens">Eastern European (Athens, Helsinki)</option>
          </optgroup>
          <optgroup label="Asia &amp; Pacific">
            <option value="Asia/Dubai">Gulf (Dubai, Abu Dhabi)</option>
            <option value="Asia/Kolkata">India (Mumbai, Delhi)</option>
            <option value="Asia/Singapore">Singapore / Hong Kong</option>
            <option value="Asia/Tokyo">Japan (Tokyo)</option>
            <option value="Australia/Sydney">Australia Eastern (Sydney, Melbourne)</option>
          </optgroup>
          <optgroup label="South America">
            <option value="America/Sao_Paulo">São Paulo / Buenos Aires</option>
          </optgroup>
          <optgroup label="Other">
            <option value="other">Other (specify in notes below)</option>
          </optgroup>
        </select>
      </div>

      <div className="field">
        <label className="field-label">Preferred posting days</label>
        <p className="field-hint">Which days of the week work best for your audience? Select all that apply. Talexia distributes content across the days you select; leaving all unselected means Talexia optimizes the schedule based on platform best practices.</p>
        <div className="field-checkbox-group">
          <label className="field-checkbox">
            <input type="checkbox" name="posting_days[]" value="monday" />
            <span>Monday</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_days[]" value="tuesday" />
            <span>Tuesday</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_days[]" value="wednesday" />
            <span>Wednesday</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_days[]" value="thursday" />
            <span>Thursday</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_days[]" value="friday" />
            <span>Friday</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_days[]" value="saturday" />
            <span>Saturday</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_days[]" value="sunday" />
            <span>Sunday</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Preferred time windows</label>
        <p className="field-hint">Which time-of-day windows suit your audience? Select all that apply. Times are in your local timezone.</p>
        <div className="field-checkbox-group">
          <label className="field-checkbox">
            <input type="checkbox" name="posting_windows[]" value="early_morning" />
            <span>Early morning (6–9 AM)</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_windows[]" value="mid_morning" />
            <span>Mid morning (9 AM–12 PM)</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_windows[]" value="midday" />
            <span>Midday (12–2 PM)</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_windows[]" value="afternoon" />
            <span>Afternoon (2–5 PM)</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_windows[]" value="evening" />
            <span>Evening (5–8 PM)</span>
          </label>
          <label className="field-checkbox">
            <input type="checkbox" name="posting_windows[]" value="late_evening" />
            <span>Late evening (8–11 PM)</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Additional posting notes</label>
        <p className="field-hint">Anything specific about your audience's rhythm that the day and time selections above don't capture — for example, holidays to avoid, cultural considerations, or specific times to skip.</p>
        <textarea className="field-textarea" name="posting_notes" placeholder="Avoid posting on major national holidays. Skip Sundays before noon. Prefer late-morning slots during the winter months..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Time-critical dates for the coming month</label>
        <p className="field-hint">Product launches, in-store events, announcements that require aligned posting. Additional time-critical dates can be sent by email as needed.</p>
        <textarea className="field-textarea" name="critical_dates" placeholder="March 15: new bridal capsule launch (need supporting posts week of). April 3: in-store event announcement..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Platform authorization contact <span className="req">◆</span></label>
        <p className="field-hint">Name and email of the person who will complete the OAuth authorization for your social accounts. Usually the brand owner or marketing lead.</p>
        <input type="text" className="field-input" name="platform_contact" placeholder="Name and email" />
      </div>
    </section>

    {/* ==================== SECTION VII ==================== */}
    <section className="form-section" id="s7">
      <div className="sec-header">
        <div className="sec-num-large">VII.</div>
        <h2 className="sec-title">Catalog <em>&amp; source</em></h2>
      </div>
      <p className="sec-intro">Your product catalog is the source material for every visual Talexia produces. Access details below.</p>

      <div className="field">
        <label className="field-label">Email(s) to share your Google Drive folder with <span className="req">◆</span></label>
        <p className="field-hint">Talexia creates and owns a dedicated Google Drive folder for your catalog. Provide the email address(es) that should receive access to the folder — usually the person responsible for uploading and managing product images. Multiple addresses can be separated with commas.</p>
        <input type="text" className="field-input" name="drive_share_emails" placeholder="catalog@yourbrand.com, marketing@yourbrand.com" />
        <p className="field-help">After you submit this Brief, Talexia will create the folder and send a Google Drive share invitation to each address you provide. You then upload your product catalog into that folder.</p>
      </div>

      <div className="field">
        <label className="field-label">SKU / filename convention</label>
        <p className="field-hint">If your SKUs or filenames already encode material and stone information (e.g. <em>RIKTMO2233</em> for a Ring in KT gold with Morganite), describe the convention. If not, leave blank and provide a text file in your Drive folder listing filename → material info.</p>
        <textarea className="field-textarea" name="sku_convention" placeholder="Our SKUs follow this pattern: [product type][metal][stone][number]. Example: RIKTMO2233 = Ring, KT gold, Morganite, style 2233..."></textarea>
      </div>

      <div className="field">
        <label className="field-label">Product identification notes</label>
        <p className="field-hint">Any special cases: discontinued items marked in the folder, seasonal pieces flagged separately, pieces not to be featured on social, etc.</p>
        <textarea className="field-textarea" name="product_notes" placeholder="Pieces in /Archive/ folder are discontinued — do not feature. Pieces beginning with 'PROTO_' are prototypes not for public display..."></textarea>
      </div>
    </section>

    {/* ==================== SECTION VIII ==================== */}
    <section className="form-section" id="s8">
      <div className="sec-header">
        <div className="sec-num-large">VIII.</div>
        <h2 className="sec-title"><em>Operational</em></h2>
      </div>
      <p className="sec-intro">Contact and communication preferences.</p>

      <div className="field-two-col">
        <div className="field">
          <label className="field-label">Primary contact name <span className="req">◆</span></label>
          <input type="text" className="field-input" name="contact_primary_name" placeholder="Full name" />
        </div>
        <div className="field">
          <label className="field-label">Primary contact email <span className="req">◆</span></label>
          <input type="email" className="field-input" name="contact_primary_email" placeholder="email@brand.com" />
        </div>
      </div>

      <div className="field-two-col">
        <div className="field">
          <label className="field-label">Secondary contact (optional)</label>
          <input type="text" className="field-input" name="contact_secondary_name" placeholder="Name — for CC on communications" />
        </div>
        <div className="field">
          <label className="field-label">Secondary contact email</label>
          <input type="email" className="field-input" name="contact_secondary_email" placeholder="email@brand.com" />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Preferred communication method</label>
        <p className="field-hint">How should Talexia reach you for corrections, updates, or authorization renewals?</p>
        <div className="field-radio-group">
          <label className="field-radio">
            <input type="radio" name="communication" value="email" />
            <span>Email only (recommended)</span>
          </label>
          <label className="field-radio">
            <input type="radio" name="communication" value="email_whatsapp" />
            <span>Email + WhatsApp for urgent</span>
          </label>
        </div>
      </div>

      <div className="field">
        <label className="field-label">WhatsApp number</label>
        <p className="field-hint">Only required if you selected "Email + WhatsApp for urgent" above. Include country code (e.g. +1 for US, +39 for Italy, +44 for UK). Talexia uses WhatsApp only for time-sensitive matters — token reauthorization requests, urgent factual corrections, or clarifications during production.</p>
        <input type="tel" className="field-input" name="whatsapp_number" placeholder="+1 555 123 4567" />
      </div>
    </section>

    {/* ==================== SECTION IX — AUTHORIZATION ==================== */}
    <section className="form-section auth-section" id="s9">
      <div className="sec-header">
        <div className="sec-num-large">IX.</div>
        <h2 className="sec-title">Publishing <em>authorization</em></h2>
      </div>
      <p className="sec-intro">The legal foundation of Talexia's fully managed rhythm. Please read carefully before submitting.</p>

      <div className="auth-box">
        <div className="auth-heading">Brand publishing authorization</div>
        <div className="auth-title">By submitting this Brand Brief, I confirm and authorize the following.</div>

        <ul className="auth-list">
          <li>All brand information provided in this Brief is accurate, current, and complete to the best of my knowledge.</li>
          <li>I authorize Talexia to produce visual content, captions, hashtags, and posting schedules on behalf of my brand using the information provided in this Brief.</li>
          <li>I authorize Talexia to publish content directly to my connected social media platforms on my behalf, without requiring my prior review or approval of individual posts.</li>
          <li>I understand that Talexia's content is generated from this Brief, and that inaccurate or incomplete information may affect content quality.</li>
          <li>I understand that stylistic preferences are not grounds for revision or regeneration — those are governed by this Brief and by future Brief updates.</li>
          <li>I understand that verifiable factual errors in published content must be reported within 48 hours of publication and will be corrected in the next scheduled content cycle.</li>
          <li>I understand that significant brand changes must be submitted as an updated Brand Brief to take effect the following month.</li>
          <li>I confirm that I have read and accepted Talexia's <a href="terms.html" style={{'color': '#8a6d28'}}>Service Policy</a> and <a href="privacy.html" style={{'color': '#8a6d28'}}>Privacy Policy</a>.</li>
        </ul>

        <p className="auth-emphasis">
          By submitting this form, I am entering into a standing publishing authorization with Talexia that remains active for the duration of my subscription.
        </p>

        <div className="auth-signatures">
          <div className="auth-sig-field">
            <label className="field-label">Signed as</label>
            <input type="text" className="field-input" name="signed_as" placeholder="Full legal name" />
          </div>
          <div className="auth-sig-field">
            <label className="field-label">On behalf of brand</label>
            <div className="auto-populated">
              {brandName || "[Brand name from Section I]"} <em>— auto-populated</em>
            </div>
          </div>
          <div className="auth-sig-field">
            <label className="field-label">Submission date</label>
            <div className="auto-populated">
              {currentDate || "Loading date..."} <em>— auto-populated at submission</em>
            </div>
          </div>
          <div className="auth-sig-field">
            <label className="field-label">Talexia plan</label>
            <div className="auto-populated">
              {session?.subscription?.planCategory || session?.subscription?.planCode || "Active Plan"} <em>— auto-populated</em>
            </div>
          </div>
        </div>

        <label className="auth-checkbox">
          <input type="checkbox" name="authorization_confirmed" required />
          <span>
            <strong>I have read and agree.</strong> By checking this box, I confirm that I have read the authorization statement above and agree to its terms. I understand this constitutes a standing publishing authorization for the duration of my Talexia subscription.
          </span>
        </label>
      </div>

      <div className="submit-block">
        <button type="button" className="btn-save">Save &amp; continue later</button>
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </span>
          ) : (
            "Submit Brand Brief"
          )}
        </button>
        <p className="submit-note">
          On submission, a copy of this Brief will be emailed to you and to Talexia. Your Google Drive folder will be shared within one business day.
        </p>
      </div>
    </section>

  </form>
</div>

{/* ==================== FOOTER ==================== */}
<footer>
  <div className="footer-inner">
    <div className="footer-brand">Talexia<span className="dot">.</span>us</div>
    <div className="footer-note">Onboarding · Brand Brief · Questions? <a href="mailto:hello@talexia.us">hello@talexia.us</a></div>
  </div>
</footer>


    </div>
  );
}
