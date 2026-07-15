import React from 'react';

export default function Navbar() {
  return (
    <>
<nav className="nav items-center justify-between">
  <a href="/newhome" className="nav-brand">Talexia</a>
  <div className="nav-links">
    <a href="/newhome#work">Work</a>
    <a href="/newhome#process">Process</a>
    <a href="/newhome#plans">Plans</a>
    <a href="/newhome#atelier">Atelier</a>
    <a href="/newhome#faq">FAQ</a>
    <a href="/newhome#consultation" className="nav-cta">Book a call</a>
  </div>
</nav>
    </>
  );
}
