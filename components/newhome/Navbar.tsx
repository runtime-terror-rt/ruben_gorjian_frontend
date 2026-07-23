import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <>
      <nav className="nav">
        <a href="/" className="nav-brand">Talexia</a>
        <div className="nav-links">
          <a href="/#work">Work</a>
          <a href="/#process">Process</a>
          <a href="/plan">Plans</a>
          <a href="/newhome/case-studies">Case Studies</a>
          <a href="/#atelier">Atelier</a>
          <a href="/newhome/faq">FAQ</a>
          {/* <a href="/brandbrief">Brand Brief</a> */}
          <Link href="/login" className="nav-signin">Sign In</Link>
          <a href="/newhome/contact" className="nav-cta">Contact</a>
        </div>
      </nav>
    </>
  );
}
