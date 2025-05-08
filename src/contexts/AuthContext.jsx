
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialAuthCheckCompleted = useRef(false);

  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    try {
      const { data, error, status } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, bio, following, followers, watchlist')
        .eq('id', userId)
        .single();

      if (error && status !== 406) { 
        console.warn('Error fetching user profile in AuthContext:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.error('Exception fetching user profile in AuthContext:', e);
      return null;
    }
  };

  const processSession = async (supabaseSession, isInitialCall = false) => {
    if (supabaseSession?.user) {
      const profile = await fetchUserProfile(supabaseSession.user.id);
      setCurrentUser({ ...supabaseSession.user, ...profile });
      setSession(supabaseSession);
    } else {
      setCurrentUser(null);
      setSession(null);
    }
    
    if (isInitialCall || !initialAuthCheckCompleted.current) {
      setLoading(false);
      initialAuthCheckCompleted.current = true;
    }
  };


  useEffect(() => {
    setLoading(true); 
    supabase.auth.getSession().then(async ({ data: { session: activeSession } }) => {
      await processSession(activeSession, true);
    }).catch(error => {
      console.error("Error getting initial session:", error);
      setCurrentUser(null);
      setSession(null);
      setLoading(false);
      initialAuthCheckCompleted.current = true;
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {

        if (!initialAuthCheckCompleted.current && (event === 'INITIAL_SESSION' || event === 'BOOTSTRAPPED')) {
          await processSession(supabaseSession, true);
          return;
        }
        
        if (initialAuthCheckCompleted.current) {
          switch (event) {
            case 'SIGNED_IN':
            case 'USER_UPDATED':
              //setLoading(true);
              //await processSession(supabaseSession, false);
              setLoading(false);
              break;
            case 'TOKEN_REFRESHED':
              //await processSession(supabaseSession, false);
              setLoading(false); 
              break;
            case 'SIGNED_OUT':
              setLoading(true);
              setCurrentUser(null);
              setSession(null);
              setLoading(false);
              break;
            default:
              setLoading(false); 
              break;
          }
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => { 
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
    
    if (data.user) {
      const profile = await fetchUserProfile(data.user.id);
      setCurrentUser({ ...data.user, ...profile });
      setSession(data.session);
    }
    setLoading(false);
    return { success: true, user: data.user, session: data.session };
  };

  const signup = async (email, password, userData) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          username: userData.username,
          avatar_url: userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || userData.username)}&background=random`,
          bio: userData.bio || '',
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setLoading(false);
      return { success: false, message: error.message };
    }
    
    setLoading(false);
    return { success: true, user: data.user, session: data.session, needsConfirmation: !data.session };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
    setLoading(false);
  };
  
  const updateUserProfileData = (updatedProfileData) => {
    setCurrentUser(prev => (prev ? {...prev, ...updatedProfileData} : null));
  }

  const value = {
    currentUser,
    session,
    loading,
    login,
    signup,
    logout,
    fetchUserProfile,
    updateUserProfileData,
    processSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};