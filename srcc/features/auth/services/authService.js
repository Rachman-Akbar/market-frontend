import {
  apiClient,
  BASE_SESSION_KEY,
  BASE_TOKEN_KEY,
  WINDOW_SESSION_KEY,
  WINDOW_TOKEN_KEY,
} from "@/core/utils/apiClient";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { firebaseAuth, googleProvider, hasFirebaseConfig } from "./firebaseClient";

const DEFAULT_DEVICE_NAME = "marketplace-web";
const IDENTITY_API_PREFIX = "/api/v1/identity";
const AUTH_PREFIX = "/auth";

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
  return `/${makePath(IDENTITY_API_PREFIX, AUTH_PREFIX, path)}`;
}

export const authApi = apiClient;

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

function normalizeRole(value) {
  if (typeof value === "string") {
    return value.toLowerCase().trim();
  }

  return String(value?.name || value?.role || value?.value || value?.slug || "")
    .toLowerCase()
    .trim();
}

function normalizeRoles(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map(normalizeRole).filter(Boolean))];
}

function getInitial(name = "") {
  const source = String(name || "User").trim();
  return source.slice(0, 1).toUpperCase() || "U";
}

function resolveDeviceName(value, role = "buyer") {
  const deviceName = String(value || "").trim();
  return deviceName || `${DEFAULT_DEVICE_NAME}-${role}`;
}

function getSource(payload = {}) {
  return payload?.data?.data ?? payload?.data ?? payload ?? {};
}

function readBaseSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const session = parseJson(localStorage.getItem(BASE_SESSION_KEY));
  const token = localStorage.getItem(BASE_TOKEN_KEY) || session?.token || "";

  if (!session && !token) {
    return null;
  }

  return {
    ...(session || {}),
    token,
    storageScope: "base",
  };
}

function readWindowSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const session = parseJson(sessionStorage.getItem(WINDOW_SESSION_KEY));
  const token = sessionStorage.getItem(WINDOW_TOKEN_KEY) || session?.token || "";

  if (!session && !token) {
    return null;
  }

  return {
    ...(session || {}),
    token,
    storageScope: "window",
  };
}

