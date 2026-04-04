import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

const MONERO_ADDRESS = '8BbApiMBHsPVKkLEP4rVbST6CnSb3LW2gXygngCi5MGiBuwAFh6bFEzT3UTuFCkLHtyHnrYNnHycdaGb2Kgkkmw8jViCdB6';
const TELEGRAM_BOT = 't.me/loghandelbot';
const TELEGRAM_CHANNEL = 't.me/cybersecunity';

const PLANS = {
  starter: { name: 'Starter', xmr: 0.05, tokens: 300000 },
  professional: { name: 'Professional', xmr: 0.18, tokens: 1500000 },
  elite: { name: 'Elite', xmr: 0.30, tokens: 3000000 },
};

export default function Payment() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS>('professional');
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment' | 'confirm'>('select');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);

  const plan = PLANS[selectedPlan];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(MONERO_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    if (!txHash.trim()) {
      alert('Please enter transaction hash');
      return;
    }
    setPaymentStep('confirm');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-transparent to-pink-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b-2 border-cyan-500/20 bg-black/50 backdrop-blur sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-black">
              <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                PAYMENT
              </span>
            </h1>
            <p className="text-cyan-400 font-mono text-sm">Monero (XMR) Payment Processing</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {paymentStep === 'select' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black mb-8 text-center">
                <span className="text-cyan-400">SELECT</span> <span className="text-pink-500">YOUR PLAN</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {Object.entries(PLANS).map(([key, p]) => (
                  <Card
                    key={key}
                    onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
                    className={`border-2 p-6 cursor-pointer transition-all ${
                      selectedPlan === key
                        ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/50'
                        : 'border-cyan-500/30 bg-black/50 hover:border-cyan-500'
                    }`}
                  >
                    <h3 className="text-xl font-black text-cyan-400 mb-2">{p.name}</h3>
                    <div className="text-3xl font-black text-pink-500 mb-2">{p.xmr} XMR</div>
                    <p className="text-gray-400 text-sm mb-4">{p.tokens.toLocaleString()} tokens</p>
                    {selectedPlan === key && (
                      <div className="text-green-400 font-bold text-sm">✓ Selected</div>
                    )}
                  </Card>
                ))}
              </div>

              <Button
                onClick={() => setPaymentStep('payment')}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black py-3 text-lg"
              >
                PROCEED TO PAYMENT
              </Button>
            </div>
          )}

          {paymentStep === 'payment' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black mb-8 text-center">
                <span className="text-cyan-400">SEND</span> <span className="text-pink-500">MONERO</span>
              </h2>

              <Card className="border-2 border-cyan-500/30 bg-black/50 p-8 mb-8">
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">Amount to send:</p>
                  <div className="text-4xl font-black text-pink-500">{plan.xmr} XMR</div>
                </div>

                <div className="mb-6 p-4 bg-cyan-500/10 border-2 border-cyan-500/30 rounded">
                  <p className="text-gray-400 text-sm mb-2">Monero Address:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-cyan-400 break-all font-mono">{MONERO_ADDRESS}</code>
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 hover:bg-cyan-500/20 rounded transition-colors"
                    >
                      {copied ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <Copy size={20} className="text-cyan-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/30 rounded mb-6">
                  <div className="flex gap-2">
                    <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-300">
                      <p className="font-bold mb-1">Important:</p>
                      <p>Send exactly {plan.xmr} XMR. Do not send less or more.</p>
                      <p>Payment will be confirmed within 10-20 minutes.</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-mono text-cyan-400 mb-2">Transaction Hash (TX ID)</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="Paste your transaction hash here"
                    className="w-full bg-black border-2 border-cyan-500/30 rounded px-4 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <p className="text-gray-400 text-xs mt-2">
                    You can find this in your Monero wallet after sending the transaction.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setPaymentStep('select')}
                    variant="outline"
                    className="flex-1 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    BACK
                  </Button>
                  <Button
                    onClick={handleConfirmPayment}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black"
                  >
                    CONFIRM PAYMENT
                  </Button>
                </div>
              </Card>

              <Card className="border-2 border-pink-500/30 bg-black/50 p-6">
                <p className="text-gray-400 text-sm mb-4">
                  Need help? Contact our support team on Telegram:
                </p>
                <a
                  href={`https://${TELEGRAM_BOT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  <ExternalLink size={16} />
                  {TELEGRAM_BOT}
                </a>
              </Card>
            </div>
          )}

          {paymentStep === 'confirm' && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-2 border-green-500/50 bg-green-500/10 p-8 text-center">
                <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-green-400 mb-4">Payment Submitted!</h2>
                <p className="text-gray-300 mb-6">
                  Your payment is being verified. You will receive confirmation within 10-20 minutes.
                </p>

                <div className="p-4 bg-black/50 border-2 border-green-500/30 rounded mb-6 text-left">
                  <p className="text-gray-400 text-sm mb-2">Transaction Hash:</p>
                  <code className="text-cyan-400 font-mono text-xs break-all">{txHash}</code>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-gray-400">
                    Join our community channel for updates:
                  </p>
                  <a
                    href={`https://${TELEGRAM_CHANNEL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 font-bold"
                  >
                    <ExternalLink size={16} />
                    {TELEGRAM_CHANNEL}
                  </a>
                </div>

                <Button
                  onClick={() => setLocation('/')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black py-3"
                >
                  RETURN TO HOME
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
