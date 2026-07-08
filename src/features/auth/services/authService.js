import axios from "axios";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { off, onValue, ref, update } from "firebase/database";
import { firebaseAuth, firebaseDatabase, googleProvider, hasFirebaseConfig } from "./firebaseClient";

const TOKEN_KEY = "marketku_auth_token";
const SESSION_KEY = "marketku_auth_session";
const DEVICE_NAME = "marketplace-web";
const IDENTITY_API_PREFIX = "/api/v1/identity";
const AUTH_PREFIX = "/auth";
const REALTIME_USERS_PATH = "users";

let firebaseBackendLoginPromise = null;
let firebaseBackendLoginUid = null;

function trimSlash(value = "") {
  return String(value).replace(/^\/+|\/+$/g, "");
}

function makePath(...parts) {
  return parts
    .filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
    .map((item) => trimSlash(item))
    .filter(Boolean)
    .join("/");
}

function getAuthPath(path) {
  return `/${makePath(AUTH_PREFIX, path)}`;
}

export const authApi = axios.create({
  baseURL: IDENTITY_API_PREFIX,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

authApi.interceptors.request.use((config) => {
  const token = readStoredToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function parseJson(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getFirstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeRoles(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((role) => {
      if (typeof role === "string") return role;
      return role?.name || role?.role || role?.value || "";
    })
    .map((role) => String(role).toLowerCase().trim())
    .filter(Boolean);
}

function getInitial(name = "") {
  const source = String(name || "User").trim();
  return source.slice(0, 1).toUpperCase() || "U";
}

export function normalizeAuthPayload(payload = {}) {
  const source = payload?.data?.data || payload?.data || payload;
  const userSource = source?.user || source?.data?.user || source?.data || source || {};
  const roles = normalizeRoles(source?.roles || userSource?.roles || []);
  const activeRole = String(source?.active_role || userSource?.active_role || roles[0] || "buyer").toLowerCase();
  const token = getFirstValue(source?.access_token, source?.api_token, source?.token, payload?.access_token, payload?.api_token);
  const name = getFirstValue(userSource?.name, userSource?.displayName, source?.name, "User");
  const email = getFirstValue(userSource?.email, source?.email, "");
  const avatar = getFirstValue(userSource?.avatar, userSource?.photoURL, userSource?.picture, source?.avatar, source?.picture);
  const id = getFirstValue(userSource?.id, userSource?.uid, userSource?.firebase_uid, source?.id, source?.uid);
  const firebaseUid = getFirstValue(userSource?.firebase_uid, userSource?.firebaseUid, userSource?.uid, source?.firebase_uid, source?.firebaseUid);

  return {
    token,
    tokenType: source?.token_type || "Bearer",
    user: {
      ...userSource,
      id: id ? String(id) : "",
      firebase_uid: firebaseUid ? String(firebaseUid) : null,
      name,
      email,
      avatar: avatar || getInitial(name),
      role: activeRole,
      roles,
    },
    roles,
    activeRole,
    store: source?.store || userSource?.store || null,
  };
}

export function getApiErrorMessage(error, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === "string") return responseData.message;

  if (responseData?.errors && typeof responseData.errors === "object") {
    const firstError = Object.values(responseData.errors).flat().find(Boolean);
    if (firstError) return String(firstError);
  }

  if (typeof error?.message === "string") return error.message;

  return fallback;
}

export function readStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function readStoredSession() {
  return parseJson(localStorage.getItem(SESSION_KEY));
}

export function persistSession(session) {
  if (session?.token) localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getFirebaseUid(sessionUser, firebaseUser) {
  return sessionUser?.firebase_uid || sessionUser?.firebaseUid || firebaseUser?.uid || null;
}

export function mapFirebaseUser(user) {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || user.email || "User",
    avatar: user.photoURL || getInitial(user.displayName || user.email),
    emailVerified: user.emailVerified,
  };
}

async function ensureFirebaseReady() {
  if (!hasFirebaseConfig() || !firebaseAuth) {
    throw new Error("Konfigurasi Firebase belum lengkap.");
  }

  await setPersistence(firebaseAuth, browserLocalPersistence);
}

async function loginBackendWithFirebaseUser(firebaseUser) {
  if (!firebaseUser?.uid) {
    throw new Error("Sesi Firebase tidak ditemukan.");
  }

  if (firebaseBackendLoginPromise && firebaseBackendLoginUid === firebaseUser.uid) {
    return firebaseBackendLoginPromise;
  }

  firebaseBackendLoginUid = firebaseUser.uid;
  firebaseBackendLoginPromise = (async () => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await authApi.post(
        getAuthPath("firebase-login"),
        { device_name: DEVICE_NAME },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const session = normalizeAuthPayload(response.data);
      return persistSession(session);
    } finally {
      firebaseBackendLoginPromise = null;
      firebaseBackendLoginUid = null;
    }
  })();

  return firebaseBackendLoginPromise;
}

export async function loginWithPassword(payload) {
  const email = String(payload?.email || "").trim();
  const password = String(payload?.password || "");

  if (!email || !password) {
    throw new Error("Email dan password wajib diisi.");
  }

  if (hasFirebaseConfig() && firebaseAuth) {
    try {
      await ensureFirebaseReady();
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      return await loginBackendWithFirebaseUser(credential.user);
    } catch (error) {
      if (!error?.code || !String(error.code).startsWith("auth/")) throw error;
    }
  }

  const response = await authApi.post(getAuthPath("password-login"), {
    email,
    password,
    device_name: DEVICE_NAME,
  });

  const session = normalizeAuthPayload(response.data);
  return persistSession(session);
}

export async function registerWithPassword(payload) {
  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim();
  const password = String(payload?.password || "");
  const passwordConfirmation = String(payload?.password_confirmation || payload?.confirm || "");

  if (!name || !email || !password || !passwordConfirmation) {
    throw new Error("Semua field wajib diisi.");
  }

  if (password !== passwordConfirmation) {
    throw new Error("Konfirmasi password tidak cocok.");
  }

  if (hasFirebaseConfig() && firebaseAuth) {
    await ensureFirebaseReady();
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await updateProfile(credential.user, { displayName: name });
    const session = await loginBackendWithFirebaseUser(credential.user);

    try {
      await saveRealtimeUserProfile(getFirebaseUid(session.user, credential.user), {
        id: session.user?.id || null,
        firebase_uid: credential.user.uid,
        name,
        email,
        avatar: session.user?.avatar || getInitial(name),
        roles: session.roles || ["buyer"],
        active_role: session.activeRole || "buyer",
        updated_at: new Date().toISOString(),
      });
    } catch {
      return session;
    }

    return session;
  }

  const response = await authApi.post(getAuthPath("password-register"), {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
    device_name: DEVICE_NAME,
  });

  const session = normalizeAuthPayload(response.data);
  return persistSession(session);
}

export async function loginWithCurrentFirebaseUser() {
  await ensureFirebaseReady();

  if (!firebaseAuth.currentUser) {
    throw new Error("Sesi Firebase tidak ditemukan.");
  }

  return await loginBackendWithFirebaseUser(firebaseAuth.currentUser);
}

export async function loginWithGoogle() {
  await ensureFirebaseReady();

  if (!googleProvider) {
    throw new Error("Google provider Firebase belum aktif.");
  }

  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  const session = await loginBackendWithFirebaseUser(credential.user);

  try {
    await saveRealtimeUserProfile(getFirebaseUid(session.user, credential.user), {
      id: session.user?.id || null,
      firebase_uid: credential.user.uid,
      name: credential.user.displayName || session.user?.name || "User",
      email: credential.user.email || session.user?.email || "",
      avatar: credential.user.photoURL || session.user?.avatar || getInitial(credential.user.displayName),
      roles: session.roles || ["buyer"],
      active_role: session.activeRole || "buyer",
      updated_at: new Date().toISOString(),
    });
  } catch {
    return session;
  }

  return session;
}

export async function requestPasswordReset(email) {
  const targetEmail = String(email || "").trim();

  if (!targetEmail) {
    throw new Error("Email wajib diisi.");
  }

  await ensureFirebaseReady();
  await sendPasswordResetEmail(firebaseAuth, targetEmail);
  return true;
}

export async function fetchCurrentAuthUser() {
  const response = await authApi.get(getAuthPath("me"));
  const session = normalizeAuthPayload({ ...response.data, access_token: readStoredToken() });
  return persistSession(session);
}

export async function switchActiveRole(role) {
  const response = await authApi.post(getAuthPath("switch-role"), {
    role,
    device_name: DEVICE_NAME,
  });

  const stored = readStoredSession() || {};
  const source = response.data || {};
  const token = source.access_token || source.api_token || stored.token;

  const nextSession = {
    ...stored,
    token,
    tokenType: source.token_type || stored.tokenType || "Bearer",
    activeRole: source.active_role || role,
    user: {
      ...(stored.user || {}),
      role: source.active_role || role,
    },
  };

  return persistSession(nextSession);
}

export async function logoutFromApi() {
  try {
    if (readStoredToken()) {
      await authApi.post(getAuthPath("logout"));
    }
  } finally {
    clearStoredSession();

    if (firebaseAuth?.currentUser) {
      await signOut(firebaseAuth);
    }
  }
}

export function listenFirebaseAuth(callback) {
  if (!firebaseAuth) return () => {};
  return onAuthStateChanged(firebaseAuth, (user) => callback(mapFirebaseUser(user)));
}

export function subscribeRealtimeUser(uid, callback, errorCallback) {
  if (!firebaseDatabase || !uid) return () => {};

  const userRef = ref(firebaseDatabase, makePath(REALTIME_USERS_PATH, uid));

  onValue(
    userRef,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    },
    errorCallback
  );

  return () => off(userRef);
}

export async function saveRealtimeUserProfile(uid, payload) {
  if (!firebaseDatabase || !uid || !payload) return false;

  const userRef = ref(firebaseDatabase, makePath(REALTIME_USERS_PATH, uid));
  await update(userRef, Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)));
  return true;
}