export function normalizeAuthPayload(payload = {}, fallbackSession = null) {
  const source = getSource(payload);
  const nestedSource = source?.data && typeof source.data === "object" ? source.data : null;
  const userSource = source?.user || nestedSource?.user || nestedSource || source || {};
  const fallbackUser = fallbackSession?.user || {};
  const roles = normalizeRoles(
    source?.roles ||
      nestedSource?.roles ||
      userSource?.roles ||
      fallbackSession?.roles ||
      fallbackUser?.roles ||
      []
  );
  const requestedActiveRole = getFirstValue(
    source?.active_role,
    source?.activeRole,
    nestedSource?.active_role,
    nestedSource?.activeRole,
    userSource?.active_role,
    userSource?.activeRole,
    userSource?.role,
    fallbackSession?.activeRole,
    fallbackSession?.active_role,
    fallbackUser?.role,
    roles[0],
    "buyer"
  );
  const activeRole = normalizeRole(requestedActiveRole) || "buyer";
  const token = getFirstValue(
    source?.access_token,
    source?.api_token,
    source?.token,
    nestedSource?.access_token,
    nestedSource?.api_token,
    nestedSource?.token,
    payload?.access_token,
    payload?.api_token,
    payload?.token,
    fallbackSession?.token
  );
  const name = getFirstValue(
    userSource?.name,
    userSource?.displayName,
    source?.name,
    fallbackUser?.name,
    "User"
  );
  const email = getFirstValue(
    userSource?.email,
    source?.email,
    fallbackUser?.email,
    ""
  );
  const avatar = getFirstValue(
    userSource?.avatar,
    userSource?.photoURL,
    userSource?.picture,
    source?.avatar,
    source?.picture,
    fallbackUser?.avatar,
    fallbackUser?.photoURL,
    fallbackUser?.picture
  );
  const id = getFirstValue(
    userSource?.id,
    userSource?.uid,
    userSource?.firebase_uid,
    source?.id,
    source?.uid,
    fallbackUser?.id,
    fallbackUser?.uid
  );
  const firebaseUid = getFirstValue(
    userSource?.firebase_uid,
    userSource?.firebaseUid,
    source?.firebase_uid,
    source?.firebaseUid,
    fallbackUser?.firebase_uid,
    fallbackUser?.firebaseUid
  );

  return {
    ...(fallbackSession || {}),
    token: token || "",
    tokenType: source?.token_type || fallbackSession?.tokenType || "Bearer",
    user: {
      ...fallbackUser,
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
    store:
      source?.store ??
      nestedSource?.store ??
      userSource?.store ??
      fallbackSession?.store ??
      null,
    storageScope: fallbackSession?.storageScope || "base",
  };
}

export function getApiErrorMessage(error, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  const responseData = error?.response?.data;

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (responseData?.errors && typeof responseData.errors === "object") {
    const firstError = Object.values(responseData.errors).flat().find(Boolean);

    if (firstError) {
      return String(firstError);
    }
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function getCurrentSessionScope() {
  return readWindowSession()?.token ? "window" : "base";
}

export function readStoredToken() {
  return readStoredSession()?.token || "";
}

export function readStoredSession() {
  const baseSession = readBaseSession();
  const windowSession = readWindowSession();

  if (windowSession?.token) {
    return {
      ...(baseSession || {}),
      ...windowSession,
      user: {
        ...(baseSession?.user || {}),
        ...(windowSession.user || {}),
      },
      token: windowSession.token,
      storageScope: "window",
    };
  }

  if (baseSession?.token) {
    return baseSession;
  }

  return null;
}

export function persistSession(session, options = {}) {
  if (typeof window === "undefined") {
    return session;
  }

  const scope = options.scope || session?.storageScope || "base";
  const token = String(session?.token || "").trim();

  if (!token) {
    throw new Error("Backend tidak mengembalikan token Sanctum.");
  }

  const nextSession = {
    ...session,
    token,
    storageScope: scope,
  };

  if (scope === "window") {
    sessionStorage.setItem(WINDOW_TOKEN_KEY, token);
    sessionStorage.setItem(WINDOW_SESSION_KEY, JSON.stringify(nextSession));
  } else {
    localStorage.setItem(BASE_TOKEN_KEY, token);
    localStorage.setItem(BASE_SESSION_KEY, JSON.stringify(nextSession));
    sessionStorage.removeItem(WINDOW_TOKEN_KEY);
    sessionStorage.removeItem(WINDOW_SESSION_KEY);
    sessionStorage.removeItem(BASE_TOKEN_KEY);
    sessionStorage.removeItem(BASE_SESSION_KEY);
  }

  return nextSession;
}

export function clearStoredSession(options = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const scope = options.scope || getCurrentSessionScope();

  if (options.all || scope === "base") {
    localStorage.removeItem(BASE_TOKEN_KEY);
    localStorage.removeItem(BASE_SESSION_KEY);
    sessionStorage.removeItem(WINDOW_TOKEN_KEY);
    sessionStorage.removeItem(WINDOW_SESSION_KEY);
    sessionStorage.removeItem(BASE_TOKEN_KEY);
    sessionStorage.removeItem(BASE_SESSION_KEY);
    return;
  }

  sessionStorage.removeItem(WINDOW_TOKEN_KEY);
  sessionStorage.removeItem(WINDOW_SESSION_KEY);
}

async function ensureFirebaseReady() {
  if (!hasFirebaseConfig() || !firebaseAuth) {
    throw new Error("Konfigurasi Firebase Google Login belum lengkap.");
  }

  await setPersistence(firebaseAuth, browserSessionPersistence);
}

async function loginBackendWithFirebaseUser(firebaseUser, options = {}) {
  if (!firebaseUser?.uid) {
    throw new Error("Sesi Google Firebase tidak ditemukan.");
  }

  const requestedRole = normalizeRole(options.role || "buyer") || "buyer";
  const storageScope = options.storageScope || "base";
  const promiseKey = `${firebaseUser.uid}:${requestedRole}:${storageScope}`;

  if (firebaseBackendLoginPromise && firebaseBackendLoginUid === promiseKey) {
    return firebaseBackendLoginPromise;
  }

  firebaseBackendLoginUid = promiseKey;
  firebaseBackendLoginPromise = (async () => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const response = await authApi.post(
        getAuthPath("firebase-login"),
        {
          role: requestedRole,
          device_name: resolveDeviceName(options.deviceName, requestedRole),
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      const normalized = normalizeAuthPayload(response.data, {
        storageScope,
      });

      return persistSession(normalized, {
        scope: storageScope,
      });
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
  const role = normalizeRole(payload?.role || "buyer") || "buyer";
  const storageScope = payload?.storageScope || "base";

  if (!email || !password) {
    throw new Error("Email dan password wajib diisi.");
  }

  const response = await authApi.post(getAuthPath("password-login"), {
    email,
    password,
    role,
    device_name: resolveDeviceName(payload?.deviceName, role),
  });
  const normalized = normalizeAuthPayload(response.data, {
    storageScope,
  });

  return persistSession(normalized, {
    scope: storageScope,
  });
}

export async function registerWithPassword(payload) {
  const name = String(payload?.name || "").trim();
  const email = String(payload?.email || "").trim();
  const password = String(payload?.password || "");
  const passwordConfirmation = String(
    payload?.password_confirmation || payload?.confirm || ""
  );

  if (!name || !email || !password || !passwordConfirmation) {
    throw new Error("Semua field wajib diisi.");
  }

  if (password !== passwordConfirmation) {
    throw new Error("Konfirmasi password tidak cocok.");
  }

  const response = await authApi.post(getAuthPath("password-register"), {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
    device_name: resolveDeviceName(payload?.deviceName, "buyer"),
  });
  const normalized = normalizeAuthPayload(response.data, {
    storageScope: "base",
  });

  return persistSession(normalized, {
    scope: "base",
  });
}

export async function loginWithGoogle(options = {}) {
  await ensureFirebaseReady();

  if (!googleProvider) {
    throw new Error("Google provider Firebase belum aktif.");
  }

  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return loginBackendWithFirebaseUser(credential.user, options);
}

export async function requestPasswordReset(email) {
  const targetEmail = String(email || "").trim();

  if (!targetEmail) {
    throw new Error("Email wajib diisi.");
  }

  await authApi.post(getAuthPath("forgot-password"), {
    email: targetEmail,
  });

  return true;
}

export async function fetchCurrentAuthUser() {
  const currentSession = readStoredSession();

  if (!currentSession?.token) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  const response = await authApi.get(getAuthPath("me"));
  const normalized = normalizeAuthPayload(response.data, currentSession);

  return persistSession(normalized, {
    scope: currentSession.storageScope || getCurrentSessionScope(),
  });
}

export async function switchActiveRole(role, options = {}) {
  const targetRole = normalizeRole(role);

  if (!targetRole) {
    throw new Error("Role tujuan tidak valid.");
  }

  const currentSession = readStoredSession();

  if (!currentSession?.token) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  const response = await authApi.post(getAuthPath("switch-role"), {
    role: targetRole,
    device_name: resolveDeviceName(options.deviceName, targetRole),
  });
  const storageScope = options.storageScope || "window";
  const normalized = normalizeAuthPayload(response.data, {
    ...currentSession,
    activeRole: targetRole,
    storageScope,
  });

  return persistSession(
    {
      ...normalized,
      activeRole: normalized.activeRole || targetRole,
      user: {
        ...(normalized.user || {}),
        role: normalized.activeRole || targetRole,
      },
      storageScope,
    },
    {
      scope: storageScope,
    }
  );
}

export async function logoutFromApi() {
  const scope = getCurrentSessionScope();
  const hasToken = Boolean(readStoredToken());

  try {
    if (hasToken) {
      await authApi.post(getAuthPath("logout"));
    }
  } finally {
    clearStoredSession({ scope });

    if (scope === "base" && firebaseAuth?.currentUser) {
      await signOut(firebaseAuth);
    }
  }
}
