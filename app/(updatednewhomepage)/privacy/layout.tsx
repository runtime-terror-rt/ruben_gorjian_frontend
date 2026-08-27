import React from 'react';
import '@/app/page.css';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';

export const metadata = {
  title: 'Privacy Policy — Talexia',
  description: 'Talexia\'s Privacy Policy. How we collect, use, and protect your personal information.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="talexia-wrapper">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
