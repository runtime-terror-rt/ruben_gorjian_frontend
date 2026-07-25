"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Loader2, CreditCard } from "lucide-react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface VideoSessionUpsellModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hasAddon?: boolean;
}

const UNIT_PRICE = 495;

export function VideoSessionUpsellModal({
  isOpen,
  onOpenChange,
  hasAddon = false,
}: VideoSessionUpsellModalProps) {
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const totalAmount = hours * UNIT_PRICE;

  const handlePayNow = async () => {
    setLoading(true);
    try {
      const response = await apiPost<{ checkoutUrl: string }, { videoSessionHours: number }>(
        "/api/billing/addons/video-session/checkout",
        { videoSessionHours: hours }
      );

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      toast({
        title: "Checkout Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-[#ffffff] border-[#d9d4c9]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <Video className="h-6 w-6 text-indigo-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#14110c]">
              {hasAddon ? "Add More Video Hours" : "Upgrade to Video"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-[#6b6b6b] text-lg leading-relaxed">
            {hasAddon 
              ? "You've used all your video session hours. Add more to keep creating amazing content."
              : "Your current plan doesn't include video sessions. Add them now to bring your products to life."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="hours" className="text-[#14110c] font-bold uppercase tracking-widest text-[10px]">
              Number of Hours
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="hours"
                type="number"
                min={1}
                max={24}
                value={hours}
                onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-[#e6e1d8] border-[#d9d4c9] text-[#14110c] h-12 text-lg font-bold focus:ring-[#b08d3e]"
              />
              <div className="text-[#6b6b6b] font-medium">hours</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#e6e1d8]/50 border border-[#d9d4c9] space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b6b6b]">Unit Price</span>
              <span className="text-[#14110c] font-bold">${UNIT_PRICE} / hour</span>
            </div>
            <div className="h-px bg-[#e6e1d8]" />
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[#6b6b6b] text-xs font-bold uppercase tracking-widest">Total Amount</span>
                <div className="text-3xl font-black text-[#b08d3e] tracking-tight">
                  ${totalAmount.toLocaleString()}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                Tax calculated at checkout
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button
            onClick={handlePayNow}
            disabled={loading}
            className="w-full h-14 bg-[#b08d3e] hover:bg-[#b08d3e] text-[#14110c] font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Now
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-[#14110c] hover:bg-transparent"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
