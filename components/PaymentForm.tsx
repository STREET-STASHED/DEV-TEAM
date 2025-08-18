import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCardIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { getStripe } from "../lib/stripe";

interface PaymentFormProps {
  amount: number;
  currency?: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = "usd",
  orderId,
  buyerId,
  sellerId,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    PaymentMethod[]
  >([]);
  const [useSavedMethod, setUseSavedMethod] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<
    "payment" | "processing" | "success" | "error"
  >("payment");

  // Format amount for display
  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Handle payment submission
  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    setStep("processing");

    try {
      // Create payment intent on the server
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          buyerId,
          sellerId,
          paymentMethodId: useSavedMethod ? paymentMethod?.id : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, paymentIntentId } = await response.json();

      if (useSavedMethod && paymentMethod) {
        // Use saved payment method
        await confirmPaymentWithSavedMethod(clientSecret, paymentMethod.id);
      } else {
        // Use Stripe Elements for new payment method
        await confirmPaymentWithStripe(clientSecret);
      }

      setStep("success");
      onSuccess(paymentIntentId);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "Payment failed");
      setStep("error");
      onError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm payment with saved payment method
  const confirmPaymentWithSavedMethod = async (
    clientSecret: string,
    paymentMethodId: string,
  ) => {
    const stripe = await getStripe();
    if (!stripe) throw new Error("Stripe failed to load");

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  // Confirm payment with Stripe Elements
  const confirmPaymentWithStripe = async (clientSecret: string) => {
    const stripe = await getStripe();
    if (!stripe) throw new Error("Stripe failed to load");

    const { error } = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?orderId=${orderId}`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  // Load saved payment methods
  useEffect(() => {
    const loadSavedMethods = async () => {
      try {
        // In production, this would fetch from your backend
        const mockMethods: PaymentMethod[] = [
          {
            id: "pm_1",
            type: "card",
            card: {
              brand: "visa",
              last4: "4242",
              expMonth: 12,
              expYear: 2025,
            },
          },
        ];
        setSavedPaymentMethods(mockMethods);
      } catch (err) {
        console.error("Failed to load saved payment methods:", err);
      }
    };

    void loadSavedMethods();
  }, []);

  // Render payment step
  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Order Summary
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Order #{orderId.slice(0, 8)}</span>
          <span className="text-2xl font-bold text-gray-900">
            {formatAmount(amount, currency)}
          </span>
        </div>
      </div>

      {/* Escrow Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Secure Escrow Protection
          </span>
        </div>
        <p className="text-sm text-blue-700">
          Your payment is held securely until delivery is confirmed. Funds are
          only released to the seller after you verify receipt.
        </p>
      </div>

      {/* Saved Payment Methods */}
      {savedPaymentMethods.length > 0 && (
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useSavedMethod}
              onChange={(e) => setUseSavedMethod(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Use saved payment method
            </span>
          </label>

          {useSavedMethod && (
            <div className="space-y-2">
              {savedPaymentMethods.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod?.id === method.id}
                    onChange={() => setPaymentMethod(method)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {method.card?.brand} •••• {method.card?.last4}
                    </span>
                    <span className="text-xs text-gray-500">
                      Expires {method.card?.expMonth}/{method.card?.expYear}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Payment Method */}
      {!useSavedMethod && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <LockClosedIcon className="h-4 w-4" />
            <span>Secure payment powered by Stripe</span>
          </div>

          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <div className="text-center text-gray-500">
              <CreditCardIcon className="h-12 w-12 mx-auto mb-2" />
              <p>Payment form will be loaded here</p>
              <p className="text-xs">
                In production, this integrates with Stripe Elements
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => void handlePayment()}
          disabled={isLoading || (useSavedMethod && !paymentMethod)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading
            ? "Processing..."
            : `Pay ${formatAmount(amount, currency)}`}
        </button>
      </div>
    </div>
  );

  // Render processing step
  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Processing Payment
      </h3>
      <p className="text-gray-600">
        Please wait while we process your payment securely...
      </p>
    </div>
  );

  // Render success step
  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Payment Successful!
      </h3>
      <p className="text-gray-600 mb-4">
        Your payment has been processed and is being held securely in escrow.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
        <p>• Payment held securely until delivery confirmation</p>
        <p>• You&apos;ll receive updates on your order status</p>
        <p>• Funds released only after delivery verification</p>
      </div>
    </div>
  );

  // Render error step
  const renderErrorStep = () => (
    <div className="text-center py-8">
      <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Payment Failed
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <div className="flex space-x-3">
        <button
          onClick={() => setStep("payment")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
        <p className="text-gray-600">Complete your order with secure payment</p>
      </div>

      {step === "payment" && renderPaymentStep()}
      {step === "processing" && renderProcessingStep()}
      {step === "success" && renderSuccessStep()}
      {step === "error" && renderErrorStep()}
    </motion.div>
  );
};

export default PaymentForm;
