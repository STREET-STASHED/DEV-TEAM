'use client';

import { useState } from 'react';
import { calculateFees, getDriverPayBreakdown, getExampleCalculations } from '@/lib/fees';
import { feeConfig } from '@/lib/feeConfig';

export default function TestFeesPage() {
  const [distance, setDistance] = useState(2.0);
  const [hour, setHour] = useState(14);
  const [merchSubtotal, setMerchSubtotal] = useState(100);
  const [results, setResults] = useState<{
    fees?: {
      stashedSupportFee: {
        total: number;
        buyerShare: number;
        sellerShare: number;
      };
      driverCompensation: {
        driverPay: number;
        platformMargin: number;
        percentage: number;
      };
      meta: {
        distanceMiles: number;
        etaMinutes: number;
        appliedBonuses: string[];
        feeTierDescription: string;
        totalOrderAmount: number;
      };
    };
    breakdown?: {
      base: number;
      mileage: number;
      bonuses: number;
      total: number;
    };
    etaMinutes?: number;
    error?: string;
  } | null>(null);

  const calculateFeesForTest = () => {
    try {
      const etaMinutes = Math.round((distance / feeConfig.averageSpeedMph) * 60);

      const fees = calculateFees({
        distanceMiles: distance,
        etaMinutes,
        merchSubtotal
      });

      const breakdown = getDriverPayBreakdown(distance, hour);

      setResults({ fees, breakdown, etaMinutes });
    } catch (error) {
      console.error('Error calculating fees:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const examples = getExampleCalculations();

  return (
    <div className="min-h-screen bg-ink-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Full Stashed Support Fee Test</h1>

        <div className="bg-ink-900 border border-ink-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Test Parameters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-ink-300 text-sm mb-2">Distance (miles)</label>
              <input
                type="number"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-ink-800 border border-ink-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-ink-300 text-sm mb-2">Hour (0-23)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-ink-800 border border-ink-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-ink-300 text-sm mb-2">Merchandise Subtotal</label>
              <input
                type="number"
                step="0.01"
                value={merchSubtotal}
                onChange={(e) => setMerchSubtotal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-ink-800 border border-ink-700 rounded text-white"
              />
            </div>
          </div>

          <button
            onClick={calculateFeesForTest}
            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            Calculate Fees
          </button>
        </div>

        {results && (
          <div className="space-y-6">
            {results.error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <div className="text-red-400 text-lg mb-2">⚠️ Error</div>
                <div className="text-ink-300">{results.error}</div>
              </div>
            ) : results.fees ? (
              <>
                {/* Stashed Support Fee Breakdown */}
                <div className="bg-ink-900 border border-ink-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Stashed Support Fee Breakdown</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-400">${results.fees.stashedSupportFee.total.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Total Support Fee</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-400">${results.fees.stashedSupportFee.buyerShare.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Buyer Share (50%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning-400">${results.fees.stashedSupportFee.sellerShare.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Seller Share (50%)</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg text-brand-400 font-medium">
                      Full Support Fee: ${results.fees.stashedSupportFee.total.toFixed(2)}
                    </div>
                    <div className="text-ink-400 text-sm mt-1">
                      Covers driver pay + platform margin + operations
                    </div>
                  </div>
                </div>

                {/* Driver Compensation */}
                <div className="bg-ink-900 border border-ink-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Driver Compensation</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-400">${results.fees.driverCompensation.driverPay.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Driver Pay</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-ink-400">${results.fees.driverCompensation.platformMargin.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Platform Margin</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{results.fees.driverCompensation.percentage}%</div>
                      <div className="text-ink-400 text-sm">Driver Gets</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg text-brand-400 font-medium">
                      Driver Take-Home: ${results.fees.driverCompensation.driverPay.toFixed(2)}
                    </div>
                    <div className="text-ink-400 text-sm mt-1">
                      {results.fees.driverCompensation.percentage}% of total support fee
                    </div>
                  </div>
                </div>

                {/* Driver Pay Breakdown */}
                {results.breakdown && (
                  <div className="bg-ink-900 border border-ink-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Driver Pay Breakdown</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-brand-400">${results.breakdown.base.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Base</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-400">${results.breakdown.mileage.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Mileage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand-400">${results.breakdown.bonuses.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Bonuses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">${results.breakdown.total.toFixed(2)}</div>
                      <div className="text-ink-400 text-sm">Total</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg text-brand-400 font-medium">
                      Expected Payout: ${results.breakdown.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                )}

                {/* Complete Fee Breakdown */}
                <div className="bg-ink-900 border border-ink-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Complete Fee Breakdown</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-ink-300">Distance:</span>
                      <span className="text-white font-medium">{results.fees.meta.distanceMiles.toFixed(1)} miles</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-ink-300">ETA:</span>
                      <span className="text-white font-medium">{results.etaMinutes} minutes</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-ink-300">Merchandise Subtotal:</span>
                      <span className="text-white font-medium">${merchSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-ink-700 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-ink-300">Stashed Support Fee (Buyer):</span>
                        <span className="text-brand-400 font-medium">${results.fees.stashedSupportFee.buyerShare.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-ink-700 pt-4">
                      <div className="flex justify-between items-center text-lg font-bold text-brand-400">
                        <span>Total Order Amount:</span>
                        <span>${results.fees.meta.totalOrderAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applied Bonuses */}
                {results.fees.meta.appliedBonuses.length > 0 && (
                  <div className="bg-ink-900 border border-ink-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Applied Bonuses</h3>
                    <div className="space-y-2">
                      {results.fees.meta.appliedBonuses.map((bonus: string, index: number) => (
                        <div key={index} className="text-brand-400 text-center">
                          🎯 {bonus}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fee Tier Description */}
                <div className="bg-ink-900 border border-ink-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Fee Tier</h3>
                  <div className="text-center">
                    <div className="text-brand-400 font-medium">
                      {results.fees.meta.feeTierDescription}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-ink-400">
                Click &quot;Calculate Fees&quot; to see the breakdown
              </div>
            )}
          </div>
        )}

        {/* Example Calculations */}
        <div className="bg-ink-900 border border-ink-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Example Calculations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700">
                  <th className="text-left text-ink-300 py-2">Scenario</th>
                  <th className="text-right text-ink-300 py-2">Support Fee</th>
                  <th className="text-right text-ink-300 py-2">Buyer (50%)</th>
                  <th className="text-right text-ink-300 py-2">Seller (50%)</th>
                  <th className="text-right text-ink-300 py-2">Driver (75%)</th>
                  <th className="text-right text-ink-300 py-2">Platform (25%)</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((example, index) => (
                  <tr key={index} className="border-b border-ink-800">
                    <td className="text-ink-300 py-2">{example.scenario}</td>
                    <td className="text-right text-white py-2">${example.supportFee.toFixed(2)}</td>
                    <td className="text-right text-success-400 py-2">${example.buyerShare.toFixed(2)}</td>
                    <td className="text-right text-warning-400 py-2">${example.sellerShare.toFixed(2)}</td>
                    <td className="text-right text-brand-400 py-2">${example.driverPay.toFixed(2)}</td>
                    <td className="text-right text-ink-400 py-2">${example.platformMargin.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Concepts */}
        <div className="bg-ink-900 border border-ink-800 rounded-lg p-6 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Key Concepts</h3>
          <div className="text-ink-300 text-sm space-y-2">
            <div>• <strong>Stashed Support Fee</strong>: Covers everything (driver pay + platform margin + operations)</div>
            <div>• <strong>Buyer Share</strong>: 50% of total support fee (capped at $12)</div>
            <div>• <strong>Seller Share</strong>: 50% of total support fee (capped at $20)</div>
            <div>• <strong>Driver Pay</strong>: 75% of total support fee (guaranteed fair compensation)</div>
            <div>• <strong>Platform Margin</strong>: 25% of total support fee (covers operations)</div>
            <div>• <strong>Fair Split</strong>: Both buyer and seller contribute to platform sustainability</div>
          </div>
        </div>
      </div>
    </div>
  );
}
