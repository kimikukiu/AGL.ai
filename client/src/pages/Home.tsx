import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Cpu } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
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
        {/* Navigation */}
        <nav className="border-b-2 border-cyan-500/20 bg-black/50 backdrop-blur sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-3xl font-black">
              <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">AGL.ai</span>
            </h1>
            <div className="flex gap-4">
              <Button
                onClick={() => setLocation('/pricing')}
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
              >
                PRICING
              </Button>
              <Button
                onClick={() => setLocation('/admin/login')}
                className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black"
              >
                ADMIN ACCESS
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              ADVANCED AI
            </span>
            <br />
            <span className="text-pink-500">SECURITY PLATFORM</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Harness the power of 5 specialized AI personas for advanced security research, penetration testing, and threat analysis.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => setLocation('/pricing')}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black px-8 py-3 text-lg"
            >
              GET STARTED
            </Button>
            <Button
              onClick={() => setLocation('/admin/login')}
              variant="outline"
              className="border-2 border-pink-500 text-pink-400 hover:bg-pink-500/10 px-8 py-3 text-lg font-black"
            >
              ADMIN LOGIN
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 py-20">
          <h3 className="text-4xl font-black text-center mb-12">
            <span className="text-cyan-400">POWERED BY</span> <span className="text-pink-500">5 AI PERSONAS</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Quick Security Assistant',
                desc: 'Fast pentesting queries and instant answers',
              },
              {
                icon: Shield,
                title: 'Red Team Operator',
                desc: 'Deep reasoning and advanced pentesting',
              },
              {
                icon: Cpu,
                title: 'Exploit Engineer',
                desc: 'PoC generation and security automation',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="border-2 border-cyan-500/30 rounded-lg p-6 bg-black/50 hover:border-pink-500/50 transition-all">
                  <Icon className="text-pink-500 mb-4" size={32} />
                  <h4 className="text-cyan-400 font-bold mb-2">{feature.title}</h4>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="border-2 border-cyan-500/30 rounded-lg p-12 bg-black/50 backdrop-blur">
            <h3 className="text-3xl font-black mb-4">
              <span className="text-cyan-400">READY TO</span> <span className="text-pink-500">ELEVATE YOUR SECURITY?</span>
            </h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Choose your plan and unlock unlimited access to advanced AI-powered security tools.
            </p>
            <Button
              onClick={() => setLocation('/pricing')}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black px-8 py-3 text-lg"
            >
              VIEW PRICING
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
