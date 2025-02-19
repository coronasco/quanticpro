'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Typescript interface for the authenticated user structure
interface AuthUser {
    uid: string;
    email: string | null;
}

// Context type definition for authentication management
interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    logout: () => Promise<void>;
    isPremium: boolean;
}

// Create authentication context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => {},
    isPremium: false
})

// Authentication Provider component that manages user authentication state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [ user, setUser ] = useState<AuthUser | null>(null)
    const [ loading, setLoading ] = useState(true) // To avoid premature redirection
    const [ isPremium, setIsPremium ] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        // 🔹 Set persistence to 'local' so the user stays logged in
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                // 🔹 Listen for authentication state changes
                const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
                    if(currentUser) {
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email
                        });

                        // Check premium status
                        const userRef = doc(db, "users", currentUser.uid);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            setIsPremium(userSnap.data().isPremium || false);
                        }
                    } else {
                        setUser(null);
                        setIsPremium(false);
                    }
                    setLoading(false);
                });

                return () => unsubscribe();
            })
            .catch((error) => {
                console.error("Error setting auth persistence:", error);
            });
    }, [])

    const logout = async () => {
        try {
            setLoading(true)
            await signOut(auth)
            setUser(null)
            setIsPremium(false)
            toast({ title: "Success", description: "Disconnessione riuscita" });
        } catch (error) {
            toast({ title: 'Errore', description: 'Non ho potuto effetuare il logout' })
            console.error(error)
        }
        
    }

    return <AuthContext.Provider value={{user, loading, logout, isPremium}}>{ children }</AuthContext.Provider>
}

// Custom hook to access the authentication context
export const useAuth = () => useContext(AuthContext)