import React from 'react';
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
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-8">Our Process</h1>
        <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
          How Talexia produces editorial feed content for fine jewelry brands: onboarding once, then a monthly rhythm that requires nothing further from you.
        </p>
        
        <div className="grid gap-12 md:grid-cols-3 mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">1. Onboarding</h3>
            <p className="text-gray-600">We take the time to deeply understand your brand, aesthetics, and goals in our initial onboarding session.</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">2. Production</h3>
            <p className="text-gray-600">We produce high-quality, editorial-grade visual content tailored specifically for fine jewelry.</p>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">3. Monthly Rhythm</h3>
            <p className="text-gray-600">A seamless monthly delivery of your content, requiring no further daily input from your side.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
