"use client";

import { ShieldCheck, Mail, Link as LinkIcon } from "lucide-react";

interface SocialMediaAccessSectionProps {
  data: any;
  updateData: (fields: any) => void;
}

export function SocialMediaAccessSection({ data, updateData }: SocialMediaAccessSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">06 Social Media Access</h2>
          <p className="text-xs text-slate-500">How we securely connect to your accounts.</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-lime-400/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-lime-700" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Separate Secure Form</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You will receive a separate secure form to provide administrative access to your Instagram and Facebook business pages.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Check Your Email</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check your inbox for an email from <strong>talexia.media@gmail.com</strong> with instructions on how to grant permissions safely.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-400/10 flex items-center justify-center shrink-0">
              <LinkIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Why this is needed</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This allows us to schedule posts, manage comments, and track analytics on your behalf without needing your personal passwords.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-lime-400/20 bg-lime-400/5">
          <p className="text-xs text-lime-700/80 italic text-center">
            You don't need to do anything in this section now. Please click "Next" to continue.
          </p>
        </div>
      </div>
    </div>
  );
}
