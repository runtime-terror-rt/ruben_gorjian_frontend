"use client";

import { useActionState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import FooterSecondary from "@/components/footer-secondary";
import contactImage from "@/components/assets/contact.svg";
import { toast } from "sonner";
import { submitContactForm, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle", message: "" };

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState
  );

  // Show toast and reset form on success/error transitions
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

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
                ref={formRef}
                action={formAction}
                className="flex flex-col gap-6 rounded-xl border-2 border-indigo-800/10 p-4 sm:p-6 md:p-8 shadow-lg"
              >
                {/* Error */}
                {state.status === "error" && (
                  <p className="rounded-xl border border-[#f1cbc1] bg-[#fff1ec] px-4 py-2 text-sm text-[#b53f2a]">
                    {state.message}
                  </p>
                )}

                {/* Success */}
                {state.status === "success" && (
                  <p className="rounded-xl border border-[#ced9f6] bg-[#edf2ff] px-4 py-2 text-sm text-[#2f4587]">
                    {state.message}
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    placeholder="Enter your full name"
                    className="h-12 rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">
                    Business Name
                  </label>
                  <input
                    name="businessName"
                    placeholder="Enter your business name"
                    className="h-12 rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 w-full rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">
                    Website or @Handle
                  </label>
                  <input
                    name="websiteOrHandle"
                    placeholder="Enter your website or social handle"
                    className="h-12 w-full rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#1f2230]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Tell us what you want Talexia to handle for you"
                    className="w-full resize-none rounded-xl border border-[#d8dce8] px-4 py-3 text-sm outline-none focus:border-[#4a5dff] focus:ring-2 focus:ring-[#4a5dff]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-12 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? "Sending..." : "Send request"}
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
