"use client";

import { FormEvent, Suspense } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import FooterSecondary from "@/components/footer-secondary";
import contactImage from "@/components/assets/contact.svg";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

type ContactPayload = {
  fullName: string;
  businessName: string;
  email: string;
  websiteOrHandle?: string;
  interests: string[];
  // postsPerMonth: string;
  message?: string;
  source?: string;
};

type ContactResponse = {
  success: boolean;
  data: {
    submissionId: string;
  };
};

export default function ContactPage() {
  // const mutation = useMutation({
  //   mutationFn: (payload: ContactPayload) =>
  //     apiPost<ContactResponse>("/api/contact", payload),
  // });
  const mutation = useMutation({
    mutationFn: (payload: ContactPayload) =>
      apiPost<ContactResponse>("/api/contact", payload),

    onSuccess: (data) => {
      toast.success("Thank you! Your message has been sent successfully.");
    },

    onError: (error: any) => {
      toast.error(error?.message || "Unable to submit contact form right now.");
    },
  });

  async function handleContactSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: ContactPayload = {
      fullName: (data.get("fullName") as string)?.trim(),
      businessName: (data.get("businessName") as string)?.trim(),
      email: (data.get("email") as string)?.trim(),
      websiteOrHandle: (data.get("websiteOrHandle") as string)?.trim(),
      message: (data.get("message") as string)?.trim(),
      interests: [],
      // postsPerMonth: "100",
      source: "google-search",
    };

    mutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return (
    <main className="min-h-screen bg-white text-[#1f2230]">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <section
        id="contact"
        className="px-4 pb-16 pt-14 sm:pt-20"
        aria-labelledby="contact-heading"
      >
        <div className="mx-auto max-w-6xl gap-6 rounded-3xl border border-[#dfe2ec] bg-white p-6 sm:p-8 md:p-10">
          <div className="space-y-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#777b86]">
              Contact sales
            </p>

            <h2
              id="contact-heading"
              className="mt-2 text-3xl font-bold font-sora text-primary sm:text-4xl"
            >
              Tell us about your brand
            </h2>

            <p className="mt-3 text-sm text-secondary">
              Share your content volume and goals. We&apos;ll recommend the
              right Talexia setup for your workflow.
            </p>

            <div className="grid w-full gap-6 md:grid-cols-[1.2fr_1fr]">
              {/* Image */}
              <div className="h-full w-full rounded-xl border border-indigo-800/10">
                <Image
                  src={contactImage}
                  alt="Contact Talexia"
                  className="h-full w-full rounded-xl object-contain object-center"
                  width={600}
                  height={600}
                />
              </div>

              {/* Form */}
              <form
                className="flex flex-col gap-6 rounded-xl border-2 border-indigo-800/10 p-4 sm:p-6 md:p-8 shadow-lg"
                onSubmit={handleContactSubmit}
              >
                {/* Error */}
                {mutation.isError && (
                  <p className="rounded-xl border border-[#f1cbc1] bg-[#fff1ec] px-4 py-2 text-sm text-[#b53f2a]">
                    {(mutation.error as any)?.message ||
                      "Unable to submit contact form right now."}
                  </p>
                )}

                {/* Success */}
                {mutation.isSuccess && (
                  <p className="rounded-xl border border-[#ced9f6] bg-[#edf2ff] px-4 py-2 text-sm text-[#2f4587]">
                    Thank you for your message! We've received your request and will get back to you soon.
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">Full Name</label>
                  <input
                    name="fullName"
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">Business Name</label>
                  <input
                    name="businessName"
                    placeholder="Enter your business name"
                    className="h-12 rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 w-full rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">Website or @Handle</label>
                  <input
                    name="websiteOrHandle"
                    placeholder="Enter your website or social handle"
                    className="h-12 w-full rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell us what you want Talexia to handle for you"
                    className="w-full resize-none rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="h-12 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {mutation.isPending ? "Sending..." : "Send request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <FooterSecondary />
    </main>
  );
}
