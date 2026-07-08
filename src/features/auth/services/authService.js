const STORAGE_KEY = "marketku_auth_user";

export function readStoredUser() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function persistUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function createDemoUser({ role = "buyer", name = "Guest User", email = "demo@marketku.com" } = {}) {
  return {
    id: `${role}-demo-user`,
    name: name || "Guest User",
    email,
    role,
    avatar: name ? name.slice(0, 1).toUpperCase() : "G",
  };
}

export async function loginWithDemoCredential(payload = {}) {
  return persistUser(createDemoUser(payload));
}

export async function registerDemoBuyer(payload = {}) {
  return persistUser(createDemoUser({ ...payload, role: "buyer" }));
}
