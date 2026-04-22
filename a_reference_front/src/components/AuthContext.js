// src/components/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { isJwtFormatValid, normalizeToken } from "../utils/tokenUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = normalizeToken(localStorage.getItem("token"));

    console.log("🔐 AuthContext init:", {
      hasStoredUser: !!storedUser,
      hasToken: !!token,
      tokenValid: token ? isJwtFormatValid(token) : false
    });

    if (storedUser && token && isJwtFormatValid(token)) {
      localStorage.setItem("token", token);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      console.log("✅ AuthContext: Utilisateur restauré depuis localStorage");
    } else {
      console.warn("⚠️ AuthContext: Pas de session valide trouvée");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const normalizedToken = normalizeToken(token);
    if (!normalizedToken || !isJwtFormatValid(normalizedToken)) return;
    localStorage.setItem("token", normalizedToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
