import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  clearStoredSession,
  fetchCurrentAuthUser,
  getApiErrorMessage,
  getFirebaseUid,
  listenFirebaseAuth,
  loginWithCurrentFirebaseUser,
  loginWithGoogle as loginWithGoogleRequest,
  loginWithPassword as loginWithPasswordRequest,
  logoutFromApi,
  readStoredSession,
  registerWithPassword as registerWithPasswordRequest,
  requestPasswordReset,
  saveRealtimeUserProfile,
  subscribeRealtimeUser,
  switchActiveRole,
} from "@/features/auth/services/authService";

const AuthContext = createContext(null);

function mergeUser(sessionUser, firebaseUser, realtimeProfile) {
  const profile = realtimeProfile || {};
  const firebase = firebaseUser || {};
  const user = sessionUser || {};
  const name = profile.name || profile.displayName || user.name || firebase.name || "User";
  const email = profile.email || user.email || firebase.email || "";
  const avatar = profile.avatar || profile.photoURL || user.avatar || firebase.avatar || name.slice(0, 1).toUpperCase();

  return {
    ...user,
    ...profile,
    id: user.id || profile.id || firebase.uid || "",
    firebase_uid: user.firebase_uid || profile.firebase_uid || firebase.uid || null,
    name,
    email,
    avatar,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [realtimeProfile, setRealtimeProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const authActionRef = useRef(false);

  const syncMe = useCallback(async () => {
    const currentSession = readStoredSession();

    if (!currentSession?.token) {
      setInitializing(false);
      return null;
    }

    try {
      const nextSession = await fetchCurrentAuthUser();
      setSession(nextSession);
      return nextSession;
    } catch (apiError) {
      if (apiError?.response?.status === 401) {
        clearStoredSession();
        setSession(null);
        return null;
      }

      setSession(currentSession);
      return currentSession;
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = listenFirebaseAuth(async (nextFirebaseUser) => {
      if (!active) return;

      setFirebaseUser(nextFirebaseUser);

      if (nextFirebaseUser && !readStoredSession()?.token && !authActionRef.current) {
        try {
          const nextSession = await loginWithCurrentFirebaseUser();
          if (active) setSession(nextSession);
        } catch {
          clearStoredSession();
          if (active) setSession(null);
        }
      }
    });

    syncMe();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [syncMe]);

  useEffect(() => {
    const uid = getFirebaseUid(session?.user, firebaseUser);

    if (!uid) {
      setRealtimeProfile(null);
      return undefined;
    }

    return subscribeRealtimeUser(
      uid,
      (profile) => setRealtimeProfile(profile),
      () => setRealtimeProfile(null)
    );
  }, [firebaseUser, session?.user]);

  const runAuthAction = useCallback(async (action) => {
    authActionRef.current = true;
    setLoading(true);
    setError("");

    try {
      const nextSession = await action();
      setSession(nextSession || readStoredSession());
      return nextSession;
    } catch (authError) {
      const message = getApiErrorMessage(authError);
      setError(message);
      throw new Error(message);
    } finally {
      authActionRef.current = false;
      setLoading(false);
    }
  }, []);

  const loginWithPassword = useCallback(
    (payload) => runAuthAction(() => loginWithPasswordRequest(payload)),
    [runAuthAction]
  );

  const registerWithPassword = useCallback(
    (payload) => runAuthAction(() => registerWithPasswordRequest(payload)),
    [runAuthAction]
  );

  const loginWithGoogle = useCallback(
    () => runAuthAction(() => loginWithGoogleRequest()),
    [runAuthAction]
  );

  const forgotPassword = useCallback(
    (email) =>
      runAuthAction(async () => {
        await requestPasswordReset(email);
        return readStoredSession();
      }),
    [runAuthAction]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await logoutFromApi();
      setSession(null);
      setRealtimeProfile(null);
    } catch (authError) {
      const message = getApiErrorMessage(authError);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchRole = useCallback(
    (role) => runAuthAction(() => switchActiveRole(role)),
    [runAuthAction]
  );

  const updateRealtimeProfile = useCallback(
    async (payload) => {
      const uid = getFirebaseUid(session?.user, firebaseUser);
      await saveRealtimeUserProfile(uid, payload);
    },
    [firebaseUser, session?.user]
  );

  const user = useMemo(
    () => mergeUser(session?.user, firebaseUser, realtimeProfile),
    [firebaseUser, realtimeProfile, session?.user]
  );

  const roles = useMemo(() => {
    const source = realtimeProfile?.roles || session?.roles || user?.roles || [];
    return Array.isArray(source) ? source.map((role) => String(role).toLowerCase()) : [];
  }, [realtimeProfile?.roles, session?.roles, user?.roles]);

  const activeRole = realtimeProfile?.active_role || session?.activeRole || user?.role || roles[0] || "buyer";
  const isAuthenticated = Boolean(session?.token || firebaseUser?.uid);

  const value = useMemo(
    () => ({
      user: isAuthenticated ? user : null,
      profile: realtimeProfile,
      firebaseUser,
      token: session?.token || null,
      roles,
      activeRole,
      store: session?.store || null,
      loading,
      initializing,
      error,
      isAuthenticated,
      login: loginWithPassword,
      loginWithPassword,
      registerWithPassword,
      loginWithGoogle,
      forgotPassword,
      logout,
      switchRole,
      refreshMe: syncMe,
      updateRealtimeProfile,
      clearError: () => setError(""),
    }),
    [
      activeRole,
      error,
      firebaseUser,
      forgotPassword,
      initializing,
      isAuthenticated,
      loading,
      loginWithGoogle,
      loginWithPassword,
      logout,
      realtimeProfile,
      registerWithPassword,
      roles,
      session?.store,
      session?.token,
      switchRole,
      syncMe,
      updateRealtimeProfile,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider");
  return context;
}