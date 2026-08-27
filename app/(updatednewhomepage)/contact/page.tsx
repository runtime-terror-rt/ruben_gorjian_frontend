import React from 'react';
import ContactClient from './ContactClient';
import './contact.css';

export const metadata = {
  title: 'Contact Talexia — Editorial Visual Production for Fine Jewelry',
  description: "Get in touch with Talexia. Questions about managed plans, Atelier commissions, or working together — we'll respond personally.",
  alternates: { canonical: 'https://talexia.us/contact' }
};

export default function ContactPage() {
  return <ContactClient />;
}
