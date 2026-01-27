import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env vars aren't available
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your environment variables.');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-06-20',
            typescript: true,
        });
    }
    return stripeInstance;
}

// For backward compatibility - will throw at runtime if key is missing
export const stripe = {
    get checkout() { return getStripe().checkout; },
    get webhooks() { return getStripe().webhooks; },
    get subscriptions() { return getStripe().subscriptions; },
} as unknown as Stripe;
