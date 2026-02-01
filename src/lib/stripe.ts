// Stripe configuration
// Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to environment variables

export const STRIPE_PRICES = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || 'price_business_monthly',
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || 'price_business_yearly',
  },
};

export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: 0,
    competitors: 2,
    urlsPerCompetitor: 2,
    features: ['2 competitors', '2 URLs each', '7-day history', 'Daily checks'],
  },
  starter: {
    name: 'Starter',
    price: 19,
    competitors: 5,
    urlsPerCompetitor: 5,
    features: ['5 competitors', '5 URLs each', '90-day history', 'Email alerts', 'Priority support'],
  },
  pro: {
    name: 'Pro',
    price: 39,
    competitors: 15,
    urlsPerCompetitor: 10,
    features: ['15 competitors', '10 URLs each', '1-year history', 'Weekly AI digest', 'Slack integration'],
  },
  business: {
    name: 'Business',
    price: 79,
    competitors: -1, // unlimited
    urlsPerCompetitor: -1,
    features: ['Unlimited competitors', 'Unlimited URLs', 'Full history', 'API access', 'Team members', 'Custom reports'],
  },
};

// Helper to create Stripe checkout session
export async function createCheckoutSession(
  customerId: string | null,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string>
) {
  const stripe = await getStripe();
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId || undefined,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
  });

  return session;
}

// Helper to create customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = await getStripe();
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Lazy load Stripe to avoid import issues
let stripeInstance: any = null;

async function getStripe() {
  if (!stripeInstance) {
    const Stripe = (await import('stripe')).default;
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }
  return stripeInstance;
}

export { getStripe };
