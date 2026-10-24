import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, UserRound } from 'lucide-react';
const AccountContext = createContext<{ user: User | null }>({ user: null });
export const useMusicAccount = () => useContext(AccountContext);
export function MusicAccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); const queries = useQueryClient();
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') { void router.invalidate(); if (event !== 'SIGNED_OUT') void queries.invalidateQueries(); }
    });
    return () => data.subscription.unsubscribe();
  }, [router, queries]);
  return <AccountContext.Provider value={{ user }}>{children}</AccountContext.Provider>;
}
export function MusicAccount() {
  const { user } = useMusicAccount(); const queries = useQueryClient();
  const [open, setOpen] = useState(false); const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true); setMessage('');
    try {
      const result = signup ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } }) : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setMessage(result.error.message);
      else if (signup && !result.data.session) setMessage('Check your email to confirm your account.');
      else setOpen(false);
    } finally { setBusy(false); }
  }
  return <div>
    {user ? <div className="flex items-center gap-2 text-sm"><UserRound className="size-4 text-primary" /><span>My account</span><Button variant="ghost" size="icon" title="Sign out" aria-label="Sign out" onClick={async () => { await queries.cancelQueries(); queries.clear(); await supabase.auth.signOut(); }}><LogOut /></Button></div> : <Button variant="outline" onClick={() => setOpen(!open)}><UserRound /> Sign in</Button>}
    {open && !user && <div className="mt-4 max-w-md space-y-3 border-l-2 border-primary pl-4">
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={async () => { const r = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin }); if (r.error) setMessage(r.error.message); }}>Continue with Google</Button><Button variant="outline" onClick={async () => { const r = await lovable.auth.signInWithOAuth('lovable', { redirect_uri: window.location.origin }); if (r.error) setMessage(r.error.message); }}>Continue with Lovable</Button></div>
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); void submit(); }}><Input aria-label="Email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><Input aria-label="Password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" /><Button type="submit" disabled={busy}>{signup ? 'Create account' : 'Sign in with email'}</Button><Button type="button" variant="link" onClick={() => setSignup(!signup)}>{signup ? 'Already have an account?' : 'Create an account'}</Button></form>
      <Button variant="link" onClick={async () => { if (!email) { setMessage('Enter your email first.'); return; } const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); setMessage(error?.message ?? 'Check your email for a password reset link.'); }}>Forgot password?</Button>
      {message && <p role="status" className="text-sm text-primary">{message}</p>}
    </div>}
  </div>;
}