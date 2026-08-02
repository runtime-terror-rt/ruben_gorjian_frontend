"use client";
import React, { useState, useRef } from 'react';
import Script from 'next/script';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';
import Link from 'next/link';
import '../newhome/newhome.css';
import './contact.css';

// Declare turnstile for TypeScript
declare global {
  interface Window {
    turnstile?: {
      reset: () => void;
    };
  }
}

export default function ContactClient() {
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    
    // Basic client-side validation
    const required = ['company', 'fullname', 'email', 'subject', 'message'];
    for (const field of required) {
      if (!formData.get(field)?.toString().trim()) {
        setStatus({ type: 'error', msg: 'Please complete all required fields before sending.' });
        return;
      }
    }

    const email = formData.get('email')?.toString().trim() || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: 'error', msg: 'Please enter a valid email address.' });
      return;
    }

    const token = formData.get('cf-turnstile-response');
    if (!token) {
      setStatus({ type: 'error', msg: 'Please complete the verification, then send again.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      // Simulated delay since there is no backend connection right now
      await new Promise(resolve => setTimeout(resolve, 1000));

      formRef.current.reset();
      // Reset turnstile
      if (window.turnstile) {
        try { window.turnstile.reset(); } catch (err) {}
      }
      setStatus({ type: 'success', msg: "Thank you — your message has been sent. We'll reply personally, usually within two business days." });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Something went wrong sending your message. Please try again in a moment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="talexia-wrapper">
      <Navbar />

      <section className="contact-hero">
        <div className="section-eyebrow">Get in touch</div>
        <h1 className="contact-hero-title">Let's talk about <em>your collection.</em></h1>
        <p className="contact-hero-sub">Questions about a plan, an Atelier commission, or whether Talexia is the right fit — send a note and we'll reply personally.</p>
      </section>

      <section className="contact-body">
        <div className="contact-wrap">
          {/* LEFT: info */}
          <div className="contact-info">
            <h2 className="contact-info-title">Speak with <em>the studio.</em></h2>
            <p className="contact-info-text">Every message reaches us directly — there's no call center and no ticket queue. Tell us about your brand and what you're looking for, and we'll respond with a considered reply, usually within two business days.</p>

            <div className="contact-detail">
              <div className="contact-detail-label">How to reach us</div>
              <div className="contact-detail-value">Use the form and we'll reply personally, usually within two business days.</div>
            </div>

            <div className="contact-detail">
              <div className="contact-detail-label">Prefer to explore first?</div>
              <div className="contact-detail-value">
                <Link href="/plan">View managed plans</Link> &nbsp;·&nbsp; <Link href="/faq">Read the FAQ</Link>
              </div>
            </div>

            <p className="contact-note">For existing clients: for the fastest handling of a factual correction, please include your brand name and the piece in question so we can locate it in your current cycle.</p>
          </div>

          {/* RIGHT: form */}
          <div className="contact-form-card">
            {status && (
              <div className={`form-status ${status.type === 'success' ? 'success' : 'error'}`} style={{ display: 'block' }}>
                {status.msg}
              </div>
            )}

            <form id="contactForm" ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label className="field-label" htmlFor="company">Company / Business name <span className="req">◆</span></label>
                <input className="field-input" type="text" id="company" name="company" required maxLength={120} autoComplete="organization" />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="fullname">Full name <span className="req">◆</span></label>
                <input className="field-input" type="text" id="fullname" name="fullname" required maxLength={120} autoComplete="name" />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="email">Email <span className="req">◆</span></label>
                <input className="field-input" type="email" id="email" name="email" required maxLength={180} autoComplete="email" />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="subject">Subject <span className="req">◆</span></label>
                <input className="field-input" type="text" id="subject" name="subject" required maxLength={160} />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="message">Message <span className="req">◆</span></label>
                <textarea className="field-textarea" id="message" name="message" required maxLength={4000}></textarea>
              </div>

              {/* Honeypot: real users never see or fill this; bots often do */}
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="website_url">Do not fill this field</label>
                <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
              </div>

              {/* Cloudflare Turnstile widget */}
              <div className="turnstile-wrap">
                <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "YOUR_TURNSTILE_SITE_KEY"} data-theme="light"></div>
              </div>

              <button type="submit" className="form-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>

              <p className="form-consent">By sending this message you agree to Talexia's <Link href="/privacy">Privacy Policy</Link>. This form is protected by Cloudflare Turnstile.</p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
    </div>
  );
}
