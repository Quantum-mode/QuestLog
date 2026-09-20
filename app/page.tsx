'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LandingAndLogin() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [isMounted, setIsMounted] = useState(false);
  
  const [view, setView] = useState<'login' | 'signup' | 'reset_request' | 'update_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [notification, setNotification] = useState<{type: 'error'|'success', msg: string} | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const blurOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('rpg-theme') as 'dark' | 'light';
    if (storedTheme) setTheme(storedTheme);

    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setView('update_password');
    } else {
      const wipeSessionOnBack = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await supabase.auth.signOut();
      };
      wipeSessionOnBack();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setView('update_password');
    });

    return () => subscription.unsubscribe();
  }, []);

  const changeTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('rpg-theme', newTheme);
  };

  const notify = (type: 'error' | 'success', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAuth = async (action: 'login' | 'signup') => {
    if (action === 'signup') {
      if (!playerName.trim()) return notify('error', "Player name is required!");
      if (!emailRegex.test(email.trim())) return notify('error', "Please enter a valid email format.");
      const { data: existingName } = await supabase.from('profiles').select('username').eq('username', playerName).maybeSingle();
      if (existingName) return notify('error', 'That player name is already taken. Try a different one!');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, password, options: { data: { username: playerName } }
      });

      if (authError) {
        if (authError.message.includes('already registered')) return notify('error', 'This email is already in use. Please sign in instead.');
        return notify('error', `Failed to create character: ${authError.message}`);
      }

      if (authData.user) {
        if (authData.session) {
           notify('success', 'Character forged successfully! Entering the tavern...');
           setTimeout(() => router.push('/dashboard'), 1500); 
        } else {
           notify('success', 'Scroll sent! Check your email to verify your character.');
           setView('login'); 
        }
      }
    } 
    
    if (action === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) notify('error', `Login failed: ${error.message}`);
      else router.push('/dashboard');
    }
  };

  const handleResetRequest = async () => {
    if (!email.trim()) return notify('error', "Please enter your email first.");
    if (!emailRegex.test(email.trim())) return notify('error', "Please enter a valid email format.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
    if (error) return notify('error', `Failed: ${error.message}`);
    notify('success', "A password recovery link has been sent to your email! (Check your spam folder).");
    setView('login');
  };

  const handlePasswordUpdate = async () => {
    if (!password.trim()) return notify('error', "Please enter a new password.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return notify('error', `Failed to update password: ${error.message}`);
    notify('success', "Password successfully forged! Welcome back to the tavern.");
    router.push('/dashboard');
  };

  if (!isMounted) return null;
  const isDark = theme === 'dark';

  return (
    <div ref={scrollRef} className={`relative h-screen w-full overflow-y-scroll snap-y snap-mandatory font-sans bg-cover bg-center bg-fixed transition-all duration-700 bg-[url('/background.jpg')] ${isDark ? "bg-[#0a0f1c]" : "bg-slate-100"}`}>
      
      <div className={`fixed top-4 right-4 z-[100] flex items-center p-1 rounded-full shadow-2xl border transition-all ${isDark ? 'bg-slate-800/80 border-slate-600 backdrop-blur-sm' : 'bg-white/80 border-slate-300 backdrop-blur-sm'}`}>
        <button onClick={() => changeTheme('light')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!isDark ? 'bg-amber-100 shadow-md text-amber-500 scale-110' : 'text-slate-400 hover:text-slate-200'}`}>☀️</button>
        <button onClick={() => changeTheme('dark')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDark ? 'bg-slate-900 shadow-md text-blue-300 scale-110' : 'text-slate-500 hover:text-slate-800'}`}>🌙</button>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl border ${notification.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-200' : 'bg-green-950/90 border-green-500/50 text-green-200'} backdrop-blur-md`}>
            <span className="font-semibold tracking-wide text-sm">{notification.msg}</span>
            <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/20 rounded-md shrink-0"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ opacity: blurOpacity }} className={`fixed inset-0 backdrop-blur-md pointer-events-none z-0 transition-colors duration-500 ${isDark ? 'bg-slate-950/80' : 'bg-white/60'}`} />
      
      <div className="relative z-10 h-screen w-full snap-start flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className={`p-10 rounded-3xl backdrop-blur-[4px] border shadow-2xl z-10 transition-colors duration-500 ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-white/50'}`}>
          <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>QuestLog</h1>
          <p className={`text-xl md:text-2xl max-w-2xl font-medium drop-shadow-md leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            Gamify your everyday life with an RPG-style daily task management system.
          </p>
        </motion.div>

        <div onClick={() => scrollRef.current?.scrollBy({ top: window.innerHeight, behavior: 'smooth' })} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer animate-bounce group z-20">
          <span className={`text-sm font-bold tracking-widest uppercase mb-1 transition-colors ${isDark ? 'text-white/70 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
            {view === 'update_password' ? 'Scroll to Reset Password' : 'Scroll to Enter'}
          </span>
          <svg className={`w-8 h-8 transition-colors ${isDark ? 'text-white/70 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>

      <div className="relative z-10 h-screen w-full snap-start flex flex-col items-center justify-center px-4 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.5 }} transition={{ duration: 0.6 }} className={`relative z-10 p-8 rounded-2xl shadow-2xl w-full max-w-sm border backdrop-blur-md transition-colors duration-500 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-white/50'}`}>
          <AnimatePresence mode="wait">
            
            {view === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                <h2 className="text-3xl font-bold mb-2 text-center text-indigo-600">Welcome Back</h2>
                <p className={`text-center font-medium mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Join the experience</p>
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-50/80 border-slate-300 text-black'}`} />
                <div className="relative flex flex-col items-end">
                  <div className="w-full relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 pr-10 transition-colors ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-50/80 border-slate-300 text-black'}`} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 transition-colors">
                      {showPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                    </button>
                  </div>
                  <button onClick={() => setView('reset_request')} className="text-xs text-indigo-500 hover:text-indigo-600 mt-2 font-bold tracking-wide">Lost your password?</button>
                </div>
                <button onClick={() => handleAuth('login')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all">Sign In</button>
                <button onClick={() => setView('signup')} className={`w-full font-bold py-3 hover:underline transition-colors ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Need a character? Sign up</button>
              </motion.div>
            )}

            {view === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-3xl font-bold mb-2 text-center text-indigo-600">New Character</h2>
                <p className={`text-center font-medium mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Build your legacy</p>
                <input type="text" placeholder="Unique Player Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-50/80 border-slate-300 text-black'}`} />
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-50/80 border-slate-300 text-black'}`} />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 pr-10 transition-colors ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-50/80 border-slate-300 text-black'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 transition-colors">
                    {showPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
                <button onClick={() => handleAuth('signup')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all">Confirm</button>
                <button onClick={() => setView('login')} className={`w-full font-bold py-3 hover:underline transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Back to Login</button>
              </motion.div>
            )}

            {view === 'reset_request' && (
              <motion.div key="reset_request" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                <h2 className="text-3xl font-bold mb-2 text-center text-indigo-600">Reset Password</h2>
                <p className={`text-center font-medium mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Enter your email to receive a recovery link.</p>
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-50/80 border-slate-300 text-black'}`} />
                <button onClick={handleResetRequest} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-all">Send Link</button>
                <button onClick={() => setView('login')} className={`w-full font-bold py-3 hover:underline transition-colors ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>Cancel</button>
              </motion.div>
            )}

            {view === 'update_password' && (
              <motion.div key="update_password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-3xl font-bold mb-2 text-center text-indigo-600">Set New Password</h2>
                <p className={`text-center font-medium mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Link accepted. Enter your new password below.</p>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 pr-10 transition-colors ${isDark ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-slate-50/80 border-slate-300 text-black'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 transition-colors">
                    {showPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
                <button onClick={handlePasswordUpdate} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all">Save & Enter</button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}