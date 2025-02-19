"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, DocumentSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// 📌 Definim contextul cu valori implicite
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const unsubscribeFirestoreRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Doar dacă userul este autentificat, setăm listener-ul pentru Firestore
        unsubscribeFirestoreRef.current = onSnapshot(
          doc(db, "users", user.uid),
          (snapshot: DocumentSnapshot) => {
            if (snapshot.exists()) {
              // Aici putem procesa datele dacă este necesar
              console.log("User data updated:", snapshot.data());
            }
          },
          (error) => {
            console.error("Firestore Error:", error);
          }
        );
      } else {
        // Dacă userul nu este autentificat, ne asigurăm că dezabonăm listener-ul
        if (unsubscribeFirestoreRef.current) {
          unsubscribeFirestoreRef.current();
        }
        router.push("/auth");
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeFirestoreRef.current) {
        unsubscribeFirestoreRef.current();
      }
    };
  }, [mounted, router]);

  const logout = async () => {
    try {
      if (unsubscribeFirestoreRef.current) {
        unsubscribeFirestoreRef.current();
      }
      await auth.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut: logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

