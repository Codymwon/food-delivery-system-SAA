import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Check,
  Loader2,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { login, register, loading: authLoading } = useAuth();

  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState('+91 98765 43210');
  const [fullName, setFullName] = useState('Aadith (Demo Customer)');
  const [email, setEmail] = useState('customer@vit.ac.in');
  const [password, setPassword] = useState('password123');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Please enter both email and password.');
        return;
      }
      setSubmitting(true);
      const res = await login(email.trim(), password);
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please try again.');
      }
    } else {
      if (!fullName.trim()) {
        setError('Full name is required.');
        return;
      }
      if (!email.trim()) {
        setError('Email address is required.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setSubmitting(true);
      const res = await register(email.trim(), password, fullName.trim(), phone.trim());
      setSubmitting(false);
      if (!res.success) {
        setError(res.error || 'Registration failed. Try a different email.');
      }
    }
  };

  const isPending = submitting || authLoading;

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-orange-600 selection:text-white bg-[#0C0A09]">
      
      {/* Warm Ambient Culinary Lighting (Orange & Amber Frosted Aura) */}
      <div className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#EA580C] via-[#F97316] to-[#D97706] opacity-40 blur-[110px] pointer-events-none" />
      <div className="absolute top-1/4 -right-28 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-[#C2410C] via-[#EA580C] to-amber-700 opacity-35 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-28 left-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#B45309] via-[#EA580C] to-transparent opacity-30 blur-[120px] pointer-events-none" />

      {/* Frosted Glass Mesh Texture Overlay */}
      <div className="absolute inset-0 backdrop-blur-[35px] bg-black/25 pointer-events-none" />

      {/* Outer Frosted Glass Frame Container */}
      <div className="relative z-10 w-full max-w-6xl p-2.5 sm:p-3.5 rounded-[36px] sm:rounded-[46px] bg-white/[0.08] backdrop-blur-2xl border border-white/[0.18] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7)] transition-all">
        
        {/* Inner Card Container */}
        <div className="w-full bg-white rounded-[30px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row p-3 sm:p-4 gap-4 transition-all">
          
          {/* LEFT PANEL: Rich Warm Tomato-Orange Hero (Appetizing Culinary Aesthetic) */}
          <div className={`w-full lg:w-[48%] xl:w-[46%] rounded-[24px] sm:rounded-[34px] relative overflow-hidden p-6 sm:p-10 lg:p-12 flex flex-col justify-between ${mode === 'register' ? 'min-h-[540px] lg:min-h-[660px]' : 'min-h-[440px] lg:min-h-[520px]'} bg-gradient-to-b from-[#EA580C] via-[#C2410C] to-[#9A3412] text-white shadow-inner transition-all duration-300`}>
            
            {/* Soft Warm Internal Highlights */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full bg-red-950/40 blur-3xl pointer-events-none" />

            {/* Top Brand Logo */}
            <div className="relative z-10 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-sm">
                <UtensilsCrossed className="w-5 h-5 text-white" strokeWidth={1.75} />
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">FoodDash</span>
            </div>

            {/* Middle Headline & Description (Dynamically tailored for Register vs Login) */}
            <div className="relative z-10 my-auto py-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {mode === 'register'
                  ? 'Craving something delicious?'
                  : 'Welcome back, foodie!'}
              </h1>

              <p className="text-white/90 text-sm mt-3 font-normal leading-relaxed max-w-sm">
                {mode === 'register'
                  ? 'Create your account to order from top campus restaurants and get fresh meals delivered in minutes.'
                  : 'Sign in to access your saved delivery spots, reorder your favorites, and satisfy your cravings.'}
              </p>
            </div>

            {/* Bottom: 3-Step Milestone Cards (Shown only during registration) */}
            {mode === 'register' ? (
              <div className="relative z-10 grid grid-cols-3 gap-2.5 sm:gap-3 pt-4">
                {/* Step 1: Active White Card */}
                <div className="bg-white rounded-2xl p-3 sm:p-3.5 text-slate-900 shadow-lg flex flex-col justify-between min-h-[110px] sm:min-h-[120px] transition-transform hover:-translate-y-0.5">
                  <div className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    1
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold leading-snug text-slate-900">
                    Create your account
                  </span>
                </div>

                {/* Step 2: Frosted Glass Card */}
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 text-white border border-white/20 flex flex-col justify-between min-h-[110px] sm:min-h-[120px] transition-transform hover:-translate-y-0.5">
                  <div className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center font-semibold text-xs border border-white/25">
                    2
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-white/95 leading-snug">
                    Set your hostel address
                  </span>
                </div>

                {/* Step 3: Frosted Glass Card */}
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 text-white border border-white/20 flex flex-col justify-between min-h-[110px] sm:min-h-[120px] transition-transform hover:-translate-y-0.5">
                  <div className="w-6 h-6 rounded-full bg-white/25 text-white flex items-center justify-center font-semibold text-xs border border-white/25">
                    3
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-white/85 leading-snug">
                    Order and enjoy hot meals
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative z-10 pt-4 flex items-center gap-2 text-white/85 text-xs font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Fast doorstep delivery to all campus hostels and blocks</span>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Clean White Form (Orange Accents) */}
          <div className="w-full lg:w-[52%] xl:w-[54%] p-6 sm:p-10 lg:p-12 xl:p-14 flex flex-col justify-center bg-white">
            
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Title */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {mode === 'register' ? 'Join Us' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {mode === 'register'
                    ? 'Create an account to start ordering delicious dishes'
                    : 'Sign in to access your orders and saved hostel addresses'}
                </p>
              </div>

              {/* Inline Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {mode === 'register' && (
                  <>
                    {/* Phone Number Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone number
                      </label>
                      <div className="flex items-center rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-3 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 focus-within:bg-white transition-all">
                        <div className="flex items-center gap-2 pr-2.5 mr-2.5 border-r border-stone-200 text-xs font-semibold text-slate-700 select-none">
                          <span className="text-sm">🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Two-Column: Full Name & Username */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full Name
                        </label>
                        <div className="rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-3 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 focus-within:bg-white transition-all">
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Aadith"
                            required
                            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Email
                        </label>
                        <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-3 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 focus-within:bg-white transition-all">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="customer@vit.ac.in"
                            required
                            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />
                          {email.includes('@') && (
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-1.5" strokeWidth={2.5} />
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email address
                    </label>
                    <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-3 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 focus-within:bg-white transition-all">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@vit.ac.in"
                        required
                        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />
                      {email.includes('@') && (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-1.5" strokeWidth={2.5} />
                      )}
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 px-3.5 py-3 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 focus-within:bg-white transition-all">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 ml-2"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={1.75} />
                      )}
                    </button>
                  </div>
                  {mode === 'register' && (
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">
                      At least 6 characters, with letters and numbers.
                    </p>
                  )}
                </div>

                {/* Primary Action Button (Appetizing Orange CTA) */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-tactile w-full py-3.5 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <span>{mode === 'register' ? 'Continue' : 'Log In'}</span>
                  )}
                </button>
              </form>

              {/* Switch Mode Link */}
              <div className="text-center text-xs text-slate-500 font-medium">
                {mode === 'register' ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                      }}
                      className="text-[#EA580C] font-bold hover:underline"
                    >
                      Log in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError('');
                      }}
                      className="text-[#EA580C] font-bold hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>


              {/* Terms of Service Disclaimer */}
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                By signing up I confirm that I carefully have read and agree to the FoodDash{' '}
                <span className="text-slate-600 font-medium cursor-pointer hover:underline">Privacy Policy</span> and{' '}
                <span className="text-slate-600 font-medium cursor-pointer hover:underline">Terms of Service</span>.
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
