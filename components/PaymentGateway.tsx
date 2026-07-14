
import React, { useState } from 'react';

interface PaymentGatewayProps {
    amount: number;
    currency?: string;
    onSuccess?: (transactionId: string) => void;
    onError?: (error: string) => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
    amount,
    currency = 'INR',
    onSuccess,
    onError
}) => {
    const [loading, setLoading] = useState(false);

    // Check for environment variable configuration
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Mock payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (stripeKey || paypalClientId) {
                onSuccess?.(`txn_${Date.now()}`);
            } else {
                // Simulate success for demo purposes even without keys
                onSuccess?.(`demo_txn_${Date.now()}`);
            }
        } catch (err) {
            onError?.('Payment processing error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-4">Secure Payment</h3>
            <div className="mb-4">
                <p className="text-gray-600">Total Amount:</p>
                <p className="text-2xl font-bold">{currency} {amount.toFixed(2)}</p>
            </div>

            <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-2 px-4 rounded text-white font-medium transition-colors ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>

            {!stripeKey && !paypalClientId && (
                <p className="mt-2 text-xs text-yellow-600">
                    ⚠️ Demo Mode: No payment keys configured.
                </p>
            )}
        </div>
    );
};
