"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, loginWithGoogle, logout } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: () => Promise<User | undefined>;
  logout: () => Promise<void>;
};

// 📌 Definim contextul cu valori implicite
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: loginWithGoogle,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login: loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

