import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, LogOut, Zap, Users, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'users' | 'billing'>('overview');

  const logoutMutation = trpc.admin.logout.useMutation();
  const { data: plans } = trpc.pricing.getPlans.useQuery();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-transparent to-pink-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b-2 border-cyan-500/20 bg-black/50 backdrop-blur sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black">
                <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                  ADMIN DASHBOARD
                </span>
              </h1>
              <p className="text-cyan-400 font-mono text-sm">UNRESTRICTED ACCESS</p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <LogOut size={16} />
              )}
              LOGOUT
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4 mt-8">
          <div className="flex gap-4 mb-8 border-b-2 border-cyan-500/20 pb-4">
            {[
              { id: 'overview' as const, label: 'Overview', icon: Zap },
              { id: 'tools' as const, label: 'Free Tools', icon: Zap },
              { id: 'users' as const, label: 'Users', icon: Users },
              { id: 'billing' as const, label: 'Billing', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-bold transition-all ${
                    activeTab === tab.id
                      ? 'text-cyan-400 border-b-2 border-cyan-500'
                      : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-20">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-2 border-cyan-500/30 bg-black/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-cyan-400 font-bold">ADMIN STATUS</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-black text-pink-500">ACTIVE</p>
                <p className="text-gray-400 text-sm mt-2">Full access to all features</p>
              </Card>

              <Card className="border-2 border-pink-500/30 bg-black/50 p-6">
                <h3 className="text-pink-400 font-bold mb-4">TOKENS AVAILABLE</h3>
                <p className="text-3xl font-black text-cyan-400">UNLIMITED</p>
                <p className="text-gray-400 text-sm mt-2">No token restrictions</p>
              </Card>

              <Card className="border-2 border-cyan-500/30 bg-black/50 p-6">
                <h3 className="text-cyan-400 font-bold mb-4">ACCESS LEVEL</h3>
                <p className="text-3xl font-black text-pink-500">TIER 5</p>
                <p className="text-gray-400 text-sm mt-2">Maximum privileges</p>
              </Card>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    name: 'AI Chat & Code Generation',
                    status: 'ACTIVE',
                    description: 'Unlimited access to all AI models',
                  },
                  {
                    name: 'File & Document Upload (OCR)',
                    status: 'ACTIVE',
                    description: 'Process unlimited documents',
                  },
                  {
                    name: 'Agent IDE with Cursor-style Editing',
                    status: 'ACTIVE',
                    description: 'Full IDE capabilities',
                  },
                  {
                    name: 'Dark Web Intelligence Search',
                    status: 'ACTIVE',
                    description: 'Advanced search capabilities',
                  },
                  {
                    name: 'Code Obfuscation & Analysis',
                    status: 'ACTIVE',
                    description: 'Advanced security tools',
                  },
                  {
                    name: 'Deep Reasoning Engine',
                    status: 'ACTIVE',
                    description: 'Unlimited reasoning loops',
                  },
                ].map((tool, idx) => (
                  <Card key={idx} className="border-2 border-cyan-500/30 bg-black/50 p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-cyan-400">{tool.name}</h4>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                        {tool.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{tool.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card className="border-2 border-cyan-500/30 bg-black/50 p-6">
                <h3 className="text-cyan-400 font-bold mb-4">USER MANAGEMENT</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-black/50 border border-cyan-500/20 rounded">
                    <p className="text-gray-400 text-sm">
                      Admin users have unlimited access to all tools and features. Regular users follow the standard subscription model.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-pink-500/30 rounded">
                      <p className="text-pink-400 font-bold mb-2">Admin Users</p>
                      <p className="text-3xl font-black text-cyan-400">1</p>
                    </div>
                    <div className="p-4 border-2 border-cyan-500/30 rounded">
                      <p className="text-cyan-400 font-bold mb-2">Regular Users</p>
                      <p className="text-3xl font-black text-pink-500">0</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card className="border-2 border-cyan-500/30 bg-black/50 p-6">
                <h3 className="text-cyan-400 font-bold mb-6">PRICING PLANS</h3>
                <div className="space-y-4">
                  {plans?.map((plan) => (
                    <div key={plan.id} className="p-4 border-2 border-cyan-500/20 rounded flex items-center justify-between">
                      <div>
                        <p className="font-bold text-cyan-400">{plan.name}</p>
                        <p className="text-gray-400 text-sm">{plan.tokens.toLocaleString()} tokens</p>
                      </div>
                      <p className="text-2xl font-black text-pink-500">${plan.price}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-2 border-pink-500/30 bg-black/50 p-6">
                <h3 className="text-pink-400 font-bold mb-4">ADMIN BILLING STATUS</h3>
                <p className="text-gray-400 mb-4">
                  As an admin, you have unlimited access to all premium features at no cost. Regular users must maintain an active subscription.
                </p>
                <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded">
                  <p className="text-green-400 font-bold">✓ All Premium Features Unlocked</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
