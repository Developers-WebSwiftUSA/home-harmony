const TOKEN_KEY = "auth_token";

let memoryToken: string | null = null;

export const getAuthToken = (): string | null => {
  if (memoryToken) return memoryToken;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null) => {
  memoryToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
};

export const clearAuthToken = () => setAuthToken(null);
