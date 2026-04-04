import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loginMutation = trpc.admin.login.useMutation();
  const verifyRecoveryMutation = trpc.admin.verifyRecoveryCode.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      await loginMutation.mutateAsync({ password });
      setSuccess('Admin authenticated! Redirecting...');
      setTimeout(() => setLocation('/admin/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recoveryCode.trim()) {
      setError('Recovery code is required');
      return;
    }

    try {
      await verifyRecoveryMutation.mutateAsync({ code: recoveryCode });
      setSuccess('Recovery code verified! You can now reset your password.');
      setTimeout(() => {
        setShowRecovery(false);
        setRecoveryCode('');
        setPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid recovery code');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
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

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="border-2 border-cyan-500 bg-black/80 backdrop-blur p-8 relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-500"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pink-500"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pink-500"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pink-500"></div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                ADMIN
              </span>
            </h1>
            <p className="text-cyan-400 font-mono text-sm">ACCESS CONTROL SYSTEM</p>
          </div>

          {!showRecovery ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-cyan-400 mb-2">
                  AUTHENTICATION PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-black border-2 border-cyan-500/30 rounded px-4 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  disabled={loginMutation.isPending}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border-2 border-red-500/50 rounded text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border-2 border-green-500/50 rounded text-green-400 text-sm">
                  <CheckCircle size={16} />
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black py-2 rounded transition-all"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    AUTHENTICATING...
                  </>
                ) : (
                  'AUTHENTICATE'
                )}
              </Button>

              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="w-full text-pink-400 hover:text-pink-300 text-sm font-mono py-2 transition-colors"
              >
                FORGOT PASSWORD?
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecovery} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-cyan-400 mb-2">
                  RECOVERY CODE
                </label>
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="Enter recovery code"
                  className="w-full bg-black border-2 border-cyan-500/30 rounded px-4 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  disabled={verifyRecoveryMutation.isPending}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border-2 border-red-500/50 rounded text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border-2 border-green-500/50 rounded text-green-400 text-sm">
                  <CheckCircle size={16} />
                  {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={verifyRecoveryMutation.isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-black py-2 rounded transition-all"
              >
                {verifyRecoveryMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    VERIFYING...
                  </>
                ) : (
                  'VERIFY CODE'
                )}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setShowRecovery(false);
                  setRecoveryCode('');
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-cyan-400 hover:text-cyan-300 text-sm font-mono py-2 transition-colors"
              >
                BACK TO LOGIN
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-cyan-500/20 text-center text-xs text-gray-500 font-mono">
            <p>SECURE ADMIN ACCESS</p>
            <p className="mt-1">All activities are logged and monitored</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
