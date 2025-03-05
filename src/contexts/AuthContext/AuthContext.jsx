import { createContext, useState, useContext, useEffect } from "react";
import { localeCurrencyMap } from "../../constants/localeAndSymbol";

import api from "../../services/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ token });
    }
    const localStorageLocale = localStorage.getItem('locale');
    if (!localStorageLocale || !localeCurrencyMap[localStorageLocale]) {
      handleLogout()
    } else {
      setLocale(localStorageLocale)
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("locale");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    setUser,
    loading,
    logout: handleLogout,
    locale,
    setLocale
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}