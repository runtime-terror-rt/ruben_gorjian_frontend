import React from 'react';
import '@/app/page.css';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';

export const metadata = {
  title: 'Our Process — Talexia',
  description: 'How Talexia produces editorial feed content for fine jewelry brands: onboarding once, then a monthly rhythm that requires nothing further from you.',
  alternates: {
    canonical: 'https://talexia.us/process',
  }
};

export default function ProcessPage() {
  return (
    <div className='talexia-wrapper'>
      <Navbar />
      
      <section className="how-we-work" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="how-header">
            <h1 className="section-title">Our Process</h1>
            <p className="section-lede" style={{ margin: '20px auto 0' }}>
              How Talexia produces editorial feed content for fine jewelry brands: onboarding once, then a monthly rhythm that requires nothing further from you.
            </p>
          </div>
          
          <div className="process-steps" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="step">
              <div className="step-num">1</div>
              <h3 className="step-title">Onboarding</h3>
              <p className="step-desc">We take the time to deeply understand your brand, aesthetics, and goals in our initial onboarding session.</p>
            </div>
            
            <div className="step">
              <div className="step-num">2</div>
              <h3 className="step-title">Production</h3>
              <p className="step-desc">We produce high-quality, editorial-grade visual content tailored specifically for fine jewelry.</p>
            </div>
            
            <div className="step">
              <div className="step-num">3</div>
              <h3 className="step-title">Monthly Rhythm</h3>
              <p className="step-desc">A seamless monthly delivery of your content, requiring no further daily input from your side.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
