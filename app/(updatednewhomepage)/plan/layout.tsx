import React from 'react';
import './plan.css';
import Navbar from '@/components/newhome/Navbar';
import Footer from '@/components/newhome/Footer';

export const metadata = {
  title: 'Plans — Talexia',
  description: 'Talexia\'s editorial visual production plans for fine jewelry brands. Essentials, Signature, and Atelier by consultation.',
  alternates: { canonical: 'https://talexia.us/plan' }
};

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="talexia-wrapper">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
