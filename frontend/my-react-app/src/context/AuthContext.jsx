import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "./ApiContext";
import { AuthContext } from "./authStore";

async function readResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(payload.errors) ? ` ${payload.errors.join(" ")}` : "";
    throw new Error(payload.message ? `${payload.message}${details}` : "Сталася помилка. Спробуйте ще раз.");
  }
  return payload;
}

export function AuthProvider({ children }) {
  const { apiData } = useApi();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${apiData}/auth/me`, { credentials: "include" });
      if (response.ok) {
        setUser(await response.json());
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiData]);

  useEffect(() => {
    setIsLoading(true);
    getCurrentUser();
  }, [getCurrentUser]);

  const login = useCallback(async (credentials) => {
    const response = await fetch(`${apiData}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });
    const signedInUser = await readResponse(response);
    setUser(signedInUser);
    return signedInUser;
  }, [apiData]);

  const register = useCallback(async (details) => {
    const response = await fetch(`${apiData}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(details),
    });
    const signedInUser = await readResponse(response);
    setUser(signedInUser);
    return signedInUser;
  }, [apiData]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${apiData}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
    }
  }, [apiData]);

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

