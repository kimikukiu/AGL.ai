import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Check } from 'lucide-react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const { data: plans, isLoading: plansLoading } = trpc.pricing.getPlans.useQuery();
  const { data: personas } = trpc.pricing.getPersonas.useQuery();
  const validatePromoMutation = trpc.pricing.validatePromo.useMutation();

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const result = await validatePromoMutation.mutateAsync({ code: promoCode });
      setPromoDiscount(result.discount);
      setPromoError('');
    } catch (error: any) {
      setPromoError(error.message || 'Invalid promo code');
      setPromoDiscount(0);
    }
  };

  const calculatePrice = (basePrice: number) => {
    const discounted = basePrice * (1 - promoDiscount / 100);
    return Math.round(discounted * 100) / 100;
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-transparent to-pink-500"></div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-cyan-500" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 pt-16 pb-8 text-center">
          <div className="mb-4 inline-block">
            <div className="border-2 border-cyan-500 px-4 py-2 rounded-lg">
              <span className="text-cyan-400 font-mono text-sm">⚡ FLASH SALE</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              AGL.ai
            </span>
          </h1>
          <p className="text-xl text-pink-400 font-bold mb-2">Save 20% on all plans today</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Pay only for the tokens you need. Upgrade anytime. All plans include access to our 5 specialized AI models.
          </p>
        </div>

        {/* Promo Code Section */}
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-md mx-auto border-2 border-pink-500/50 rounded-lg p-6 bg-black/50 backdrop-blur">
            <label className="block text-sm font-mono text-cyan-400 mb-2">PROMO CODE</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="FIRST20"
                className="flex-1 bg-black border-2 border-cyan-500/30 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <Button
                onClick={handleApplyPromo}
                disabled={validatePromoMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold"
              >
                {validatePromoMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'APPLY'}
              </Button>
            </div>
            {promoError && <p className="text-pink-400 text-sm">{promoError}</p>}
            {promoDiscount > 0 && (
              <p className="text-cyan-400 text-sm font-bold">✓ {promoDiscount}% discount applied!</p>
            )}
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="container mx-auto px-4 mb-12 flex justify-center">
          <div className="inline-flex border-2 border-cyan-500/50 rounded-lg p-1 bg-black/50">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-cyan-500 text-black'
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 font-bold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-pink-500 text-black'
                  : 'text-pink-400 hover:text-pink-300'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="container mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans?.map((plan) => (
              <Card
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 transition-all hover:shadow-2xl ${
                  plan.recommended
                    ? 'border-pink-500 bg-black/80 shadow-lg shadow-pink-500/50 scale-105'
                    : 'border-cyan-500/30 bg-black/50 hover:border-cyan-500'
                }`}
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>

                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-pink-600 text-black px-3 py-1 rounded-full text-xs font-black tracking-wider">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-black mb-1 text-cyan-400">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-4xl font-black text-pink-500">
                    ${calculatePrice(plan.price)}
                    <span className="text-lg text-gray-400">/mo</span>
                  </div>
                  <p className="text-xs text-cyan-400 mt-2 font-mono">{plan.tokens.toLocaleString()} TOKENS</p>
                </div>

                <Button className="w-full mb-6 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black">
                  GET STARTED
                </Button>

                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Personas Section */}
        <div className="container mx-auto px-4 mb-20">
          <h2 className="text-4xl font-black text-center mb-12">
            <span className="text-cyan-400">5 SPECIALIZED</span>
            <br />
            <span className="text-pink-500">AI PERSONAS</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {personas?.map((persona) => (
              <div
                key={persona.id}
                className="border-2 border-cyan-500/30 rounded-lg p-4 bg-black/50 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20"
              >
                <p className="text-pink-400 font-bold text-sm mb-2">"{persona.tagline}"</p>
                <h4 className="text-cyan-400 font-black text-sm mb-1">{persona.name}</h4>
                <p className="text-gray-400 text-xs">{persona.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 mb-20">
          <h2 className="text-3xl font-black text-center mb-12 text-cyan-400">
            PLUS ALL THESE FEATURES
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'File & Document Upload (OCR)',
              'Agent IDE — Cursor-style Editing',
              'Dark Web Intelligence Search',
              'Code Generation & Analysis',
            ].map((feature, idx) => (
              <div key={idx} className="border-l-2 border-pink-500 pl-4 py-2">
                <p className="text-gray-300 font-semibold">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="container mx-auto px-4 py-12 border-t-2 border-cyan-500/20 text-center text-gray-500 text-sm">
          <p>Questions? Contact us at support@agl.ai</p>
        </div>
      </div>
    </div>
  );
}
