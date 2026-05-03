"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Loader2, CreditCard } from "lucide-react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PlatformUpsellModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currentTotalAllowed: number;
}

const PLATFORM_UNIT_PRICE = 5;

export function PlatformUpsellModal({
  isOpen,
  onOpenChange,
  onSuccess,
  currentTotalAllowed,
}: PlatformUpsellModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // User can buy up to 2 additional slots (Total 3 platforms across the app)
  const maxAvailable: number = 2; 
  const totalAmount = quantity * PLATFORM_UNIT_PRICE;

  const handlePayNow = async () => {
    if (quantity <= 0) return;
    
    setLoading(true);
    try {
      const response = await apiPost<{ success?: boolean }, { addonPlatformQty: number }>(
        "/api/billing/addons/platforms/checkout",
        { addonPlatformQty: quantity }
      );

      if (response.success) {
        toast({
          title: "Payment Successful",
          description: `${quantity} extra platform slot${quantity > 1 ? "s" : ""} added successfully. $${totalAmount} has been charged to your account.`,
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error("Failed to activate platform addon");
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Something went wrong with the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-slate-950 border-slate-800 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-amber-500/20 rounded-2xl">
              <Share2 className="h-6 w-6 text-amber-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Expand Your Reach
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 text-lg leading-relaxed">
            Add extra platform slots to connect more of your social media accounts. You can add up to 2 additional slots.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Additional Platforms (Max {maxAvailable})
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="quantity"
                type="number"
                min={1}
                max={maxAvailable}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setQuantity(Math.min(maxAvailable, Math.max(1, val)));
                }}
                className="bg-slate-900 border-slate-700 text-white h-12 text-lg font-bold focus:ring-amber-400"
              />
              <div className="text-slate-500 font-medium italic">slots</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Price per Platform</span>
              <span className="text-white font-bold">${PLATFORM_UNIT_PRICE} / month</span>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Instant Payment</span>
                <div className="text-3xl font-black text-amber-400 tracking-tight">
                  ${totalAmount}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 text-right">
                Charged automatically<br/>to your balance
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button
            onClick={handlePayNow}
            disabled={loading || maxAvailable === 0}
            className="w-full h-14 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay & Activate
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-slate-500 hover:text-white hover:bg-transparent"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
