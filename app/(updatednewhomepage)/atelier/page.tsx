import React from 'react';
import '@/app/page.css';
import Navbar from '@/components/newhome/Navbar';
import Atelier from '@/components/newhome/Atelier';
import ClosingCta from '@/components/newhome/ClosingCta';
import Footer from '@/components/newhome/Footer';

export const metadata = {
  title: 'Atelier — Talexia',
  description: 'Bespoke commissions for signature pieces, flagship collections, and high-jewelry houses.',
  alternates: { canonical: 'https://talexia.us/atelier' }
};

export default function AtelierPage() {
  return (
    <div className="talexia-wrapper">
      <Navbar />
      <div style={{ paddingTop: '40px' }}>
        <Atelier />
      </div>
      <ClosingCta />
      <Footer />
    </div>
  );
}
