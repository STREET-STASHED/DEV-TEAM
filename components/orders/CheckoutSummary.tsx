'use client';

import { feeConfig } from '@/lib/feeConfig';
import { calculateFees } from '@/lib/fees';
import { useCallback, useEffect, useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutSummaryProps {
  items: CartItem[];
  distanceMiles: number;
  onSummaryChange: (_summary: {
    subtotal: number;
    stashedSupportFee: number;
    total: number;
    distanceMiles: number;
    etaMinutes: number;
    driverPay: number;
    platformMargin: number;
  }) => void;
}

export function CheckoutSummary({
  items,
  distanceMiles,
  onSummaryChange
}: CheckoutSummaryProps) {
  const [fees, setFees] = useState<{
    stashedSupportFee: {
      total: number
      buyerShare: number
      sellerShare: number
    }
    driverCompensation: {
      driverPay: number
      platformMargin: number
      percentage: number
    }
    meta: {
      distanceMiles: number
      etaMinutes: number
      appliedBonuses: string[]
      feeTierDescription: string
      totalOrderAmount: number
    }
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateFeesForOrder = useCallback(async () => {
    if (distanceMiles <= 0) return;

    setIsCalculating(true);
    setError(null);

    try {
      // For now, use a default ETA (in production, this would come from Google Maps)
      const etaMinutes = Math.round((distanceMiles / feeConfig.averageSpeedMph) * 60);

      const feeCalculation = calculateFees({
        distanceMiles,
        etaMinutes,
        merchSubtotal: subtotal
      });

      setFees(feeCalculation);

      // Notify parent component
      onSummaryChange({
        subtotal,
        stashedSupportFee: feeCalculation.stashedSupportFee.buyerShare,
        total: feeCalculation.meta.totalOrderAmount,
        distanceMiles,
        etaMinutes,
        driverPay: feeCalculation.driverCompensation.driverPay,
        platformMargin: feeCalculation.driverCompensation.platformMargin
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate fees');
    } finally {
      setIsCalculating(false);
    }
  }, [distanceMiles, subtotal, onSummaryChange]);

  useEffect(() => {
    if (distanceMiles > 0) {
      calculateFeesForOrder();
    }
  }, [calculateFeesForOrder, distanceMiles]);

  if (isCalculating) {
    return (
      <div className="bg-ink-900 border border-ink-800 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-ink-800 rounded mb-4"></div>
        <div className="h-4 bg-ink-800 rounded mb-2"></div>
        <div className="h-4 bg-ink-800 rounded mb-2"></div>
        <div className="h-4 bg-ink-800 rounded mb-4"></div>
        <div className="h-8 bg-ink-800 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-ink-900 border border-red-500/30 rounded-lg p-6">
        <div className="text-red-400 text-sm mb-2">⚠️ Fee Calculation Error</div>
        <div className="text-ink-400 text-sm">{error}</div>
        <button
          onClick={calculateFeesForOrder}
          className="mt-3 text-brand-400 hover:text-brand-300 text-sm underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!fees) {
    return (
      <div className="bg-ink-900 border border-ink-800 rounded-lg p-6">
        <div className="text-ink-400 text-sm">Calculating fees...</div>
      </div>
    );
  }

  return (
    <div className="bg-ink-900 border border-ink-800 rounded-lg p-6 shadow-card">
      <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-ink-300">
            <span>{item.name} × {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-800 pt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-ink-300">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {/* Stashed Support Fee - Clean and Simple */}
        <div className="bg-ink-800/50 rounded-lg p-3">
          <div className="flex justify-between text-white font-medium mb-2">
            <span>Stashed Support Fee</span>
            <span>${fees.stashedSupportFee.buyerShare.toFixed(2)}</span>
          </div>

          <div className="text-xs text-ink-400 text-center">
            This fee helps cover driver pay and delivery operations
          </div>
        </div>

        {/* Distance & ETA */}
        {fees.meta.distanceMiles > 0 && (
          <div className="flex justify-between text-ink-300 text-sm">
            <span>Distance & ETA</span>
            <span>
              ~{fees.meta.distanceMiles.toFixed(1)} mi, ~{fees.meta.etaMinutes} min
            </span>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-ink-700 pt-4 flex justify-between items-center text-2xl font-bold text-brand-400">
          <span>Order Total</span>
          <span>${fees.meta.totalOrderAmount.toFixed(2)}</span>
        </div>

        {/* Trust Message */}
        <div className="mt-4 p-3 bg-ink-800/30 rounded-lg">
          <div className="text-xs text-ink-400 text-center">
            <div className="text-brand-400 font-medium mb-1">Fast & Fair Delivery</div>
            <div className="text-ink-300">
              Your Stashed Support Fee ensures drivers are fairly compensated and orders arrive quickly and safely.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
