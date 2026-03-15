'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import AuthInput from './AuthInput';
import AuthCard from './AuthCard';
import { C } from './AuthLayout';

type Errors = { email?: string; password?: string; general?: string };

export default function LoginForm() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors,   setErrors]   = useState<Errors>({});
  const [loading,  setLoading]  = useState(false);
  const [btnHov,   setBtnHov]   = useState(false);
  const [btnPress, setBtnPress] = useState(false);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!email) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.message || 'Invalid credentials.' });
      } else {
        if (remember) localStorage.setItem('cf_remember', 'true');
        localStorage.setItem('cf_token', data.token);
        localStorage.setItem('cf_user', JSON.stringify(data.user));
        // Role-based redirect
        const role = (data.user?.role ?? '').toUpperCase();
        const isAdmin = ['ADMIN', 'OFFICIAL', 'GOVERNMENT'].includes(role);
        router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
      }
    } catch {
      setErrors({ general: 'Connection error. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your CityFlow account to access your dashboard and civic tools."
      footer={
        <p className="text-sm" style={{ color: C.muted }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold no-underline hover:opacity-70" style={{ color: C.primary }}>
            Create one free
          </Link>
        </p>
      }
    >
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex items-start gap-2.5 rounded-xl p-3"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            <span className="mt-0.5 shrink-0">⚠️</span>
            <p className="text-[13px] font-medium" style={{ color: C.error }}>{errors.general}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
        <div className="flex flex-col gap-3.5">
          <AuthInput
            label="Email Address"
            type="email"
            value={email}
            onChange={v => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
            icon={<Mail size={16} />}
            error={errors.email}
            autoComplete="email"
            required
          />
          <AuthInput
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={v => { setPassword(v); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
            icon={<Lock size={16} />}
            rightElement={showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightClick={() => setShowPw(s => !s)}
            error={errors.password}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex items-center justify-between mt-4 mb-5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember(s => !s)}
              className="shrink-0 w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200 outline-none"
              style={{ border: `2px solid ${remember ? C.primary : '#CBD5E1'}`, background: remember ? C.primary : 'transparent' }}
            >
              {remember && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <span className="text-[13px]" style={{ color: C.muted }}>Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-[13px] font-semibold no-underline hover:opacity-70" style={{ color: C.primary }}>
            Forgot password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          onHoverStart={() => setBtnHov(true)}
          onHoverEnd={() => { setBtnHov(false); setBtnPress(false); }}
          onTapStart={() => setBtnPress(true)}
          onTap={() => setBtnPress(false)}
          animate={{
            background: loading ? '#94A3B8' : btnHov ? '#1a5a82' : C.primary,
            y: btnPress ? 1 : btnHov && !loading ? -1 : 0,
            boxShadow: loading ? 'none' : btnHov ? `0 8px 28px ${C.primary}55` : `0 4px 18px ${C.primary}40`,
          }}
          transition={{ duration: 0.15 }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[10px] text-white font-bold text-[15px] cursor-pointer border-none outline-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={17} className="animate-spin" />Signing in…</>
          ) : (
            <>Sign In <ArrowRight size={16} /></>
          )}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
        <span className="text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: '#94A3B8' }}>
          or continue with
        </span>
        <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {[{ icon: '🌐', label: 'Google' }, { icon: '🏛️', label: 'Government ID' }].map(btn => (
          <OAuthButton key={btn.label} icon={btn.icon} label={btn.label} ariaLabel={`Continue with ${btn.label}`} />
        ))}
      </div>
    </AuthCard>
  );
}

function OAuthButton({ icon, label, ariaLabel }: { icon: string; label: string; ariaLabel: string }) {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      animate={{
        borderColor: hov ? C.primary : '#CBD5E1',
        background: hov ? `${C.primary}0a` : C.white,
        y: hov ? -1 : 0,
      }}
      transition={{ duration: 0.15 }}
      className="flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer border outline-none"
      style={{ color: C.text }}
    >
      <span className="text-base">{icon}</span>{label}
    </motion.button>
  );
}