import React from 'react';

export default function Navbar() {
  return (
    <>
<nav className="nav items-center justify-between">
  <a href="#" className="nav-brand">Talexia</a>
  <div className="nav-links">
    <a href="#work">Work</a>
    <a href="#process">Process</a>
    <a href="#plans">Plans</a>
    <a href="#atelier">Atelier</a>
    <a href="faq.html">FAQ</a>
    <a href="#consultation" className="nav-cta">Book a call</a>
  </div>
</nav>
    </>
  );
}
