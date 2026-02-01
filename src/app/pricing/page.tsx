import { redirect } from 'next/navigation';
import { getUser, getLoginUrl } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Check, 
  Target,
  Zap,
  Crown,
  Building2
} from 'lucide-react';
import { PLAN_DETAILS } from '@/lib/stripe';

const plans = [
  {
    id: 'free',
    icon: Target,
    color: 'zinc',
    popular: false,
  },
  {
    id: 'starter',
    icon: Zap,
    color: 'green',
    popular: false,
  },
  {
    id: 'pro',
    icon: Crown,
    color: 'blue',
    popular: true,
  },
  {
    id: 'business',
    icon: Building2,
    color: 'purple',
    popular: false,
  },
];

export default async function PricingPage() {
  const user = await getUser();
  
  if (!user) {
    redirect(getLoginUrl('/pricing'));
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, user.email)
  });

  const currentPlan = dbUser?.plan || 'free';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/settings" className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-2xl font-semibold">Pricing</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Start free, upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const details = PLAN_DETAILS[plan.id as keyof typeof PLAN_DETAILS];
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;

            const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
              zinc: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
              green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
              blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
              purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
            };

            const colors = colorClasses[plan.color];

            return (
              <div
                key={plan.id}
                className={`relative bg-surface rounded-2xl border ${
                  plan.popular ? 'border-accent' : 'border-border'
                } p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent rounded-full text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                <h3 className="text-xl font-semibold mb-1">{details.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    {details.price === 0 ? 'Free' : `$${details.price}`}
                  </span>
                  {details.price > 0 && (
                    <span className="text-zinc-500">/month</span>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {details.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 bg-surface-hover rounded-xl text-zinc-500 font-medium text-sm cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3 bg-surface-hover rounded-xl text-zinc-500 font-medium text-sm cursor-not-allowed"
                  >
                    Free Forever
                  </button>
                ) : (
                  <button
                    className={`w-full py-3 ${
                      plan.popular
                        ? 'bg-accent-gradient text-white hover:opacity-90'
                        : 'bg-surface-hover hover:bg-zinc-700 text-white'
                    } rounded-xl font-medium text-sm transition-all`}
                  >
                    Upgrade to {details.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <FaqItem
              question="Can I change plans anytime?"
              answer="Yes! You can upgrade or downgrade at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing period."
            />
            <FaqItem
              question="What counts as a competitor?"
              answer="Each company you track counts as one competitor. You can add multiple URLs per competitor (pricing page, features page, blog) within your plan's limits."
            />
            <FaqItem
              question="How often are pages checked?"
              answer="All plans include daily checks. We scan your competitor pages once every 24 hours and notify you of any changes."
            />
            <FaqItem
              question="Do you offer refunds?"
              answer="Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-zinc-500 mb-4">
            Need more? Contact us for custom enterprise solutions.
          </p>
          <a
            href="mailto:joey@jdms.nl"
            className="text-accent hover:underline"
          >
            Contact Sales →
          </a>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h4 className="font-medium mb-2">{question}</h4>
      <p className="text-sm text-zinc-400">{answer}</p>
    </div>
  );
}
