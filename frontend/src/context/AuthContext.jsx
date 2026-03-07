import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("canvasClubToken") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setAuthToken("");
      setUser(null);
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setAuthToken(token);
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch {
        localStorage.removeItem("canvasClubToken");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    localStorage.setItem("canvasClubToken", response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
    setAuthToken(response.data.access_token);

    return response.data.user;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });

    localStorage.setItem("canvasClubToken", response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
    setAuthToken(response.data.access_token);

    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem("canvasClubToken");
    setToken("");
    setUser(null);
    setAuthToken("");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
  return context;
};
