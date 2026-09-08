import React from 'react';
import '@/app/page.css';
import Navbar from '@/components/newhome/Navbar';
import Portfolio from '@/components/newhome/Portfolio';
import ClosingCta from '@/components/newhome/ClosingCta';
import Footer from '@/components/newhome/Footer';

export const metadata = {
  title: 'Selected Work — Talexia',
  description: 'A studio-composed aesthetic, held month after month. Selected visual production work for fine jewelry brands.',
  alternates: { canonical: 'https://talexia.us/work' }
};

export default function WorkPage() {
  return (
    <div className="talexia-wrapper">
      <Navbar />
      <div style={{ paddingTop: '40px' }}>
        <Portfolio />
      </div>
      <ClosingCta />
      <Footer />
    </div>
  );
}
