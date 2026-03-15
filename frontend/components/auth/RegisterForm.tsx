'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import AuthInput from './AuthInput';
import AuthCard from './AuthCard';
import { C } from './AuthLayout';

type Role   = 'citizen' | 'admin' | '';
type Errors = {
  name?: string; email?: string;
  password?: string; confirm?: string;
  role?: string; terms?: string; general?: string;
};

const ROLES = [
  {
    id: 'citizen' as Role,
    icon: '👤',
    title: 'Citizen',
    desc: 'Report issues, track resolutions & earn civic points',
  },
  {
    id: 'admin' as Role,
    icon: '🏛️',
    title: 'Government Official',
    desc: 'Manage departmental tasks & city data',
  },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', C.success];

  if (!password) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : '#E2E8F0' }} />
        ))}
      </div>
      <p className="text-[11px] font-semibold" style={{ color: colors[score] }}>{label}</p>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [role,     setRole]     = useState<Role>('');
  const [terms,    setTerms]    = useState(false);
  const [errors,   setErrors]   = useState<Errors>({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Errors = {};
    if (!name.trim())                e.name     = 'Full name is required';
    else if (name.trim().length < 2) e.name     = 'Name must be at least 2 characters';

    if (!email)                      e.email    = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';

    if (!password)                   e.password = 'Password is required';
    else if (password.length < 8)    e.password = 'Password must be at least 8 characters';

    if (!confirm)                    e.confirm  = 'Please confirm your password';
    else if (confirm !== password)   e.confirm  = 'Passwords do not match';

    if (!role)                       e.role     = 'Please select a role to continue';
    if (!terms)                      e.terms    = 'You must agree to the Terms & Privacy Policy';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: role.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
      } else {
        localStorage.setItem('cf_token', data.token);
        localStorage.setItem('cf_user', JSON.stringify(data.user));
        setSuccess(true);
        setTimeout(() => {
          const userRole = (data.user?.role ?? '').toUpperCase();
          const isAdmin  = ['ADMIN', 'OFFICIAL', 'GOVERNMENT'].includes(userRole);
          router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
        }, 2000);
      }
    } catch {
      setErrors({ general: 'Connection error. Please check your network and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthCard title="" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
          className="flex flex-col items-center text-center py-4 gap-4"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: `${C.success}14`, border: `2px solid ${C.success}30` }}>
            <CheckCircle2 size={32} style={{ color: C.success }} />
          </div>
          <h2 className="font-bold text-xl" style={{ fontFamily: 'Georgia,serif', color: C.text }}>
            Account created!
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: C.muted }}>
            Welcome to CityFlow. Taking you to your dashboard…
          </p>
          <div className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: `${C.primary}30`, borderTopColor: C.primary }} />
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join CityFlow and help build a smarter, more responsive city."
      footer={
        <p className="text-sm" style={{ color: C.muted }}>
          Already have an account?{' '}
          <Link href="/login" className="font-bold no-underline transition-opacity hover:opacity-70" style={{ color: C.primary }}>
            Sign in
          </Link>
        </p>
      }
    >
      {/* General error */}
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

      <form onSubmit={handleSubmit} noValidate aria-label="Create account form">
        <div className="flex flex-col gap-3.5">

          {/* Full Name */}
          <AuthInput
            label="Full Name"
            value={name}
            onChange={v => { setName(v); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
            icon={<User size={16} />}
            error={errors.name}
            autoComplete="name"
            required
          />

          {/* Email */}
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

          {/* Password */}
          <div>
            <AuthInput
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={v => { setPassword(v); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
              icon={<Lock size={16} />}
              rightElement={showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              onRightClick={() => setShowPw(s => !s)}
              error={errors.password}
              hint="At least 8 characters"
              autoComplete="new-password"
              required
            />
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <AuthInput
            label="Confirm Password"
            type={showCf ? 'text' : 'password'}
            value={confirm}
            onChange={v => { setConfirm(v); if (errors.confirm) setErrors(p => ({ ...p, confirm: '' })); }}
            icon={<Lock size={16} />}
            rightElement={showCf ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightClick={() => setShowCf(s => !s)}
            error={errors.confirm}
            autoComplete="new-password"
            required
          />

          {/* Role Selection */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.6px] mb-2" style={{ color: '#94A3B8' }}>
              Select your role <span style={{ color: C.error }}>*</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map(r => {
                const selected = role === r.id;
                return (
                  <motion.button
                    key={r.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => { setRole(r.id); if (errors.role) setErrors(p => ({ ...p, role: '' })); }}
                    animate={{
                      borderColor: selected ? C.primary : errors.role ? C.error : '#CBD5E1',
                      background:  selected ? `${C.primary}0c` : C.white,
                      boxShadow:   selected ? `0 0 0 3px ${C.primary}22` : 'none',
                    }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-start gap-1 p-3 rounded-xl border text-left cursor-pointer outline-none focus-visible:ring-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.icon}</span>
                      <span className="text-[13px] font-bold" style={{ color: selected ? C.primary : C.text }}>
                        {r.title}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug" style={{ color: C.muted }}>{r.desc}</p>
                  </motion.button>
                );
              })}
            </div>
            {errors.role && (
              <p className="text-[11px] font-medium mt-1 ml-0.5 flex items-center gap-1" style={{ color: C.error }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.role}
              </p>
            )}
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <button
                type="button"
                role="checkbox"
                aria-checked={terms}
                onClick={() => { setTerms(s => !s); if (errors.terms) setErrors(p => ({ ...p, terms: '' })); }}
                className="shrink-0 mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2"
                style={{
                  border:     `2px solid ${terms ? C.primary : errors.terms ? C.error : '#CBD5E1'}`,
                  background: terms ? C.primary : 'transparent',
                }}
              >
                {terms && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="text-[13px] leading-relaxed" style={{ color: C.muted }}>
                I agree to the{' '}
                <Link href="/terms" className="font-semibold no-underline hover:underline" style={{ color: C.primary }}>
                  Terms of Service
                </Link>
                {' '}&amp;{' '}
                <Link href="/privacy" className="font-semibold no-underline hover:underline" style={{ color: C.primary }}>
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="text-[11px] font-medium mt-1 ml-6 flex items-center gap-1" style={{ color: C.error }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {errors.terms}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          className="mt-5 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-[10px] text-white font-bold text-[15px] tracking-[0.2px] cursor-pointer border-none outline-none focus-visible:ring-2 disabled:cursor-not-allowed"
          whileHover={!loading ? { y: -1, boxShadow: `0 8px 28px ${C.primary}55` } : {}}
          whileTap={!loading ? { y: 1 } : {}}
          animate={{
            background:  loading ? '#94A3B8' : C.primary,
            boxShadow:   loading ? 'none' : `0 4px 18px ${C.primary}40`,
          }}
          transition={{ duration: 0.15 }}
          aria-label="Create account"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create Account
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </form>
    </AuthCard>
  );
}