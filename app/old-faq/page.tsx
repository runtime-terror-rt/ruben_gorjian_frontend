"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/navbar";
import FooterSecondary from "@/components/footer-secondary";
import { apiGet } from "@/lib/api";

type Faq = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
};

type FaqListResponse = {
  success: boolean;
  data: Faq[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function FAQPage() {
  const [faqRows, setFaqRows] = useState<Faq[]>([]);
  const [faqLoaded, setFaqLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    apiGet<FaqListResponse>("/api/faq?pageType=FAQ_PAGE")
      .then((res) => {
        if (!isActive) return;
        const rows = Array.isArray(res?.data) ? res.data : [];
        const mapped: Faq[] = rows
          .filter((r) => r.isActive)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((r) => ({
            id: r.id,
            question: r.question,
            answer: r.answer,
            displayOrder: r.displayOrder ?? 0,
            isActive: true,
          }));
        setFaqRows(mapped);
      })
      .catch(() => {
        setFaqRows([]);
      })
      .finally(() => {
        if (isActive) {
          setFaqLoaded(true);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const accordionItems = useMemo(() => faqRows, [faqRows]);

  return (
    <main className="min-h-screen bg-white text-[#1f2230]">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <section
        id="faq"
        className="px-4 pb-16 pt-14 sm:pt-20"
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-5xl space-y-10 rounded-3xl border border-[#dfe2ec] bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777b86]">
            FAQs
          </p>
          <h2
            id="faq-heading"
            className="mt-2 text-3xl font-bold font-sora text-primary sm:text-4xl"
          >
            Questions teams ask before switching
          </h2>
          {accordionItems.length > 0 ? (
            <Accordion type="single" collapsible className="mt-6">
              {accordionItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={`faq-${item.id}`}
                  className="mb-6 rounded-full border border-[#ebedf4] px-6 py-4"
                >
                  <AccordionTrigger className="text-left text-sm font-medium">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-left text-sm text-[#55596a] pl-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : faqLoaded ? (
            <div className="rounded-3xl border border-[#e4e6ee] bg-[#f8fbff] p-8 text-center text-sm text-[#4f5160]">
              <p className="text-base font-semibold text-[#1f2230]">
                Our FAQ section is being updated.
              </p>
              <p className="mt-3">
                We don&apos;t have FAQ content available right now, but our team is ready to answer your questions. Please contact us for support or check back shortly.
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-[#5d657d]">Loading frequently asked questions...</p>
          )}
        </div>
      </section>

      <FooterSecondary />
    </main>
  );
}
