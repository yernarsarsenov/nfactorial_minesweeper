'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    // Demo/Guest login for the nfactorial challenge
    const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (isDemoMode) {
      setUser({
        id: 'demo-user',
        email: 'guest@nfactorial.io',
        user_metadata: { full_name: 'Guest Player', avatar_url: '' },
        app_metadata: {},
        aud: '',
        created_at: '',
      } as User);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) {
      console.error('Error signing in:', error.message);
      // Fallback to demo user if provider is not enabled
      if (error.message.includes('provider') || error.message.includes('validation_failed')) {
        setUser({
          id: 'demo-user',
          email: 'guest@nfactorial.io',
          user_metadata: { full_name: 'Guest Player (Demo)', avatar_url: '' },
          app_metadata: {},
          aud: '',
          created_at: '',
        } as User);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  return { user, loading, signInWithGoogle, signOut };
};
