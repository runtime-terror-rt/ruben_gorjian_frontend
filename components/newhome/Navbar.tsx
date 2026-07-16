import React from 'react';

export default function Navbar() {
  return (
    <>
      <nav className="nav">
        <a href="/newhome" className="nav-brand">Talexia</a>
        <div className="nav-links">
          <a href="/newhome#work">Work</a>
          <a href="/newhome#process">Process</a>
          <a href="/plan">Plans</a>
          <a href="/newhome#atelier">Atelier</a>
          <a href="/newhome/faq">FAQ</a>
          <a href="/brandbrief">Brand Brief</a>
          <a href="/newhome/contact" className="nav-cta">Contact</a>
        </div>
      </nav>
    </>
  );
}
