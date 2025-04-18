import { useEffect, useState } from "react";

const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("isAdmin");
    if (stored === "true") setIsAdmin(true);
  }, []);

  const login = (password: string) => {
    if (password === ADMIN_KEY) {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
  };

  return { isAdmin, login, logout };
};
