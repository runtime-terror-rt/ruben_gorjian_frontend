import React from 'react';
import '@/app/page.css';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';

import { TERMS_VERSION } from '@/lib/constants';

export const metadata = {
  title: 'Service Policy & Terms of Service — Talexia',
  description: `Talexia's Service Policy and Terms of Service. Version ${TERMS_VERSION}, effective July 2026.`
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="talexia-wrapper">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
