import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../services/storageService';
import { userService } from '../services/userService';

const STORAGE_KEY = 'campusconnect.auth.session';

export const AuthContext = createContext(null);

const getToken = (payload) => payload?.access_token || payload?.token || null;

const buildSession = (payload, userOverride) => {
  const token = getToken(payload);
  const expiresIn = payload?.expires_in || 0;
  const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;

  return {
    accessToken: token,
    tokenType: payload?.token_type || 'bearer',
    expiresAt,
    user: userOverride || payload?.user || null,
  };
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState({
    accessToken: null,
    tokenType: 'bearer',
    expiresAt: null,
    user: null,
  });
  const [isBooting, setIsBooting] = useState(true);
  const [authError, setAuthError] = useState(null);

  const persistSession = useCallback(async (nextSession) => {
    setSession(nextSession);
    await tokenStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const stored = await tokenStorage.getItem(STORAGE_KEY);
        if (stored && mounted) {
          const parsed = JSON.parse(stored);
          if (!parsed.expiresAt || parsed.expiresAt > Date.now()) {
            setSession(parsed);
          } else {
            await tokenStorage.deleteItem(STORAGE_KEY);
          }
        }
      } catch {
        await tokenStorage.deleteItem(STORAGE_KEY);
      } finally {
        if (mounted) setIsBooting(false);
      }
    }

    restoreSession();
    return () => {
      mounted = false;
    };
  }, []);

  const enrichUser = useCallback(async (token, fallbackUser) => {
    try {
      const gatewayUser = await authService.me(token);
      return { ...fallbackUser, ...gatewayUser };
    } catch {
      return fallbackUser;
    }
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      setAuthError(null);
      const payload = await authService.login({ email, password });
      const token = getToken(payload);
      const user = await enrichUser(token, payload.user);
      const nextSession = buildSession(payload, user);
      await persistSession(nextSession);
      return nextSession;
    },
    [enrichUser, persistSession]
  );

  const signUp = useCallback(
    async ({ name, email, password, profile }) => {
      setAuthError(null);
      const payload = await authService.register({ name, email, password });
      const token = getToken(payload);
      const user = await enrichUser(token, payload.user);

      if (profile?.career && profile?.semester && user?.id) {
        try {
          await userService.createProfile(
            {
              user_id: user.id,
              bio: profile.bio || `Universidad: ${profile.university || 'No registrada'}`,
              career: profile.career,
              semester: Number(profile.semester),
            },
            token
          );
        } catch (error) {
          setAuthError(error.message);
        }
      }

      const nextSession = buildSession(payload, user);
      await persistSession(nextSession);
      return nextSession;
    },
    [enrichUser, persistSession]
  );

  const refreshSession = useCallback(async () => {
    if (!session.accessToken) return null;
    const payload = await authService.refresh(session.accessToken);
    const user = await enrichUser(getToken(payload), session.user);
    const nextSession = buildSession(payload, user);
    await persistSession(nextSession);
    return nextSession;
  }, [enrichUser, persistSession, session.accessToken, session.user]);

  const signOut = useCallback(async () => {
    const token = session.accessToken;
    setSession({ accessToken: null, tokenType: 'bearer', expiresAt: null, user: null });
    await tokenStorage.deleteItem(STORAGE_KEY);
    if (token) {
      try {
        await authService.logout(token);
      } catch {
        // Local logout is enough for the app if the gateway is unavailable.
      }
    }
  }, [session.accessToken]);

  const updateUser = useCallback(
    async (user) => {
      const nextSession = { ...session, user: { ...session.user, ...user } };
      await persistSession(nextSession);
    },
    [persistSession, session]
  );

  const value = useMemo(
    () => ({
      ...session,
      authError,
      isAuthenticated: Boolean(session.accessToken),
      isBooting,
      signIn,
      signUp,
      signOut,
      refreshSession,
      updateUser,
    }),
    [authError, isBooting, refreshSession, session, signIn, signOut, signUp, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
