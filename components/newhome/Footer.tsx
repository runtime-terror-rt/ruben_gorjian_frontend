import React from 'react';

export default function Footer() {
  return (
    <>
      <footer>
        <div className="footer-inner">
          <div className="footer-brand-block">
            <div className="footer-brand">Talexia<span className="dot">.</span>us</div>
            <p className="footer-tagline">Editorial visual production for fine jewelry brands. Produced, published, and held to a luxury standard.</p>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="#plans">Managed plans</a></li>
              <li><a href="#atelier">Atelier</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li><a href="#process">Our process</a></li>
              <li><a href="#work">Selected work</a></li>
              <li><a href="faq.html">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="/terms">Service policy</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="mailto:hello@talexia.us">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 Talexia. All rights reserved.</div>
          <div>All visuals produced to a luxury-editorial standard using proprietary brand-voice training.</div>
        </div>
      </footer>

    </>
  );
}
