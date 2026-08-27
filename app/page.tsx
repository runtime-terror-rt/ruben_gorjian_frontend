import React from 'react';
import './page.css';
import Navbar from '@/components/newhome/Navbar';
import HeroIvoryEditorial from '@/components/newhome/HeroIvoryEditorial';
import WhatWeDo from '@/components/newhome/WhatWeDo';
import Portfolio from '@/components/newhome/Portfolio';
import WhatWeOffer from '@/components/newhome/WhatWeOffer';
import HowWeWorkCatalogDriven from '@/components/newhome/HowWeWorkCatalogDriven';
import WhatWeDonTDo from '@/components/newhome/WhatWeDonTDo';
import Advantages from '@/components/newhome/Advantages';
import PlansPreview from '@/components/newhome/PlansPreview';
import Atelier from '@/components/newhome/Atelier';
import FaqPreview from '@/components/newhome/FaqPreview';
import ClosingCta from '@/components/newhome/ClosingCta';
import Footer from '@/components/newhome/Footer';

export const metadata = {
  title: 'Talexia — Editorial Visual Production for Fine Jewelry',
  description: 'Editorial-grade feed content for fine jewelry brands. Produced, published, and held to a luxury standard.',
  alternates: { canonical: 'https://talexia.us/' }
};

export default function HomePage() {
  return (
    <div className='talexia-wrapper'>
      <Navbar />
      <HeroIvoryEditorial />
      <WhatWeDo />
      <Portfolio />
      <WhatWeOffer />
      <HowWeWorkCatalogDriven />
      <WhatWeDonTDo />
      <Advantages />
      <PlansPreview />
      <Atelier />
      <FaqPreview />
      <ClosingCta />
      <Footer />
    </div>
  );
}
