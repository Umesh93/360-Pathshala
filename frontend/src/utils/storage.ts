const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export const storage = {
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),

  getToken: () => localStorage.getItem(TOKEN_KEY),

  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  setRole: (role: string) => localStorage.setItem(ROLE_KEY, role),

  getRole: () => localStorage.getItem(ROLE_KEY),

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};
